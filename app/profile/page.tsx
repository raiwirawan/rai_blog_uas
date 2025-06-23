import Profile from "@/components/auth/profile";
import Link from "next/link";

export default function ProfilePage() {
	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
					Your Profile
				</h1>
				<Profile />
				<Link
					href="/"
					className="mt-6 inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Home
				</Link>
			</div>
		</div>
	);
}
