import DashboardButton from "@/components/navigation/DashboardButton";

export default function Home() {
	return (
		<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
			<div className="text-center">
				<h1 className="text-4xl font-extrabold text-blue-800 sm:text-5xl sm:tracking-tight lg:text-6xl">
					Welcome to Rai Blog
				</h1>
				<p className="mt-5 max-w-xl mx-auto text-xl text-gray-800">
					A modern blog platform built with Next.js and Supabase
				</p>
				<div className="mt-8 flex justify-center">
					<DashboardButton />
				</div>
			</div>

			<div className="mt-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-semibold text-blue-800">
								User Roles
							</h3>
							<div className="mt-2 text-sm text-gray-800">
								<p>Different access levels for different users:</p>
								<ul className="list-disc pl-5 mt-2 space-y-1">
									<li>
										Superadmin:{" "}
										<span className="text-gray-900 font-semibold">
											Full control over users and content
										</span>
									</li>
									<li>
										Admin:{" "}
										<span className="text-gray-900 font-semibold">
											Manage users and moderate content
										</span>
									</li>
									<li>
										User:{" "}
										<span className="text-gray-900 font-semibold">
											Create and manage your own blog posts
										</span>
									</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-semibold text-blue-800">
								Content Management
							</h3>
							<div className="mt-2 text-sm text-gray-800">
								<p>Powerful tools for managing your blog content:</p>
								<ul className="list-disc pl-5 mt-2 space-y-1">
									<li>Create, edit, and delete blog posts</li>
									<li>Categorize posts with tags and categories</li>
									<li>Publish or save as draft</li>
									<li>Rich text editing capabilities</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-semibold text-blue-800">
								Modern Technology
							</h3>
							<div className="mt-2 text-sm text-gray-800">
								<p>Built with the latest web technologies:</p>
								<ul className="list-disc pl-5 mt-2 space-y-1">
									<li>Next.js for fast, server-rendered React applications</li>
									<li>Supabase for authentication and database</li>
									<li>Tailwind CSS for beautiful, responsive design</li>
									<li>
										TypeScript for type safety and better developer experience
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
