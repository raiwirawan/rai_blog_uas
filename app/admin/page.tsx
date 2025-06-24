"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import AdminUsers from "./users";
import AdminPosts from "./posts";
import { Shield, Users, FileText, AlertTriangle, Home } from "lucide-react";

export default function AdminPage() {
	const { isAdmin, isSuperAdmin, loading, user, profile } = useSupabaseAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(isSuperAdmin ? "users" : "posts");
	const [accessChecked, setAccessChecked] = useState(false);

	useEffect(() => {
		// Only check access after loading is complete and we have user data
		if (!loading && user) {
			console.log("Checking admin access:", {
				isAdmin,
				isSuperAdmin,
				userRole: profile?.role,
				userId: user.id,
			});

			if (!isAdmin && !isSuperAdmin) {
				console.log("Access denied - redirecting to home");
				router.push("/");
			} else {
				console.log("Access granted - user is admin/superadmin");
			}
			setAccessChecked(true);
		}
	}, [loading, isAdmin, isSuperAdmin, user, profile, router]);

	// Show loading while checking authentication
	if (loading || !accessChecked) {
		return (
			<div className="container mx-auto py-12 px-4">
				<div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
					<div className="flex items-center space-x-2">
						<Shield className="h-8 w-8 text-blue-600 animate-pulse" />
						<h1 className="text-2xl font-bold text-gray-900">
							Checking Admin Access
						</h1>
					</div>
					<LoadingSkeleton className="h-8 w-64" />
					<p className="text-muted-foreground">
						Verifying your admin privileges...
					</p>
				</div>
			</div>
		);
	}

	// Show access denied if user is not admin
	if (!isAdmin && !isSuperAdmin) {
		return (
			<div className="container mx-auto py-12 px-4">
				<div className="max-w-md mx-auto">
					<Card className="border-red-200 bg-red-50">
						<CardHeader className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
								<AlertTriangle className="h-6 w-6 text-red-600" />
							</div>
							<CardTitle className="text-red-800">Access Denied</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-center text-red-700">
								You don&apos;t have admin privileges to access this page.
							</p>

							<div className="bg-white p-4 rounded-lg border border-red-200 space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="font-medium">User ID:</span>
									<span className="text-gray-600">{user?.id}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">User Role:</span>
									<span className="text-gray-600">
										{profile?.role || "No role found"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Is Admin:</span>
									<span className="text-gray-600">
										{isAdmin ? "Yes" : "No"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Is Super Admin:</span>
									<span className="text-gray-600">
										{isSuperAdmin ? "Yes" : "No"}
									</span>
								</div>
							</div>

							<div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
								<p className="text-sm text-blue-800">
									💡 <strong>Tip:</strong> Use the Debug Panel in the navigation
									menu to troubleshoot authentication issues.
								</p>
							</div>

							<Button
								onClick={() => router.push("/")}
								className="w-full"
								variant="outline"
							>
								<Home className="mr-2 h-4 w-4" />
								Go to Home
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Show admin dashboard
	return (
		<div className="container mx-auto py-8 px-4">
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex items-center space-x-3 mb-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
						<Shield className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							{isSuperAdmin ? "Superadmin Dashboard" : "Admin Dashboard"}
						</h1>
						<p className="text-muted-foreground">
							Welcome back,{" "}
							{profile?.display_name || profile?.username || user?.email}!
						</p>
					</div>
				</div>

				<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
									{profile?.display_name?.charAt(0) ||
										profile?.username?.charAt(0) ||
										user?.email?.charAt(0)}
								</div>
								<div>
									<p className="font-medium text-gray-900">
										{profile?.display_name || profile?.username || user?.email}
									</p>
									<p className="text-sm text-muted-foreground">
										Role:{" "}
										<span className="font-semibold text-blue-600">
											{profile?.role}
										</span>
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm text-muted-foreground">Access Level</p>
								<p className="font-semibold text-blue-600">
									{isSuperAdmin ? "Super Administrator" : "Administrator"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Navigation Tabs */}
			<div className="mb-6">
				<div className="sm:hidden">
					<select
						value={activeTab}
						onChange={(e) => setActiveTab(e.target.value)}
						className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
					>
						{isSuperAdmin && <option value="users">User Management</option>}
						<option value="posts">Blog Management</option>
					</select>
				</div>

				<div className="hidden sm:block">
					<nav className="flex space-x-8">
						{isSuperAdmin && (
							<button
								onClick={() => setActiveTab("users")}
								className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
									activeTab === "users"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<Users className="h-4 w-4" />
								<span>User Management</span>
							</button>
						)}
						<button
							onClick={() => setActiveTab("posts")}
							className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "posts"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<FileText className="h-4 w-4" />
							<span>Blog Management</span>
						</button>
					</nav>
				</div>
			</div>

			{/* Content Section */}
			<div className="space-y-6">
				{activeTab === "users" && isSuperAdmin && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Users className="h-5 w-5" />
								<span>User Management</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<AdminUsers isSuperAdmin />
						</CardContent>
					</Card>
				)}

				{activeTab === "posts" && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<FileText className="h-5 w-5" />
								<span>Blog Management</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<AdminPosts isSuperAdmin={isSuperAdmin} />
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
