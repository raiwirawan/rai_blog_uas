"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function Profile() {
	const { profile, loading, isAdmin, isSuperAdmin, signOut } =
		useSupabaseAuth();

	if (loading) {
		return (
			<div className="p-6 bg-white shadow rounded-lg">
				<div className="animate-pulse flex space-x-4">
					<div className="rounded-full bg-gray-200 h-12 w-12"></div>
					<div className="flex-1 space-y-4 py-1">
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						<div className="space-y-2">
							<div className="h-4 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-5/6"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="p-6 bg-white shadow rounded-lg border border-gray-200">
				<p className="text-center text-gray-700">
					Please sign in to view your profile
				</p>
			</div>
		);
	}

	return (
		<div className="p-6 bg-white shadow rounded-lg border border-gray-200">
			<div className="flex items-center space-x-4 mb-4">
				<div className="bg-blue-700 text-white rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold">
					{profile.display_name?.charAt(0) || profile.username.charAt(0)}
				</div>
				<div>
					<h2 className="text-xl font-bold text-gray-900">
						{profile.display_name || profile.username}
					</h2>
					<p className="text-gray-800 font-medium">{profile.email}</p>
				</div>
			</div>
			<div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
				<p className="text-sm font-medium text-gray-700">Role</p>
				<p className="font-semibold">
					{isSuperAdmin && <span className="text-purple-700">Super Admin</span>}
					{isAdmin && !isSuperAdmin && (
						<span className="text-blue-700">Admin</span>
					)}
					{!isAdmin && !isSuperAdmin && (
						<span className="text-green-700">User</span>
					)}
				</p>
			</div>
			<div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
				<p className="text-sm font-medium text-gray-700">Username</p>
				<p className="font-medium text-gray-900">{profile.username}</p>
			</div>
			<div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
				<p className="text-sm font-medium text-gray-700">Account Created</p>
				<p className="font-medium text-gray-900">
					{new Date(profile.created_at).toLocaleDateString()}
				</p>
			</div>
			<button
				onClick={signOut}
				className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow"
			>
				Sign Out
			</button>
		</div>
	);
}
