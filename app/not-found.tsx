import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
				<div className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
						<svg
							className="h-6 w-6 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
							/>
						</svg>
					</div>
					<h2 className="text-lg font-medium text-gray-900 mb-2">
						Page not found
					</h2>
					<p className="text-sm text-gray-600 mb-6">
						Sorry, we couldn&apos;t find the page you&apos;re looking for.
					</p>
					<div className="space-y-3">
						<Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
							<Link href="/">Go back home</Link>
						</Button>
						<Button asChild variant="outline" className="w-full">
							<Link href="/blog">Browse blog posts</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
