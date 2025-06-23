"use client";

import { useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
	const { supabase } = useSupabase();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "error" | "success" | "";
		text: string;
	}>({ type: "", text: "" });

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			// 1. Sign up with Supabase Auth
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username,
						display_name: displayName,
					},
				},
			});

			if (authError) {
				setMessage({ type: "error", text: authError.message });
				return;
			}

			// 2. Insert user data into the users table
			if (authData.user) {
				const { error: profileError } = await supabase.from("users").insert([
					{
						id: authData.user.id,
						username,
						email,
						display_name: displayName,
						role: "user", // Default role
					},
				]);

				if (profileError) {
					setMessage({ type: "error", text: profileError.message });
					return;
				}

				setMessage({
					type: "success",
					text: "Registration successful! Please check your email to confirm your account.",
				});
				setTimeout(() => {
					router.push("/login");
				}, 1500);
			}
		} catch (error) {
			setMessage({ type: "error", text: "An unexpected error occurred" });
			console.error("Error signing up:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
			<h2 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">
				Register
			</h2>

			<form onSubmit={handleSignUp}>
				<div className="mb-4">
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div className="mb-4">
					<label
						htmlFor="username"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Username
					</label>
					<input
						id="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div className="mb-4">
					<label
						htmlFor="displayName"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Display Name
					</label>
					<input
						id="displayName"
						type="text"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						required
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
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
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
						className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-gray-50 focus:outline-none focus:border-blue-500"
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
					disabled={loading}
					className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? "Loading..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
}
