"use client";

import { useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { useRouter } from "next/navigation";

export default function LoginForm() {
	const { supabase } = useSupabase();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "error" | "success" | "";
		text: string;
	}>({ type: "", text: "" });

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				setMessage({ type: "error", text: error.message });
			} else {
				// Ambil data user dari tabel users
				const { data: userData } = await supabase
					.from("users")
					.select("role")
					.eq("email", email)
					.single();

				setMessage({
					type: "success",
					text: "Login successful! Redirecting...",
				});
				setTimeout(() => {
					if (userData?.role === "admin" || userData?.role === "superadmin") {
						router.push("/admin");
					} else {
						router.push("/dashboard");
					}
				}, 1000);
			}
		} catch (error) {
			setMessage({ type: "error", text: "An unexpected error occurred" });
			console.error("Error signing in:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
			<h2 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">
				Sign In
			</h2>

			<form onSubmit={handleSignIn}>
				<div className="mb-4">
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Email
					</label>
					<input
						type="email"
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className="mb-6">
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Password
					</label>
					<input
						type="password"
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				{message.type === "error" && (
					<div className="mt-4 text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">
						{message.text}
					</div>
				)}
				{message.type === "success" && (
					<div className="mt-4 text-green-700 bg-green-50 border border-green-200 p-2 rounded text-sm">
						{message.text}
					</div>
				)}

				<button
					type="submit"
					className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
					disabled={loading}
				>
					{loading ? "Loading..." : "Sign In"}
				</button>
			</form>
		</div>
	);
}
