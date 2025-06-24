"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function UserStatus() {
	const { user, profile, loading, isAdmin, isSuperAdmin, refreshProfile } =
		useSupabaseAuth();

	if (loading) {
		return (
			<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
				<strong>Loading...</strong> Authentication status is being checked.
			</div>
		);
	}

	if (!user) {
		return (
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				<strong>Not Logged In:</strong> No user session found.
			</div>
		);
	}

	return (
		<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
			<div className="flex justify-between items-start">
				<div>
					<strong>User Status:</strong>
					<div className="mt-2 space-y-1 text-sm">
						<div>
							<strong>User ID:</strong> {user.id}
						</div>
						<div>
							<strong>Email:</strong> {user.email}
						</div>
						{profile && (
							<>
								<div>
									<strong>Username:</strong> {profile.username}
								</div>
								<div>
									<strong>Display Name:</strong> {profile.display_name}
								</div>
								<div>
									<strong>Role:</strong>{" "}
									<span className="font-bold">{profile.role}</span>
								</div>
								<div>
									<strong>Is Admin:</strong> {isAdmin ? "✅ Yes" : "❌ No"}
								</div>
								<div>
									<strong>Is Super Admin:</strong>{" "}
									{isSuperAdmin ? "✅ Yes" : "❌ No"}
								</div>
							</>
						)}
						{!profile && (
							<div className="text-red-600">
								<strong>⚠️ Warning:</strong> User profile not found in database!
							</div>
						)}
					</div>
				</div>
				<button
					onClick={refreshProfile}
					className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
				>
					Refresh
				</button>
			</div>
		</div>
	);
}
