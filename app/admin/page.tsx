"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AdminUsers from "./users";
import AdminPosts from "./posts";

export default function AdminPage() {
	const { isAdmin, isSuperAdmin, loading } = useSupabaseAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(isSuperAdmin ? "users" : "posts");

	useEffect(() => {
		if (!loading && !isAdmin && !isSuperAdmin) {
			router.push("/");
		}
	}, [loading, isAdmin, isSuperAdmin, router]);

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
		return null; // Will redirect in useEffect
	}

	return (
		<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
			<div className="border-b border-gray-200 pb-5 sm:pb-0">
				<h1 className="text-3xl font-extrabold leading-tight text-blue-800 bg-white px-4 py-2 rounded shadow border border-blue-200 inline-block mb-2">
					{isSuperAdmin ? "Superadmin Dashboard" : "Admin Dashboard"}
				</h1>
				<div className="mt-3 sm:mt-4">
					<div className="sm:hidden">
						<label htmlFor="current-tab" className="sr-only">
							Select a tab
						</label>
						<select
							id="current-tab"
							name="current-tab"
							className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
							value={activeTab}
							onChange={(e) => setActiveTab(e.target.value)}
						>
							{isSuperAdmin && <option value="users">User Management</option>}
							<option value="posts">User Blog Management</option>
						</select>
					</div>
					<div className="hidden sm:block">
						<nav className="-mb-px flex space-x-8">
							{isSuperAdmin && (
								<button
									onClick={() => setActiveTab("users")}
									className={`${
										activeTab === "users"
											? "border-blue-500 text-blue-600"
											: "border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300"
									} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
								>
									User Management
								</button>
							)}
							<button
								onClick={() => setActiveTab("posts")}
								className={`${
									activeTab === "posts"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300"
								} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
							>
								User Blog Management
							</button>
						</nav>
					</div>
				</div>
			</div>

			<div className="mt-6">
				{activeTab === "users" && isSuperAdmin && <AdminUsers isSuperAdmin />}
				{activeTab === "posts" && <AdminPosts isSuperAdmin={isSuperAdmin} />}
			</div>
		</div>
	);
}
