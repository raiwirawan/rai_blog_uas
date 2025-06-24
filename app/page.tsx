import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load the DashboardButton component
const DashboardButton = lazy(
	() => import("@/components/navigation/DashboardButton")
);

export default function Home() {
	return (
		<div className="container mx-auto py-12 min-h-screen">
			<div className="text-center">
				<h1 className="text-4xl font-bold tracking-tight mb-2">
					Welcome to Rai Blog
				</h1>
				<p className="mb-8 text-lg text-muted-foreground">
					A modern blog platform built with Next.js and Supabase
				</p>
				<div className="flex justify-center mb-8">
					<Suspense fallback={<ButtonSkeleton />}>
						<Button asChild size="lg">
							<DashboardButton />
						</Button>
					</Suspense>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>User Roles</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-2">Different access levels for different users:</p>
						<ul className="list-disc pl-5 space-y-1 text-sm">
							<li>
								Superadmin:{" "}
								<span className="font-semibold">
									Full control over users and content
								</span>
							</li>
							<li>
								Admin:{" "}
								<span className="font-semibold">
									Manage users and moderate content
								</span>
							</li>
							<li>
								User:{" "}
								<span className="font-semibold">
									Create and manage your own blog posts
								</span>
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Content Management</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-2">
							Powerful tools for managing your blog content:
						</p>
						<ul className="list-disc pl-5 space-y-1 text-sm">
							<li>Create, edit, and delete blog posts</li>
							<li>Categorize posts with tags and categories</li>
							<li>Publish or save as draft</li>
							<li>Rich text editing capabilities</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Modern Technology</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-2">Built with the latest web technologies:</p>
						<ul className="list-disc pl-5 space-y-1 text-sm">
							<li>Next.js for fast, server-rendered React applications</li>
							<li>Supabase for authentication and database</li>
							<li>Tailwind CSS for beautiful, responsive design</li>
							<li>
								TypeScript for type safety and better developer experience
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
