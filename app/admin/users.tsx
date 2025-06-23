import React, { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { UserProfile } from "@/types/supabase";

interface AdminUsersProps {
	isSuperAdmin?: boolean;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ isSuperAdmin }) => {
	const { supabase } = useSupabase();
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [form, setForm] = useState<
		Partial<UserProfile> & { password?: string }
	>({});
	const [formLoading, setFormLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		const fetchUsers = async () => {
			setLoading(true);
			setError(null);
			let query = supabase.from("users").select("*");
			if (!isSuperAdmin) {
				query = query.eq("role", "user");
			}
			try {
				const { data, error } = await query;
				if (controller.signal.aborted) return;
				if (error) {
					setError(error.message);
					setUsers([]);
				} else {
					setUsers(data as UserProfile[]);
				}
			} catch (err) {
				if (!(err instanceof DOMException && err.name === "AbortError")) {
					setError("Gagal memuat data user.");
				}
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		};
		fetchUsers();
		return () => {
			controller.abort();
		};
	}, [isSuperAdmin, supabase, refresh]);

	const openCreateModal = () => {
		setIsEdit(false);
		setForm({ role: isSuperAdmin ? "user" : undefined });
		setFormError(null);
		setModalOpen(true);
	};

	const openEditModal = (user: UserProfile) => {
		setIsEdit(true);
		setForm({ ...user });
		setFormError(null);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setForm({});
		setFormError(null);
	};

	const handleEdit = (user: UserProfile) => {
		openEditModal(user);
	};

	const handleDelete = async (user: UserProfile) => {
		if (
			!confirm(
				`Yakin ingin menghapus user ${user.display_name || user.username}?`
			)
		)
			return;
		setLoading(true);
		const { error } = await supabase.from("users").delete().eq("id", user.id);
		if (error) {
			setError(error.message);
		} else {
			setUsers((prev) => prev.filter((u) => u.id !== user.id));
			setRefresh((r) => r + 1);
		}
		setLoading(false);
	};

	const handlePromoteDemote = async (user: UserProfile) => {
		if (!isSuperAdmin) return;
		const newRole = user.role === "admin" ? "user" : "admin";
		setLoading(true);
		const { error } = await supabase
			.from("users")
			.update({ role: newRole })
			.eq("id", user.id);
		if (error) {
			setError(error.message);
		} else {
			setUsers((prev) =>
				prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
			);
			setRefresh((r) => r + 1);
		}
		setLoading(false);
	};

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormLoading(true);
		setFormError(null);
		try {
			if (isEdit) {
				// Update user (and role if superadmin)
				const updateData: Partial<UserProfile> = {
					username: form.username,
					email: form.email,
					display_name: form.display_name,
				};
				if (isSuperAdmin && form.role) updateData.role = form.role;
				const { error } = await supabase
					.from("users")
					.update(updateData)
					.eq("id", form.id);
				if (error) throw error;
				setRefresh((r) => r + 1);
				closeModal();
			} else {
				// Create user: 1) Supabase Auth, 2) users table
				if (!form.email || !form.password || !form.username) {
					setFormError("Email, username, dan password wajib diisi.");
					setFormLoading(false);
					return;
				}
				const { data: authData, error: authError } = await supabase.auth.signUp(
					{
						email: form.email,
						password: form.password,
						options: {
							data: {
								username: form.username,
								display_name: form.display_name,
							},
						},
					}
				);
				if (authError) throw authError;
				if (!authData.user) throw new Error("Gagal membuat user di Auth.");
				const { error: profileError } = await supabase.from("users").insert([
					{
						id: authData.user.id,
						username: form.username,
						email: form.email,
						display_name: form.display_name,
						role: isSuperAdmin && form.role ? form.role : "user",
					},
				]);
				if (profileError) throw profileError;
				setRefresh((r) => r + 1);
				closeModal();
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setFormError(err.message || "Terjadi kesalahan.");
			} else {
				setFormError("Terjadi kesalahan.");
			}
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">User Management</h2>
			<div className="bg-gray-100 p-4 rounded">
				<div className="mb-2 text-sm text-gray-700">
					{isSuperAdmin ? (
						<>
							<p>
								<span className="font-semibold text-blue-800">Superadmin:</span>{" "}
								Tambah/edit/hapus user & admin, promosi/demote user & admin.
							</p>
						</>
					) : (
						<>
							<p>
								<span className="font-semibold text-blue-800">Admin:</span>{" "}
								Tambah/edit/hapus user saja.
							</p>
						</>
					)}
				</div>
				<button
					className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
					onClick={openCreateModal}
				>
					Tambah User/Admin
				</button>
				<div className="bg-white p-4 rounded shadow border border-gray-200 overflow-x-auto">
					{loading ? (
						<div className="text-gray-500">Loading users...</div>
					) : error ? (
						<div className="text-red-600">{error}</div>
					) : users.length === 0 ? (
						<div className="text-gray-500">No users found.</div>
					) : (
						<table className="min-w-full divide-y divide-blue-300 bg-blue-50 rounded-lg">
							<thead className="bg-blue-700">
								<tr>
									<th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-600">
										Name
									</th>
									<th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-600">
										Email
									</th>
									<th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-600">
										Role
									</th>
									<th className="px-4 py-2"></th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, idx) => (
									<tr
										key={user.id}
										className={idx % 2 === 0 ? "bg-blue-100" : "bg-white"}
									>
										<td className="px-4 py-2 whitespace-nowrap font-semibold text-blue-900 border-r border-blue-200">
											{user.display_name || user.username}
										</td>
										<td className="px-4 py-2 whitespace-nowrap text-blue-800 border-r border-blue-200">
											{user.email}
										</td>
										<td className="px-4 py-2 whitespace-nowrap capitalize text-blue-700 border-r border-blue-200">
											{user.role}
										</td>
										<td className="px-4 py-2 whitespace-nowrap text-right">
											<button
												className="text-blue-700 font-bold hover:underline mr-2"
												onClick={() => handleEdit(user)}
											>
												Edit
											</button>
											<button
												className="text-red-700 font-bold hover:underline mr-2"
												onClick={() => handleDelete(user)}
											>
												Delete
											</button>
											{isSuperAdmin && user.role !== "superadmin" && (
												<button
													className="text-green-700 font-bold hover:underline"
													onClick={() => handlePromoteDemote(user)}
												>
													{user.role === "admin"
														? "Demote to User"
														: "Promote to Admin"}
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>

			{/* Modal for Create/Edit User */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
						<button
							onClick={closeModal}
							className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
						>
							&times;
						</button>
						<h3 className="text-lg font-bold mb-4">
							{isEdit ? "Edit User/Admin" : "Tambah User/Admin"}
						</h3>
						<form onSubmit={handleFormSubmit}>
							<div className="mb-3">
								<label className="block text-sm font-medium mb-1">Email</label>
								<input
									type="email"
									name="email"
									value={form.email || ""}
									onChange={handleFormChange}
									required
									className="w-full border rounded px-3 py-2"
									disabled={isEdit}
								/>
							</div>
							<div className="mb-3">
								<label className="block text-sm font-medium mb-1">
									Username
								</label>
								<input
									type="text"
									name="username"
									value={form.username || ""}
									onChange={handleFormChange}
									required
									className="w-full border rounded px-3 py-2"
								/>
							</div>
							<div className="mb-3">
								<label className="block text-sm font-medium mb-1">
									Display Name
								</label>
								<input
									type="text"
									name="display_name"
									value={form.display_name || ""}
									onChange={handleFormChange}
									className="w-full border rounded px-3 py-2"
								/>
							</div>
							{!isEdit && (
								<div className="mb-3">
									<label className="block text-sm font-medium mb-1">
										Password
									</label>
									<input
										type="password"
										name="password"
										value={form.password || ""}
										onChange={handleFormChange}
										required
										minLength={6}
										className="w-full border rounded px-3 py-2"
									/>
								</div>
							)}
							{isSuperAdmin && (
								<div className="mb-3">
									<label className="block text-sm font-medium mb-1">Role</label>
									<select
										name="role"
										value={form.role || "user"}
										onChange={handleFormChange}
										className="w-full border rounded px-3 py-2"
									>
										<option value="user">User</option>
										<option value="admin">Admin</option>
										<option value="superadmin" disabled>
											Superadmin
										</option>
									</select>
								</div>
							)}
							{formError && (
								<div className="mb-2 text-red-600 text-sm">{formError}</div>
							)}
							<button
								type="submit"
								disabled={formLoading}
								className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 mt-2 disabled:opacity-50"
							>
								{formLoading ? "Loading..." : isEdit ? "Update" : "Create"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUsers;
