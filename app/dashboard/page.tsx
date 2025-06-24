import MyPosts from "./my-posts";

export default function DashboardPage() {
	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<h1 className="text-3xl font-extrabold mb-6 text-blue-800  bg-white px-4 py-2 rounded-xl shadow border ">
				User Dashboard
			</h1>
			<MyPosts />
		</div>
	);
}
