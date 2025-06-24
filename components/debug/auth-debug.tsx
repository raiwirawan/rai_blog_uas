"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";

export default function AuthDebug() {
	const { user, profile, loading, isAdmin, isSuperAdmin, refreshProfile } =
		useSupabaseAuth();

	const handleRefresh = async () => {
		console.log("Refreshing profile...");
		await refreshProfile();
	};

	const handleClearCache = () => {
		console.log("Clearing cache...");
		// Clear localStorage and sessionStorage
		localStorage.clear();
		sessionStorage.clear();
		// Reload page
		window.location.reload();
	};

	const handleForceRefresh = async () => {
		console.log("Force refreshing...");
		// Clear cache first
		localStorage.clear();
		sessionStorage.clear();
		// Then refresh profile
		await refreshProfile();
		// Wait a bit and reload
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	};

	return (
		<div className="bg-gray-100 border border-gray-400 text-gray-800 px-4 py-3 rounded mb-4">
			<div className="flex justify-between items-start mb-4">
				<h3 className="font-bold text-lg">🔍 Auth Debug Panel</h3>
				<div className="space-x-2">
					<Button
						onClick={handleRefresh}
						size="sm"
						className="bg-blue-600 hover:bg-blue-700"
					>
						🔄 Refresh
					</Button>
					<Button onClick={handleClearCache} size="sm" variant="outline">
						🗑️ Clear Cache
					</Button>
					<Button
						onClick={handleForceRefresh}
						size="sm"
						className="bg-red-600 hover:bg-red-700 text-white"
					>
						⚡ Force Refresh
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
				<div>
					<h4 className="font-semibold mb-2">📊 Status:</h4>
					<div className="space-y-1">
						<div>
							<strong>Loading:</strong> {loading ? "🔄 Yes" : "✅ No"}
						</div>
						<div>
							<strong>User:</strong>{" "}
							{user ? "✅ Logged In" : "❌ Not Logged In"}
						</div>
						<div>
							<strong>Profile:</strong> {profile ? "✅ Found" : "❌ Not Found"}
						</div>
						<div>
							<strong>Is Admin:</strong> {isAdmin ? "✅ Yes" : "❌ No"}
						</div>
						<div>
							<strong>Is Super Admin:</strong>{" "}
							{isSuperAdmin ? "✅ Yes" : "❌ No"}
						</div>
					</div>
				</div>

				<div>
					<h4 className="font-semibold mb-2">👤 User Details:</h4>
					<div className="space-y-1">
						{user ? (
							<>
								<div>
									<strong>ID:</strong>{" "}
									<code className="text-xs">{user.id}</code>
								</div>
								<div>
									<strong>Email:</strong> {user.email}
								</div>
								<div>
									<strong>Email Verified:</strong>{" "}
									{user.email_confirmed_at ? "✅ Yes" : "❌ No"}
								</div>
							</>
						) : (
							<div className="text-red-600">No user data</div>
						)}
					</div>
				</div>

				{profile && (
					<div className="md:col-span-2">
						<h4 className="font-semibold mb-2">📋 Profile Details:</h4>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
							<div>
								<strong>Username:</strong> {profile.username}
							</div>
							<div>
								<strong>Display Name:</strong> {profile.display_name}
							</div>
							<div>
								<strong>Role:</strong>{" "}
								<span className="font-bold text-blue-600">{profile.role}</span>
							</div>
							<div>
								<strong>Created:</strong>{" "}
								{new Date(profile.created_at).toLocaleDateString()}
							</div>
							<div>
								<strong>Email:</strong> {profile.email}
							</div>
							<div>
								<strong>ID:</strong> <code>{profile.id}</code>
							</div>
						</div>
					</div>
				)}

				{!profile && user && (
					<div className="md:col-span-2">
						<div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
							<strong>⚠️ Warning:</strong> User is logged in but profile not
							found in database!
							<br />
							This usually means the user record doesn&apos;t exist in the
							&quot;users&quot; table.
						</div>
					</div>
				)}

				{profile && !isAdmin && (
					<div className="md:col-span-2">
						<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded">
							<strong>⚠️ Warning:</strong> User has profile but is not admin!
							<br />
							Current role: <strong>{profile.role}</strong> - Expected:
							&apos;admin&apos; or &apos;superadmin&apos;
						</div>
					</div>
				)}
			</div>

			<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
				<h4 className="font-semibold mb-2">🔧 Troubleshooting Steps:</h4>
				<ol className="list-decimal list-inside space-y-1 text-sm">
					<li>Check if user exists in Supabase &quot;users&quot; table</li>
					<li>
						Verify the &quot;role&quot; field is set to &apos;superadmin&apos;
					</li>
					<li>Click &quot;🔄 Refresh&quot; button to reload profile data</li>
					<li>Click &quot;🗑️ Clear Cache&quot; if data seems stale</li>
					<li>Click &quot;⚡ Force Refresh&quot; for complete reset</li>
					<li>Check browser console for any errors</li>
				</ol>
			</div>

			<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
				<h4 className="font-semibold mb-2">✅ Quick Test:</h4>
				<div className="text-sm">
					<p>
						If you see &quot;✅ Is Super Admin: Yes&quot; above, you should be
						able to access the admin dashboard.
					</p>
					<p>If not, try the troubleshooting steps above.</p>
				</div>
			</div>
		</div>
	);
}
