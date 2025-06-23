"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

export default function Navbar() {
	const { profile, loading, isAdmin, signOut } = useSupabaseAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className="bg-white shadow-md border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className="text-xl font-extrabold text-blue-800">
								Rai Blog
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							<Link
								href="/"
								className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-gray-800 hover:text-blue-700 hover:border-blue-500"
							>
								Home
							</Link>
							<Link
								href="/blog"
								className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-gray-800 hover:text-blue-700 hover:border-blue-500"
							>
								Blog
							</Link>
							{isAdmin && (
								<Link
									href="/admin"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-semibold text-gray-800 hover:text-blue-700 hover:border-blue-500"
								>
									Admin
								</Link>
							)}
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						{loading ? (
							<div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
						) : profile ? (
							<div className="relative ml-3">
								<div>
									<button
										onClick={() => setIsMenuOpen(!isMenuOpen)}
										className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										id="user-menu-button"
										aria-expanded="false"
										aria-haspopup="true"
									>
										<span className="sr-only">Open user menu</span>
										<div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
											{profile.display_name?.charAt(0) ||
												profile.username.charAt(0)}
										</div>
									</button>
								</div>
								{isMenuOpen && (
									<div
										className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200"
										role="menu"
										aria-orientation="vertical"
										aria-labelledby="user-menu-button"
										tabIndex={-1}
									>
										<Link
											href="/profile"
											className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-800 font-semibold"
											role="menuitem"
											tabIndex={-1}
											id="user-menu-item-0"
											onClick={() => setIsMenuOpen(false)}
										>
											Your Profile
										</Link>
										<button
											className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-semibold"
											role="menuitem"
											tabIndex={-1}
											id="user-menu-item-2"
											onClick={() => {
												signOut();
												setIsMenuOpen(false);
											}}
										>
											Sign out
										</button>
									</div>
								)}
							</div>
						) : (
							<div className="flex space-x-4">
								<Link
									href="/login"
									className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Log in
								</Link>
								<Link
									href="/register"
									className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Sign up
								</Link>
							</div>
						)}
					</div>
					<div className="-mr-2 flex items-center sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							<svg
								className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
							<svg
								className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden`}>
				<div className="pt-2 pb-3 space-y-1">
					<Link
						href="/"
						className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
						onClick={() => setIsMenuOpen(false)}
					>
						Home
					</Link>
					{isAdmin && (
						<Link
							href="/admin"
							className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
							onClick={() => setIsMenuOpen(false)}
						>
							Admin
						</Link>
					)}
				</div>
				<div className="pt-4 pb-3 border-t border-gray-200">
					{profile ? (
						<>
							<div className="flex items-center px-4">
								<div className="flex-shrink-0">
									<div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
										{profile.display_name?.charAt(0) ||
											profile.username.charAt(0)}
									</div>
								</div>
								<div className="ml-3">
									<div className="text-base font-medium text-gray-800">
										{profile.display_name || profile.username}
									</div>
									<div className="text-sm font-medium text-gray-500">
										{profile.email}
									</div>
								</div>
							</div>
							<div className="mt-3 space-y-1">
								<Link
									href="/profile"
									className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
									onClick={() => setIsMenuOpen(false)}
								>
									Your Profile
								</Link>
								<button
									onClick={() => {
										signOut();
										setIsMenuOpen(false);
									}}
									className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
								>
									Sign out
								</button>
							</div>
						</>
					) : (
						<div className="mt-3 space-y-1">
							<Link
								href="/login"
								className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								Log in
							</Link>
							<Link
								href="/register"
								className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
								onClick={() => setIsMenuOpen(false)}
							>
								Sign up
							</Link>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
