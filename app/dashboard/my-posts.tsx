"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Post } from "@/types/supabase";

export default function MyPosts() {
	const { supabase } = useSupabase();
	const { user, loading: userLoading } = useSupabaseAuth();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Modal/form state (for add/edit)
	const [showForm, setShowForm] = useState(false);
	const [editPost, setEditPost] = useState<Post | null>(null);
	const [form, setForm] = useState({
		title: "",
		slug: "",
		content: "",
		is_published: false,
	});
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// Fetch posts milik user
	useEffect(() => {
		if (!user) return;
		setLoading(true);
		supabase
			.from("posts")
			.select("*")
			.eq("author_id", user.id)
			.order("created_at", { ascending: false })
			.then(({ data, error }) => {
				if (error) setError(error.message);
				else setPosts(data || []);
				setLoading(false);
			});
	}, [user, supabase]);

	// Handler CRUD (dummy, to be implemented)
	const handleAdd = () => {
		setEditPost(null);
		setForm({ title: "", slug: "", content: "", is_published: false });
		setShowForm(true);
	};
	const handleEdit = (post: Post) => {
		setEditPost(post);
		setForm({
			title: post.title,
			slug: post.slug,
			content: post.content,
			is_published: post.is_published,
		});
		setShowForm(true);
	};

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		const checked =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setFormError(null);
		if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
			setFormError("Title, slug, and content are required.");
			setSaving(false);
			return;
		}
		let result;
		if (editPost) {
			// Update
			result = await supabase
				.from("posts")
				.update({
					title: form.title,
					slug: form.slug,
					content: form.content,
					is_published: form.is_published,
				})
				.eq("id", editPost.id)
				.select()
				.single();
		} else {
			// Insert
			result = await supabase
				.from("posts")
				.insert({
					title: form.title,
					slug: form.slug,
					content: form.content,
					is_published: form.is_published,
					author_id: user!.id,
				})
				.select()
				.single();
		}
		const { data, error } = result;
		if (error) {
			setFormError(error.message);
			setSaving(false);
			return;
		}
		if (editPost) {
			setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
		} else {
			setPosts((prev) => [data, ...prev]);
		}
		setShowForm(false);
		setSaving(false);
	};

	// Delete handler (with confirmation)
	const handleDelete = async (postId: string) => {
		if (!confirm("Delete this post?")) return;
		const { error } = await supabase.from("posts").delete().eq("id", postId);
		if (!error) setPosts(posts.filter((p) => p.id !== postId));
		else alert(error.message);
	};

	if (!user) {
		return (
			<div className="text-red-600">User not found. Please login again.</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen py-8 px-2 sm:px-6 lg:px-8">
			<h2 className="text-2xl font-extrabold text-gray-900 mb-6">
				My Blog Posts
			</h2>
			<button
				className="mb-6 px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				onClick={handleAdd}
			>
				+ New Post
			</button>
			{loading || userLoading ? (
				<div className="text-gray-700">Loading...</div>
			) : error ? (
				<div className="text-red-700 bg-red-50 border border-red-200 p-4 rounded shadow">
					{error}
				</div>
			) : posts.length === 0 ? (
				<div className="bg-white text-gray-700 shadow p-6 rounded text-center border border-gray-200">
					You have no posts yet.
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded shadow">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Title
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Slug
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Published
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Created
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{posts.map((post) => (
								<tr key={post.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 border-b text-gray-800 font-medium">
										{post.title}
									</td>
									<td className="px-4 py-2 border-b text-blue-700 font-mono">
										{post.slug}
									</td>
									<td className="px-4 py-2 border-b text-gray-800">
										{post.is_published ? "Yes" : "No"}
									</td>
									<td className="px-4 py-2 border-b text-gray-700">
										{new Date(post.created_at).toLocaleString()}
									</td>
									<td className="px-4 py-2 border-b">
										<button
											className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
											onClick={() => handleEdit(post)}
										>
											Edit
										</button>
										<button
											className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
											onClick={() => handleDelete(post.id)}
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{/* Modal/Form for add/edit post */}
			{showForm && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded shadow-lg min-w-[350px] max-w-md w-full border border-gray-200">
						<h3 className="text-xl font-bold mb-4 text-gray-900">
							{editPost ? "Edit Post" : "New Post"}
						</h3>
						<form onSubmit={handleFormSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-800">
									Title
								</label>
								<input
									type="text"
									name="title"
									className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-gray-50"
									value={form.title}
									onChange={handleFormChange}
									disabled={saving}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-800">
									Slug
								</label>
								<input
									type="text"
									name="slug"
									className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 text-gray-900 bg-gray-50 font-mono"
									value={form.slug}
									onChange={handleFormChange}
									disabled={saving}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-800">
									Content
								</label>
								<textarea
									name="content"
									className="w-full border border-gray-300 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:border-blue-500 text-gray-900 bg-gray-50"
									value={form.content}
									onChange={handleFormChange}
									disabled={saving}
									required
								/>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									name="is_published"
									checked={form.is_published}
									onChange={handleFormChange}
									disabled={saving}
									id="is_published"
								/>
								<label
									htmlFor="is_published"
									className="ml-2 text-sm text-gray-800"
								>
									Published
								</label>
							</div>
							{formError && (
								<div className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">
									{formError}
								</div>
							)}
							<div className="flex justify-end mt-4">
								<button
									type="button"
									className="px-4 py-2 bg-gray-200 text-gray-900 rounded mr-2 hover:bg-gray-300 focus:outline-none"
									onClick={() => setShowForm(false)}
									disabled={saving}
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
									disabled={saving}
								>
									{saving ? "Saving..." : "Save"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
