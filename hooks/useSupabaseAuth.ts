"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { User, Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types/supabase";
import { useOptimizedLoading } from "./useOptimizedLoading";

// Cache for user profiles to avoid repeated API calls
const profileCache = new Map<string, UserProfile>();

export function useSupabaseAuth() {
	const { supabase } = useSupabase();
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Use optimized loading hook
	const { shouldShow, startLoading, stopLoading } = useOptimizedLoading({
		delay: 50, // Show loading after 50ms to avoid flickering
		minDuration: 200, // Minimum loading duration of 200ms
	});

	// Memoized function to get user profile
	const getUserProfile = useCallback(
		async (userId: string) => {
			// Check cache first
			if (profileCache.has(userId)) {
				console.log("Using cached profile for user:", userId);
				return profileCache.get(userId)!;
			}

			try {
				console.log("Fetching profile for user:", userId);
				const { data: profile, error } = await supabase
					.from("users")
					.select("*")
					.eq("id", userId)
					.single();

				if (error) {
					console.error("Error fetching profile:", error);
					throw error;
				}

				console.log("Profile fetched successfully:", profile);

				// Cache the profile
				if (profile) {
					profileCache.set(userId, profile as UserProfile);
				}

				return profile as UserProfile;
			} catch (error) {
				console.error("Error loading user profile:", error);
				return null;
			}
		},
		[supabase]
	);

	// Function to refresh profile data (for debugging)
	const refreshProfile = useCallback(async () => {
		if (user) {
			console.log("Refreshing profile for user:", user.id);
			// Clear cache for this user
			profileCache.delete(user.id);

			// Fetch fresh data
			const userProfile = await getUserProfile(user.id);
			setProfile(userProfile);
			console.log("Profile refreshed:", userProfile);
		}
	}, [user, getUserProfile]);

	// Optimized initialization
	useEffect(() => {
		let mounted = true;

		const initializeAuth = async () => {
			console.log("Initializing auth...");
			startLoading();

			try {
				// Get current session in parallel
				const [sessionResult, userResult] = await Promise.all([
					supabase.auth.getSession(),
					supabase.auth.getUser(),
				]);

				if (!mounted) return;

				const session = sessionResult.data.session;
				const user = userResult.data.user;

				console.log("Session:", session ? "Found" : "Not found");
				console.log("User:", user ? user.id : "Not found");

				setSession(session);
				setUser(user);

				if (user) {
					const userProfile = await getUserProfile(user.id);
					if (mounted) {
						setProfile(userProfile);
						console.log("Profile set:", userProfile);
					}
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
			} finally {
				if (mounted) {
					stopLoading();
					setIsInitialized(true);
					console.log("Auth initialization complete");
				}
			}
		};

		initializeAuth();

		// Auth state change listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event, session?.user?.id);
			if (!mounted) return;

			setSession(session);
			setUser(session?.user ?? null);

			if (session?.user) {
				const userProfile = await getUserProfile(session.user.id);
				if (mounted) {
					setProfile(userProfile);
					console.log("Profile updated on auth change:", userProfile);
				}
			} else {
				setProfile(null);
				console.log("Profile cleared on auth change");
			}

			if (mounted) {
				stopLoading();
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [supabase, getUserProfile, startLoading, stopLoading]);

	const signOut = useCallback(async () => {
		// Clear cache on sign out
		if (user) {
			profileCache.delete(user.id);
		}
		await supabase.auth.signOut();
	}, [supabase, user]);

	// Memoized computed values
	const isAdmin = useMemo(() => {
		const adminStatus =
			profile?.role === "admin" || profile?.role === "superadmin";
		console.log("isAdmin computed:", adminStatus, "role:", profile?.role);
		return adminStatus;
	}, [profile?.role]);

	const isSuperAdmin = useMemo(() => {
		const superAdminStatus = profile?.role === "superadmin";
		console.log(
			"isSuperAdmin computed:",
			superAdminStatus,
			"role:",
			profile?.role
		);
		return superAdminStatus;
	}, [profile?.role]);

	// Debug logging
	useEffect(() => {
		console.log("Auth state updated:", {
			user: user?.id,
			profile: profile?.id,
			role: profile?.role,
			isAdmin,
			isSuperAdmin,
			loading: shouldShow,
			isInitialized,
		});
	}, [user, profile, isAdmin, isSuperAdmin, shouldShow, isInitialized]);

	return {
		user,
		session,
		profile,
		loading: shouldShow && !isInitialized, // Only show loading during initial load
		signOut,
		isAdmin,
		isSuperAdmin,
		refreshProfile,
	};
}
