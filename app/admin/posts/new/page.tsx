"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/utils/supabase";

export default function NewPostPage() {
	const { user, isAdmin, isSuperAdmin, loading } = useSupabaseAuth();
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isPublished, setIsPublished] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title || !content) {
			setError("Title and content are required");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			// Use the imported supabase client directly

			// Insert post
			const { error: postError } = await supabase
				.from("posts")
				.insert({
					title,
					content,
					user_id: user?.id,
					is_published: isPublished,
				})
				.select()
				.single();

			if (postError) throw postError;

			// Redirect to admin page
			router.push("/admin");
		} catch (error: unknown) {
			if (error instanceof Error) {
				setError(error.message || "An error occurred while creating the post");
			} else {
				setError("An error occurred while creating the post");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<p className="text-lg">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAdmin && !isSuperAdmin) {
		return (
			<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<p className="text-lg text-red-600">
						You don&#39;t have permission to access this page
					</p>
					<Link
						href="/"
						className="mt-4 inline-block text-blue-600 hover:underline"
					>
						Go back to home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold leading-tight text-gray-900">
					Create New Post
				</h1>
				<Link
					href="/admin"
					className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
				>
					Back to Admin
				</Link>
			</div>

			{error && (
				<div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
					{error}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6 bg-white p-6 shadow rounded-lg"
			>
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700"
					>
						Title
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder="Post title"
					/>
				</div>

				<div>
					<label
						htmlFor="content"
						className="block text-sm font-medium text-gray-700"
					>
						Content
					</label>
					<textarea
						id="content"
						rows={10}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder="Write your post content here..."
					/>
				</div>

				<div className="flex items-center">
					<input
						id="is-published"
						type="checkbox"
						checked={isPublished}
						onChange={(e) => setIsPublished(e.target.checked)}
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label
						htmlFor="is-published"
						className="ml-2 block text-sm text-gray-900"
					>
						Publish immediately
					</label>
				</div>

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Creating..." : "Create Post"}
					</button>
				</div>
			</form>
		</div>
	);
}
