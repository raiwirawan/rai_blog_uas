"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Post, UserProfile } from "@/types/supabase";

type PostWithAuthor = Post & { author: UserProfile };

export default function PostList() {
	const [posts, setPosts] = useState<PostWithAuthor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				// Fetch published posts with author information
				const { data, error } = await supabase
					.from("posts")
					.select(
						`
            *,
            author:author_id(id, display_name, username)
          `
					)
					.eq("is_published", true)
					.order("created_at", { ascending: false });

				if (error) throw error;

				setPosts(data as unknown as PostWithAuthor[]);
			} catch (err: unknown) {
				console.error("Error fetching posts:", err);
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("Failed to load posts");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchPosts();
	}, []);

	if (loading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
						<div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
						<div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
						<div className="h-3 bg-gray-200 rounded w-5/6"></div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 p-4 rounded-md border border-red-200">
				<div className="flex">
					<div className="flex-shrink-0">
						<svg
							className="h-5 w-5 text-red-500"
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
						<h3 className="text-sm font-semibold text-red-800">
							Error loading posts
						</h3>
						<div className="mt-2 text-sm text-red-700">
							<p>{error}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (posts.length === 0) {
		return (
			<div className="bg-white shadow rounded-lg p-6 text-center border border-gray-200">
				<p className="text-gray-700">No posts found.</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{posts.map((post) => (
				<article
					key={post.id}
					className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
				>
					<div className="p-6">
						<Link href={`/blog/${post.id}`}>
							<h2 className="text-2xl font-bold text-blue-800 hover:text-blue-600 transition-colors duration-200">
								{post.title}
							</h2>
						</Link>

						<div className="mt-2 flex items-center text-sm text-gray-700">
							<span>
								By{" "}
								{post.author?.display_name ||
									post.author?.username ||
									"Unknown author"}
							</span>
							<span className="mx-1">•</span>
							<time dateTime={post.created_at} className="text-gray-500">
								{new Date(post.created_at).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</time>
						</div>

						<div className="mt-4 text-gray-800">
							{/* Display a preview of the content */}
							<p>
								{post.content.length > 200
									? `${post.content.substring(0, 200)}...`
									: post.content}
							</p>
						</div>

						<div className="mt-6">
							<Link
								href={`/blog/${post.id}`}
								className="text-blue-700 hover:text-blue-900 font-semibold"
							>
								Read more →
							</Link>
						</div>
					</div>
				</article>
			))}
		</div>
	);
}
