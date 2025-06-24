"use client";

import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { memo } from "react";
import { ButtonSkeleton } from "@/components/ui/loading-skeleton";

const DashboardButton = memo(function DashboardButton() {
	const { profile, loading, isAdmin } = useSupabaseAuth();

	// Show optimized loading state
	if (loading) {
		return <ButtonSkeleton />;
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

	const dashboardHref = isAdmin ? "/admin" : "/dashboard";

	return (
		<Link
			href={dashboardHref}
			className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-700 text-white font-bold shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mt-4 mb-6"
		>
			Go to Dashboard
		</Link>
	);
});

export default DashboardButton;
