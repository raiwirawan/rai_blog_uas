"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Post, UserProfile, Category, Tag } from "@/types/supabase";

type PostWithAuthor = Post & { author: UserProfile };

export default function PostList() {
	const [posts, setPosts] = useState<PostWithAuthor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [categories, setCategories] = useState<Category[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [tagFilter, setTagFilter] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch categories & tags on mount
	useEffect(() => {
		supabase
			.from("categories")
			.select("*")
			.then(({ data }) => setCategories(data || []));
		supabase
			.from("tags")
			.select("*")
			.then(({ data }) => setTags(data || []));
	}, []);

	// Fetch posts with filter/search
	useEffect(() => {
		const fetchPosts = async () => {
			setLoading(true);
			setError("");
			try {
				let postIdsByCategory: string[] | null = null;
				let postIdsByTag: string[] | null = null;
				if (categoryFilter) {
					const { data } = await supabase
						.from("post_categories")
						.select("post_id")
						.eq("category_id", categoryFilter);
					postIdsByCategory = data?.map((d) => d.post_id) || [];
				}
				if (tagFilter) {
					const { data } = await supabase
						.from("post_tags")
						.select("post_id")
						.eq("tag_id", tagFilter);
					postIdsByTag = data?.map((d) => d.post_id) || [];
				}
				let query = supabase
					.from("posts")
					.select(
						`*, author:author_id(id, display_name, username), post_categories(category_id), post_tags(tag_id)`
					)
					.eq("status", "published")
					.order("created_at", { ascending: false });
				if (postIdsByCategory && postIdsByCategory.length === 0) {
					setPosts([]);
					setLoading(false);
					return;
				}
				if (postIdsByTag && postIdsByTag.length === 0) {
					setPosts([]);
					setLoading(false);
					return;
				}
				if (postIdsByCategory) {
					query = query.in("id", postIdsByCategory);
				}
				if (postIdsByTag) {
					query = query.in("id", postIdsByTag);
				}
				const { data, error } = await query;
				if (error) throw error;
				// Map categories and tags to each post
				const categoryMap = Object.fromEntries(
					categories.map((c) => [c.id, c])
				);
				const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));
				let filtered = (data || []).map((post) => ({
					...post,
					categories: post.post_categories
						? post.post_categories
								.map(
									(pc: { category_id: string }) => categoryMap[pc.category_id]
								)
								.filter(Boolean)
						: [],
					tags: post.post_tags
						? post.post_tags
								.map((pt: { tag_id: string }) => tagMap[pt.tag_id])
								.filter(Boolean)
						: [],
				}));
				// Search filter (client-side)
				if (searchTerm.trim()) {
					const term = searchTerm.toLowerCase();
					filtered = filtered.filter(
						(post) =>
							post.title.toLowerCase().includes(term) ||
							post.author?.display_name?.toLowerCase().includes(term) ||
							post.author?.username?.toLowerCase().includes(term)
					);
				}
				setPosts(filtered);
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
	}, [categoryFilter, tagFilter, searchTerm, categories, tags]);

	// UI
	return (
		<div className="space-y-8">
			{/* Filter & Search Bar */}
			<div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
				<input
					type="text"
					placeholder="Search posts by title or author..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				/>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<option value="">All Categories</option>
					{categories.map((cat) => (
						<option key={cat.id} value={cat.id}>
							{cat.name}
						</option>
					))}
				</select>
				<select
					value={tagFilter}
					onChange={(e) => setTagFilter(e.target.value)}
					className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<option value="">All Tags</option>
					{tags.map((tag) => (
						<option key={tag.id} value={tag.id}>
							{tag.name}
						</option>
					))}
				</select>
				{(categoryFilter || tagFilter || searchTerm) && (
					<button
						onClick={() => {
							setCategoryFilter("");
							setTagFilter("");
							setSearchTerm("");
						}}
						className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-200"
					>
						Clear
					</button>
				)}
			</div>
			{/* Loading, Error, Empty State */}
			{loading ? (
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="bg-white shadow rounded-lg p-6 animate-pulse"
						>
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
							<div className="h-3 bg-gray-200 rounded w-5/6"></div>
						</div>
					))}
				</div>
			) : error ? (
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
			) : posts.length === 0 ? (
				<div className="bg-white shadow rounded-lg p-6 text-center border border-gray-200">
					<p className="text-gray-700">No posts found.</p>
				</div>
			) : (
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
									<p>
										{(post.content?.length ?? 0) > 200
											? `${post.content?.substring(0, 200)}...`
											: post.content ?? ""}
									</p>
								</div>
								{/* Categories & Tags */}
								<div className="mt-4 flex flex-wrap gap-4">
									{post.categories && post.categories.length > 0 && (
										<div className="flex flex-wrap gap-2 items-center">
											<span className="text-xs font-semibold text-gray-500">
												Categories:
											</span>
											{post.categories.map((cat) => (
												<span
													key={cat.id}
													className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
												>
													{cat.name}
												</span>
											))}
										</div>
									)}
									{post.tags && post.tags.length > 0 && (
										<div className="flex flex-wrap gap-2 items-center">
											<span className="text-xs font-semibold text-gray-500">
												Tags:
											</span>
											{post.tags.map((tag) => (
												<span
													key={tag.id}
													className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
												>
													{tag.name}
												</span>
											))}
										</div>
									)}
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
			)}
		</div>
	);
}
