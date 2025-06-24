"use client";

import { createContext, useContext, useState, useEffect, memo } from "react";
import { supabase } from "@/utils/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
	supabase: SupabaseClient;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

const SupabaseProvider = memo(function SupabaseProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [supabaseClient] = useState(() => supabase);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			// Only handle auth state changes, no page refresh needed
			if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
				// Auth state is handled by useSupabaseAuth hook
				// No need to refresh the page
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
});

export const useSupabase = () => {
	const context = useContext(Context);
	if (context === undefined) {
		throw new Error("useSupabase must be used inside SupabaseProvider");
	}
	return context;
};

export default SupabaseProvider;
