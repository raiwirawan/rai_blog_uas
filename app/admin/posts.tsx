import React, { useState, useEffect } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
	FileText,
	Edit,
	Trash2,
	Calendar,
	User,
	Shield,
	AlertCircle,
	Search,
	Filter,
	Copy,
	UserCheck,
} from "lucide-react";

interface BlogPost {
	id: string;
	title: string;
	content: string;
	author_id: string;
	created_at: string;
	updated_at: string;
	status: "draft" | "published";
	author?: {
		username: string;
		display_name: string;
		email: string;
		role?: string;
	};
}

interface AdminPostsProps {
	isSuperAdmin?: boolean;
}

const AdminPosts: React.FC<AdminPostsProps> = ({ isSuperAdmin }) => {
	const { supabase } = useSupabase();
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<
		"all" | "draft" | "published"
	>("all");
	const [authorRoleFilter, setAuthorRoleFilter] = useState<string>("all");
	const [actionLoading, setActionLoading] = useState<string>(""); // post id
	const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
	const [copiedId, setCopiedId] = useState<string>("");

	useEffect(() => {
		const fetchPosts = async () => {
			setLoading(true);
			setError(null);
			setSuccess("");
			try {
				let query = supabase
					.from("posts")
					.select(`*, author:users(username, display_name, email, role)`)
					.order("created_at", { ascending: false });
				if (statusFilter !== "all") {
					query = query.eq("status", statusFilter);
				}
				const { data, error } = await query;
				if (error) {
					setError(error.message);
					setPosts([]);
				} else {
					setPosts(data || []);
				}
			} catch {
				setError("Failed to load posts.");
				setPosts([]);
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, [supabase, statusFilter]);

	const handleDelete = async (post: BlogPost) => {
		if (
			!confirm(
				`Are you sure you want to delete post: "${post.title}"? This action cannot be undone.`
			)
		) {
			return;
		}
		setActionLoading(post.id);
		setError(null);
		setSuccess("");
		try {
			const { error } = await supabase.from("posts").delete().eq("id", post.id);
			if (error) {
				setError(error.message);
			} else {
				setPosts((prev) => prev.filter((p) => p.id !== post.id));
				setSuccess("Post deleted successfully.");
			}
		} catch {
			setError("Failed to delete post.");
		} finally {
			setActionLoading("");
		}
	};

	const handleStatusToggle = async (post: BlogPost) => {
		const newStatus = post.status === "published" ? "draft" : "published";
		setActionLoading(post.id);
		setError(null);
		setSuccess("");
		try {
			const { error } = await supabase
				.from("posts")
				.update({ status: newStatus })
				.eq("id", post.id);
			if (error) {
				setError(error.message);
			} else {
				setPosts((prev) =>
					prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
				);
				setSuccess(`Post status updated to ${newStatus}.`);
			}
		} catch {
			setError("Failed to update post status.");
		} finally {
			setActionLoading("");
		}
	};

	const handleCopyId = (id: string) => {
		navigator.clipboard.writeText(id);
		setCopiedId(id);
		setTimeout(() => setCopiedId(""), 1200);
	};

	const filteredPosts = posts.filter((post) => {
		const matchSearch =
			post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			post.author?.display_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchRole =
			authorRoleFilter === "all" || post.author?.role === authorRoleFilter;
		return matchSearch && matchRole;
	});

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusBadge = (status: string) => {
		const baseClasses =
			"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
		switch (status) {
			case "published":
				return `${baseClasses} bg-green-100 text-green-800`;
			case "draft":
				return `${baseClasses} bg-yellow-100 text-yellow-800`;
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`;
		}
	};

	const getRoleBadge = (role?: string) => {
		const baseClasses =
			"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
		switch (role) {
			case "superadmin":
				return `${baseClasses} bg-purple-100 text-purple-800`;
			case "admin":
				return `${baseClasses} bg-blue-100 text-blue-800`;
			case "user":
				return `${baseClasses} bg-gray-100 text-gray-800`;
			default:
				return `${baseClasses} bg-gray-50 text-gray-400`;
		}
	};

	return (
		<div className="space-y-6">
			<Card className="bg-blue-50 border-blue-200">
				<CardContent className="p-4">
					<div className="flex items-start space-x-3">
						<Shield className="h-5 w-5 text-blue-600 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-blue-900">
								{isSuperAdmin ? "Superadmin Access:" : "Admin Access:"}
							</p>
							<p className="text-sm text-blue-700">
								Edit, publish/unpublish, preview, and delete any blog post. Use
								filters and search for easier management.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{(error || success) && (
				<Card
					className={
						error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
					}
				>
					<CardContent className="p-4 text-center">
						{error && (
							<div className="flex items-center justify-center space-x-2 text-red-800">
								<AlertCircle className="h-5 w-5" />
								<span>{error}</span>
							</div>
						)}
						{success && (
							<div className="flex items-center justify-center space-x-2 text-green-800">
								<UserCheck className="h-5 w-5" />
								<span>{success}</span>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						placeholder="Search posts by title or author..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
				<div className="flex items-center space-x-2">
					<Filter className="h-4 w-4 text-gray-500" />
					<select
						value={statusFilter}
						onChange={(e) =>
							setStatusFilter(e.target.value as "all" | "draft" | "published")
						}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="published">Published</option>
						<option value="draft">Draft</option>
					</select>
					<select
						value={authorRoleFilter}
						onChange={(e) => setAuthorRoleFilter(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Roles</option>
						<option value="user">User</option>
						<option value="admin">Admin</option>
						<option value="superadmin">Superadmin</option>
					</select>
				</div>
			</div>

			<div className="space-y-4">
				{loading ? (
					<div className="space-y-4">
						<LoadingSkeleton className="h-8 w-48" />
						<div className="grid gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<LoadingSkeleton key={i} className="h-32 w-full" />
							))}
						</div>
					</div>
				) : filteredPosts.length === 0 ? (
					<Card>
						<CardContent className="p-8 text-center">
							<FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{searchTerm ||
								statusFilter !== "all" ||
								authorRoleFilter !== "all"
									? "No posts found"
									: "No blog posts found"}
							</h3>
							<p className="text-gray-500">
								{searchTerm ||
								statusFilter !== "all" ||
								authorRoleFilter !== "all"
									? "Try adjusting your search or filter criteria."
									: "No blog posts have been created yet."}
							</p>
						</CardContent>
					</Card>
				) : (
					filteredPosts.map((post) => (
						<Card key={post.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											<h3 className="text-lg font-semibold text-gray-900">
												{post.title}
											</h3>
											<span className={getStatusBadge(post.status)}>
												{post.status}
											</span>
										</div>
										<div className="flex items-center space-x-2 mb-2">
											<span className={getRoleBadge(post.author?.role)}>
												{post.author?.role || "-"}
											</span>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleCopyId(post.id)}
												title="Copy Post ID"
												disabled={actionLoading === post.id}
											>
												{copiedId === post.id ? (
													<span className="text-green-600 text-xs font-semibold">
														Copied!
													</span>
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
										<div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
											<div className="flex items-center space-x-1">
												<User className="h-4 w-4" />
												<span>
													{post.author?.display_name ||
														post.author?.username ||
														"Unknown Author"}
												</span>
											</div>
											<div className="flex items-center space-x-1">
												<Calendar className="h-4 w-4" />
												<span>{formatDate(post.created_at)}</span>
											</div>
										</div>
										<p className="text-gray-700 line-clamp-3">
											{post.content.length > 200
												? `${post.content.substring(0, 200)}...`
												: post.content}
										</p>
									</div>
									<div className="flex flex-col items-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleStatusToggle(post)}
											disabled={actionLoading === post.id}
										>
											{actionLoading === post.id
												? "..."
												: post.status === "published"
												? "Unpublish"
												: "Publish"}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPreviewPost(post)}
											disabled={actionLoading === post.id}
										>
											Eye Preview
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												window.open(`/blog/${post.id}/edit`, "_blank")
											}
											disabled={actionLoading === post.id}
										>
											<Edit className="h-4 w-4 mr-1" />
											Edit
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(post)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
											disabled={actionLoading === post.id}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
							{previewPost?.id === post.id && (
								<div className="bg-gray-50 border-t border-gray-200 p-4 mt-2 rounded">
									<h4 className="text-lg font-semibold mb-2 text-blue-800">
										Preview: {post.title}
									</h4>
									<div className="prose prose-blue max-w-none text-gray-800 whitespace-pre-line mb-2">
										{post.content || (
											<span className="text-gray-400">(No content)</span>
										)}
									</div>
									<div className="flex justify-between text-xs text-gray-500">
										<span>
											Status:{" "}
											<span
												className={
													post.status === "published"
														? "text-green-700"
														: "text-yellow-700"
												}
											>
												{post.status}
											</span>
										</span>
										<span>
											Author:{" "}
											{post.author?.display_name ||
												post.author?.username ||
												"-"}{" "}
											({post.author?.role || "-"})
										</span>
									</div>
									<Button
										size="sm"
										variant="ghost"
										className="mt-2"
										onClick={() => setPreviewPost(null)}
									>
										Close Preview
									</Button>
								</div>
							)}
						</Card>
					))
				)}
			</div>

			{filteredPosts.length > 0 && (
				<Card className="bg-gray-50">
					<CardContent className="p-4">
						<div className="flex items-center justify-between text-sm text-gray-600">
							<span>
								Showing {filteredPosts.length} of {posts.length} posts
							</span>
							<span>
								{filteredPosts.filter((p) => p.status === "published").length}{" "}
								published,{" "}
								{filteredPosts.filter((p) => p.status === "draft").length}{" "}
								drafts
							</span>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default AdminPosts;
