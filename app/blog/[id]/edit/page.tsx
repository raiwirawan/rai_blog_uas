"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Select from "react-select";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params?.id as string;

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState<"draft" | "published">("draft");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPreview, setShowPreview] = useState(false);
	const [categories, setCategories] = useState<{ id: string; name: string }[]>(
		[]
	);
	const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	useEffect(() => {
		const fetchPost = async () => {
			setLoading(true);
			setError("");
			setSuccess("");
			const { data, error } = await supabase
				.from("posts")
				.select("*")
				.eq("id", postId)
				.single();
			if (error) {
				setError(error.message);
			} else if (data) {
				setTitle(data.title);
				setContent(data.content);
				setStatus(data.status);
			} else {
				setError("Post not found.");
			}
			setLoading(false);
		};
		if (postId) fetchPost();
	}, [postId]);

	useEffect(() => {
		if (!postId) return;
		// Fetch kategori/tag
		supabase
			.from("categories")
			.select("*")
			.then(({ data }) => setCategories(data || []));
		supabase
			.from("tags")
			.select("*")
			.then(({ data }) => setTags(data || []));
		// Fetch relasi post
		supabase
			.from("post_categories")
			.select("category_id")
			.eq("post_id", postId)
			.then(({ data }) =>
				setSelectedCategories(data ? data.map((d) => d.category_id) : [])
			);
		supabase
			.from("post_tags")
			.select("tag_id")
			.eq("post_id", postId)
			.then(({ data }) =>
				setSelectedTags(data ? data.map((d) => d.tag_id) : [])
			);
	}, [postId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!title.trim() || !content.trim()) {
			setError("Title and content are required.");
			return;
		}
		setSaving(true);
		const { error } = await supabase
			.from("posts")
			.update({ title, content, status })
			.eq("id", postId);
		if (error) {
			setError(error.message);
		} else {
			setSuccess("Post updated successfully!");
			await supabase.from("post_categories").delete().eq("post_id", postId);
			if (selectedCategories.length > 0) {
				await supabase.from("post_categories").insert(
					selectedCategories.map((category_id) => ({
						post_id: postId,
						category_id,
					}))
				);
			}
			await supabase.from("post_tags").delete().eq("post_id", postId);
			if (selectedTags.length > 0) {
				await supabase
					.from("post_tags")
					.insert(selectedTags.map((tag_id) => ({ post_id: postId, tag_id })));
			}
			setTimeout(() => {
				router.push("/admin");
			}, 1200);
		}
		setSaving(false);
	};

	const handleCancel = () => {
		if (postId) {
			router.push(`/blog/${postId}`);
		} else {
			router.push("/admin");
		}
	};

	if (loading)
		return (
			<div className="flex justify-center items-center min-h-[300px]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
				<span className="text-blue-700 font-semibold">Loading post...</span>
			</div>
		);
	if (error)
		return <div className="text-red-600 text-center py-8">{error}</div>;

	return (
		<div className="max-w-xl mx-auto py-8">
			<h1 className="text-2xl font-bold mb-4">Edit Post</h1>
			<form
				onSubmit={handleSubmit}
				className="space-y-4 bg-white p-6 rounded shadow border border-gray-200"
			>
				{success && (
					<div className="bg-green-50 border border-green-200 text-green-800 rounded p-3 text-center">
						{success}
					</div>
				)}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-center">
						{error}
					</div>
				)}
				<div>
					<label className="block mb-1 font-medium">Title</label>
					<input
						className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						disabled={saving}
						maxLength={120}
						placeholder="Post title"
					/>
					<div className="text-xs text-gray-400 text-right">
						{title.length}/120
					</div>
				</div>
				<div>
					<label className="block mb-1 font-medium">Content</label>
					<textarea
						className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={10}
						required
						disabled={saving}
						maxLength={5000}
						placeholder="Write your post content here..."
					/>
					<div className="text-xs text-gray-400 text-right">
						{content.length}/5000
					</div>
				</div>
				<div className="flex items-center mb-2">
					<input
						id="published"
						type="checkbox"
						checked={status === "published"}
						onChange={(e) =>
							setStatus(e.target.checked ? "published" : "draft")
						}
						className="mr-2"
						disabled={saving}
					/>
					<label htmlFor="published">Published</label>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Categories</label>
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
						options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
						value={tags
							.filter((tag) => selectedTags.includes(tag.id))
							.map((tag) => ({ value: tag.id, label: tag.name }))}
						onChange={(opts) => setSelectedTags(opts.map((opt) => opt.value))}
						placeholder="Pilih tag"
						classNamePrefix="react-select"
					/>
				</div>
				<div className="flex gap-2">
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
						disabled={saving}
					>
						{saving ? "Saving..." : "Save Changes"}
					</button>
					<button
						type="button"
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 border border-gray-300"
						onClick={handleCancel}
						disabled={saving}
					>
						Cancel
					</button>
					<button
						type="button"
						className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100"
						onClick={() => setShowPreview((v) => !v)}
						disabled={saving}
					>
						{showPreview ? "Hide Preview" : "Preview"}
					</button>
				</div>
			</form>
			{showPreview && (
				<div className="mt-8 bg-gray-50 border border-gray-200 rounded p-4">
					<h2 className="text-lg font-semibold mb-2 text-blue-800">Preview</h2>
					<h3 className="text-xl font-bold mb-2">{title}</h3>
					<div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-line">
						{content || <span className="text-gray-400">(No content)</span>}
					</div>
					<div className="mt-4 text-xs text-gray-500">
						Status:{" "}
						<span
							className={
								status === "published" ? "text-green-700" : "text-yellow-700"
							}
						>
							{status}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
