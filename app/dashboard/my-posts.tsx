"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Post as PostType, Category, Tag } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";
import Select from "react-select";

// Tambahkan status ke tipe Post lokal jika belum ada
type Post = PostType & { status?: string };

export default function MyPosts() {
	const { supabase } = useSupabase();
	const { user, loading: userLoading, profile } = useSupabaseAuth();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string>("");

	// Modal/form state (for add/edit)
	const [showForm, setShowForm] = useState(false);
	const [editPost, setEditPost] = useState<Post | null>(null);
	const [form, setForm] = useState({
		title: "",
		slug: "",
		content: "",
		status: "draft",
	});
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [categories, setCategories] = useState<Category[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

	// Fetch categories & tags saat form dibuka
	useEffect(() => {
		if (!showForm) return;
		supabase
			.from("categories")
			.select("*")
			.then(({ data }) => setCategories(data || []));
		supabase
			.from("tags")
			.select("*")
			.then(({ data }) => setTags(data || []));
	}, [showForm, supabase]);

	// Handler CRUD (dummy, to be implemented)
	const handleAdd = () => {
		setEditPost(null);
		setForm({ title: "", slug: "", content: "", status: "draft" });
		setSelectedCategories([]);
		setSelectedTags([]);
		setFormError(null);
		setShowForm(true);
	};
	const handleEdit = async (post: Post) => {
		setEditPost(post);
		setForm({
			title: post.title,
			slug: post.slug,
			content: post.content ?? "",
			status: post.status || "draft",
		});
		setFormError(null);
		setSaving(true);
		// Fetch relasi kategori dan tag dari Supabase
		const [{ data: catData }, { data: tagData }] = await Promise.all([
			supabase
				.from("post_categories")
				.select("category_id")
				.eq("post_id", post.id),
			supabase.from("post_tags").select("tag_id").eq("post_id", post.id),
		]);
		setSelectedCategories(
			catData ? catData.map((d: { category_id: string }) => d.category_id) : []
		);
		setSelectedTags(
			tagData ? tagData.map((d: { tag_id: string }) => d.tag_id) : []
		);
		setSaving(false);
		setShowForm(true);
	};

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		if (name === "published") {
			setForm((prev) => ({
				...prev,
				status: (e.target as HTMLInputElement).checked ? "published" : "draft",
			}));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setFormError(null);
		setSuccess("");
		if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
			setFormError("Title, slug, and content are required.");
			setSaving(false);
			return;
		}
		let result;
		let postId = editPost?.id;
		if (editPost) {
			result = await supabase
				.from("posts")
				.update({
					title: form.title,
					slug: form.slug,
					content: form.content,
					status: form.status,
				})
				.eq("id", editPost.id)
				.select()
				.single();
		} else {
			result = await supabase
				.from("posts")
				.insert({
					title: form.title,
					slug: form.slug,
					content: form.content,
					status: form.status,
					author_id: user!.id,
				})
				.select()
				.single();
			postId = result.data?.id;
		}
		const { data, error } = result;
		if (error || !postId) {
			setFormError(error?.message || "Failed to save post.");
			setSaving(false);
			return;
		}
		// Simpan relasi kategori
		await supabase.from("post_categories").delete().eq("post_id", postId);
		if (selectedCategories.length > 0) {
			await supabase.from("post_categories").insert(
				selectedCategories.map((category_id) => ({
					post_id: postId,
					category_id,
				}))
			);
		}
		// Simpan relasi tag
		await supabase.from("post_tags").delete().eq("post_id", postId);
		if (selectedTags.length > 0) {
			await supabase
				.from("post_tags")
				.insert(selectedTags.map((tag_id) => ({ post_id: postId, tag_id })));
		}
		if (editPost) {
			setPosts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
			setSuccess("Post updated successfully!");
		} else {
			setPosts((prev) => [data, ...prev]);
			setSuccess("Post created successfully!");
		}
		setShowForm(false);
		setSaving(false);
	};

	// Delete handler (with confirmation)
	const handleDelete = async (postId: string) => {
		if (!confirm("Delete this post?")) return;
		setLoading(true);
		const { error } = await supabase.from("posts").delete().eq("id", postId);
		if (!error) {
			setPosts(posts.filter((p) => p.id !== postId));
			setSuccess("Post deleted successfully!");
		} else {
			setError(error.message);
		}
		setLoading(false);
	};

	if (!user) {
		return (
			<div className="text-red-600">User not found. Please login again.</div>
		);
	}

	return (
		<div className="container mx-auto py-8 min-h-screen">
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="text-3xl font-extrabold flex items-center gap-2">
						<span role="img" aria-label="wave">
							👋
						</span>
						Welcome,{" "}
						<span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
							{profile?.display_name || profile?.username || user.email}
						</span>
						!
					</CardTitle>
					<div className="mt-2">
						<p className="text-muted-foreground text-base">
							Manage your blog posts easily from your dashboard.
						</p>
					</div>
				</CardHeader>
				<CardContent>
					<Button onClick={handleAdd} className="mb-4">
						<Plus className="h-4 w-4 mr-2" /> New Post
					</Button>
					{success && (
						<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded flex items-center gap-2">
							<CheckCircle className="h-4 w-4" /> {success}
						</div>
					)}
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
							<AlertCircle className="h-4 w-4" /> {error}
						</div>
					)}
					{loading || userLoading ? (
						<div className="space-y-4">
							<LoadingSkeleton className="h-8 w-48" />
							<div className="grid gap-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<LoadingSkeleton key={i} className="h-20 w-full" />
								))}
							</div>
						</div>
					) : posts.length === 0 ? (
						<div className="bg-white text-gray-700 shadow p-6 rounded text-center border border-gray-200">
							You have no posts yet.
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{posts.map((post) => (
								<Card
									key={post.id}
									className="hover:shadow-md transition-shadow"
								>
									<CardContent className="p-4">
										<h3 className="font-semibold text-lg text-blue-800 mb-1">
											{post.title}
										</h3>
										<p className="text-sm text-gray-500 mb-2">
											Slug: <span className="font-mono">{post.slug}</span>
										</p>
										<p className="text-gray-700 line-clamp-3 mb-2">
											{(post.content?.length ?? 0) > 120
												? `${(post.content ?? "").substring(0, 120)}...`
												: post.content ?? ""}
										</p>
										<div className="flex items-center gap-2 text-xs mb-2">
											<span
												className={
													post.status === "published"
														? "bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
														: "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
												}
											>
												{post.status}
											</span>
											<span className="text-gray-400">
												{new Date(post.created_at).toLocaleDateString()}
											</span>
										</div>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleEdit(post)}
											>
												<Edit className="h-4 w-4 mr-1" /> Edit
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleDelete(post.id)}
											>
												<Trash2 className="h-4 w-4" /> Delete
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Modal Form */}
			{showForm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
					style={{ backdropFilter: "blur(2px)" }}
					onClick={() => !saving && setShowForm(false)}
					aria-modal="true"
					role="dialog"
				>
					<div
						className="relative w-full max-w-md min-h-[300px] h-auto max-h-[80vh] bg-white rounded-2xl shadow-2xl animate-fadeInScale flex flex-col pt-6 pb-6"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
							onClick={() => !saving && setShowForm(false)}
							aria-label="Close"
							tabIndex={0}
						>
							<X className="h-6 w-6" />
						</button>
						<CardHeader>
							<CardTitle>{editPost ? "Edit Post" : "New Post"}</CardTitle>
						</CardHeader>
						<CardContent className="overflow-y-auto flex-1">
							<form onSubmit={handleFormSubmit} className="space-y-4">
								{formError && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 flex items-center gap-2">
										<AlertCircle className="h-4 w-4" /> {formError}
									</div>
								)}
								<div>
									<label className="block text-sm font-medium mb-1">
										Title
									</label>
									<input
										type="text"
										name="title"
										value={form.title}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
										maxLength={120}
										placeholder="Post title"
										disabled={saving}
									/>
									<div className="text-xs text-gray-400 text-right">
										{form.title.length}/120
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Slug</label>
									<input
										type="text"
										name="slug"
										value={form.slug}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
										maxLength={120}
										placeholder="post-title"
										disabled={saving}
									/>
									<div className="text-xs text-gray-400 text-right">
										{form.slug.length}/120
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Content
									</label>
									<textarea
										name="content"
										value={form.content ?? ""}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										rows={8}
										required
										maxLength={5000}
										placeholder="Write your post content here..."
										disabled={saving}
									/>
									<div className="text-xs text-gray-400 text-right">
										{form.content.length}/5000
									</div>
								</div>
								<div className="flex items-center mb-2">
									<input
										type="checkbox"
										name="published"
										checked={form.status === "published"}
										onChange={handleFormChange}
										id="published"
										className="mr-2"
										disabled={saving}
									/>
									<label htmlFor="published">Published</label>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Categories
									</label>
									<Select
										isMulti
										options={categories.map((cat) => ({
											value: cat.id,
											label: cat.name,
										}))}
										value={categories
											.filter((cat) => selectedCategories.includes(cat.id))
											.map((cat) => ({ value: cat.id, label: cat.name }))}
										onChange={(opts) =>
											setSelectedCategories(opts.map((opt) => opt.value))
										}
										placeholder="Pilih kategori"
										classNamePrefix="react-select"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Tags</label>
									<Select
										isMulti
										options={tags.map((tag) => ({
											value: tag.id,
											label: tag.name,
										}))}
										value={tags
											.filter((tag) => selectedTags.includes(tag.id))
											.map((tag) => ({ value: tag.id, label: tag.name }))}
										onChange={(opts) =>
											setSelectedTags(opts.map((opt) => opt.value))
										}
										placeholder="Pilih tag"
										classNamePrefix="react-select"
									/>
								</div>
								<div className="flex gap-2 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowForm(false)}
										disabled={saving}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={saving}>
										{saving ? "Saving..." : editPost ? "Update" : "Create"}
									</Button>
								</div>
							</form>
						</CardContent>
					</div>
					<style jsx global>{`
						@keyframes fadeInScale {
							0% {
								opacity: 0;
								transform: scale(0.95);
							}
							100% {
								opacity: 1;
								transform: scale(1);
							}
						}
						.animate-fadeInScale {
							animation: fadeInScale 0.18s cubic-bezier(0.4, 0, 0.2, 1);
						}
					`}</style>
				</div>
			)}
		</div>
	);
}
