import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Performance optimizations
	experimental: {
		optimizePackageImports: ["@supabase/supabase-js", "lucide-react"],
	},
	// Enable SWC minification for better performance
	swcMinify: true,
	// Optimize images
	images: {
		formats: ["image/webp", "image/avif"],
	},
	// Enable compression
	compress: true,
	// Suppress deprecation warnings
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 25 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 2,
	},
	// Optimize bundle size
	webpack: (config, { dev, isServer }) => {
		if (!dev && !isServer) {
			// Enable tree shaking for better bundle optimization
			config.optimization = {
				...config.optimization,
				usedExports: true,
				sideEffects: false,
			};
		}

		// Suppress punycode deprecation warning
		config.resolve.fallback = {
			...config.resolve.fallback,
			punycode: false,
		};

		// Add warning suppression
		config.infrastructureLogging = {
			level: "error",
		};

		return config;
	},
};

export default nextConfig;
