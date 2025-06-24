import { memo } from "react";

interface LoadingSkeletonProps {
	className?: string;
	width?: string;
	height?: string;
	rounded?: boolean;
}

export const LoadingSkeleton = memo(function LoadingSkeleton({
	className = "",
	width = "w-full",
	height = "h-4",
	rounded = true,
}: LoadingSkeletonProps) {
	return (
		<div
			className={`${width} ${height} bg-gray-200 animate-pulse ${
				rounded ? "rounded" : ""
			} ${className}`}
		/>
	);
});

export const ButtonSkeleton = memo(function ButtonSkeleton() {
	return (
		<div className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-100 text-gray-400 font-bold shadow mt-4 mb-6">
			<LoadingSkeleton width="w-32" height="h-4" />
		</div>
	);
});

export const ProfileSkeleton = memo(function ProfileSkeleton() {
	return (
		<div className="flex items-center space-x-4">
			<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
			<div className="space-y-2">
				<LoadingSkeleton width="w-16" height="h-3" />
				<LoadingSkeleton width="w-20" height="h-3" />
			</div>
		</div>
	);
});

export const NavbarSkeleton = memo(function NavbarSkeleton() {
	return (
		<div className="flex items-center space-x-4">
			<LoadingSkeleton width="w-16" height="h-8" />
			<LoadingSkeleton width="w-20" height="h-8" />
		</div>
	);
});
