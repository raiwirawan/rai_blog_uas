import React from "react";

interface AdminPostsProps {
	isSuperAdmin?: boolean;
}

const AdminPosts: React.FC<AdminPostsProps> = ({ isSuperAdmin }) => {
	return (
		<div>
			<h2 className="text-xl font-bold mb-4">User Blog Management</h2>
			<div className="mb-2 text-sm text-gray-700">
				<span className="font-semibold text-blue-800">
					{isSuperAdmin ? "Superadmin:" : "Admin:"}
				</span>{" "}
				Edit/hapus artikel milik user (bukan admin/superadmin). Tidak bisa
				membuat artikel sendiri.
			</div>
			<div className="bg-white p-4 rounded shadow border border-gray-200">
				{/* TODO: Implement user post table, only show posts owned by user (not admin/superadmin), allow edit/delete only. */}
				User posts management table goes here.
			</div>
		</div>
	);
};

export default AdminPosts;
