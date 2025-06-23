"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function DashboardButton() {
	const { profile, loading, isAdmin } = useSupabaseAuth();

	if (loading) {
		return (
			<div className="h-10 w-40 bg-gray-200 rounded animate-pulse mt-4 mb-6"></div>
		);
	}

	if (!profile) {
		return (
			<Link
				href="/register"
				className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-700 text-white font-bold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-4 mb-6"
			>
				Get started / Sign up
			</Link>
		);
	}

	let dashboardHref = "/dashboard";
	if (isAdmin) dashboardHref = "/admin";

	return (
		<Link
			href={dashboardHref}
			className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-700 text-white font-bold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-4 mb-6"
		>
			Go to Dashboard
		</Link>
	);
}
