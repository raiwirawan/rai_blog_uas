import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";
import { Suspense, lazy } from "react";
import { NavbarSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load the Navbar component
const Navbar = lazy(() => import("@/components/navigation/navbar"));

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Rai Blog",
	description: "A blog application with Next.js and Supabase",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.ico" type="image/x-icon" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SupabaseProvider>
					<Suspense fallback={<NavbarSkeleton />}>
						<Navbar />
					</Suspense>
					<main className="min-h-screen bg-gray-50">{children}</main>
				</SupabaseProvider>
			</body>
		</html>
	);
}
