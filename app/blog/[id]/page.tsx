"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Post, UserProfile, Category, Tag } from "@/types/supabase";

type PostWithDetails = Post & {
	author: UserProfile;
	categories: Category[];
	tags: Tag[];
};

export default function BlogPostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [post, setPost] = useState<PostWithDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const fetchPost = async () => {
			try {
				// Fetch the post with author information
				const { data: postData, error: postError } = await supabase
					.from("posts")
					.select(
						`
            *,
            author:author_id(id, display_name, username, email)
          `
					)
					.eq("id", id)
					.single();

				if (postError) throw postError;
				if (!postData) throw new Error("Post not found");

				// Check if post is published
				if (!postData.is_published) {
					// Check if user is author or admin to view unpublished post
					const {
						data: { session },
					} = await supabase.auth.getSession();
					const userId = session?.user?.id;

					if (!userId || userId !== postData.user_id) {
						// Get user role
						const { data: userData } = await supabase
							.from("users")
							.select("role")
							.eq("id", userId)
							.single();

						// If not admin or superadmin, redirect
						if (
							!userData ||
							(userData.role !== "admin" && userData.role !== "superadmin")
						) {
							router.push("/blog");
							return;
						}
					}
				}

				// Fetch categories for this post
				const { data: categoriesData } = await supabase
					.from("post_categories")
					.select(
						`
            category:category_id(id, name, slug)
          `
					)
					.eq("post_id", id);

				// Fetch tags for this post
				const { data: tagsData } = await supabase
					.from("post_tags")
					.select(
						`
            tag:tag_id(id, name, slug)
          `
					)
					.eq("post_id", id);

				// Combine all data
				const categories = categoriesData
					? categoriesData.flatMap(
							(item: { category: Category[] }) => item.category
					  )
					: [];
				const tags = tagsData
					? tagsData.flatMap((item: { tag: Tag[] }) => item.tag)
					: [];

				setPost({
					...postData,
					categories,
					tags,
				} as PostWithDetails);
			} catch (err: unknown) {
				console.error("Error fetching post:", err);
				if (err instanceof Error) {
					setError(err.message || "Failed to load post");
				} else if (
					err &&
					typeof err === "object" &&
					"message" in (err as Record<string, unknown>)
				) {
					setError(
						(err as { message?: string }).message || "Failed to load post"
					);
				} else {
					setError("Failed to load post");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchPost();
	}, [id, router]);

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
					<div className="space-y-3">
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-5/6"></div>
						<div className="h-4 bg-gray-200 rounded w-full"></div>
						<div className="h-4 bg-gray-200 rounded w-4/6"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<div className="bg-red-50 p-4 rounded-md">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-red-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">
								Error loading post
							</h3>
							<div className="mt-2 text-sm text-red-700">
								<p>{error || "Post not found"}</p>
							</div>
							<div className="mt-4">
								<Link
									href="/blog"
									className="text-sm font-medium text-red-800 hover:text-red-700"
								>
									← Back to blog
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
			<article className="bg-white rounded-lg shadow border border-gray-200 p-8">
				<header className="mb-8">
					<Link
						href="/blog"
						className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
					>
						← Back to blog
					</Link>

					<h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
						{post.title}
					</h1>

					<div className="mt-3 flex items-center text-gray-500">
						<span>
							By{" "}
							{post.author?.display_name ||
								post.author?.username ||
								"Unknown author"}
						</span>
						<span className="mx-1">•</span>
						<time dateTime={post.created_at}>
							{new Date(post.created_at).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>

						{!post.is_published && (
							<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								Draft
							</span>
						)}
					</div>
				</header>

				<div className="prose prose-lg max-w-none text-gray-900">
					{/* Display the content with proper formatting */}
					{post.content.split("\n").map((paragraph, index) => (
						<p key={index}>{paragraph}</p>
					))}
				</div>

				<footer className="mt-12 pt-6 border-t border-gray-200">
					<div className="flex flex-wrap gap-2">
						{post.categories.length > 0 && (
							<div className="mr-6">
								<h3 className="text-sm font-medium text-gray-900">
									Categories:
								</h3>
								<div className="mt-2 flex flex-wrap gap-2">
									{post.categories.map((category) => (
										<span
											key={category.id}
											className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
										>
											{category.name}
										</span>
									))}
								</div>
							</div>
						)}

						{post.tags.length > 0 && (
							<div>
								<h3 className="text-sm font-medium text-gray-900">Tags:</h3>
								<div className="mt-2 flex flex-wrap gap-2">
									{post.tags.map((tag) => (
										<span
											key={tag.id}
											className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
										>
											{tag.name}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</footer>
			</article>
		</div>
	);
}
