"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { User } from "@supabase/supabase-js";

export default function AuthStatus() {
	const { supabase } = useSupabase();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setLoading(false);
		};

		getUser();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase]);

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	if (loading) {
		return <div className="text-center p-4">Loading...</div>;
	}

	return (
		<div className="p-4 bg-white shadow rounded-lg border border-gray-200">
			{user ? (
				<div>
					<p className="font-medium text-gray-900">
						Signed in as: <span className="font-semibold">{user.email}</span>
					</p>
					<button
						onClick={handleSignOut}
						className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow"
					>
						Sign Out
					</button>
				</div>
			) : (
				<div>
					<p className="text-gray-800">Not signed in</p>
					<div className="mt-2 space-x-2">
						<a
							href="/login"
							className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow"
						>
							Sign In
						</a>
						<a
							href="/register"
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow"
						>
							Register
						</a>
					</div>
				</div>
			)}
		</div>
	);
}
