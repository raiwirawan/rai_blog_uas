"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
	supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [supabaseClient] = useState(() => supabase);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session?.access_token !== undefined) {
				// Refresh the page to update the UI based on auth state
				if (event === "SIGNED_IN") {
					// You can choose to refresh or not depending on your app's needs
					// window.location.reload();
				}
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabaseClient]);

	return (
		<Context.Provider value={{ supabase: supabaseClient }}>
			{children}
		</Context.Provider>
	);
}

export const useSupabase = () => {
	const context = useContext(Context);
	if (context === undefined) {
		throw new Error("useSupabase must be used inside SupabaseProvider");
	}
	return context;
};
