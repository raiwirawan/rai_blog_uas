import React, { useEffect, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { UserProfile } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
	Users,
	UserPlus,
	Edit,
	Trash2,
	Shield,
	User,
	Mail,
	UserCheck,
	AlertCircle,
	CheckCircle,
	XCircle,
} from "lucide-react";

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

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "superadmin":
				return <Shield className="h-4 w-4 text-purple-600" />;
			case "admin":
				return <UserCheck className="h-4 w-4 text-blue-600" />;
			default:
				return <User className="h-4 w-4 text-gray-600" />;
		}
	};

	const getRoleBadge = (role: string) => {
		const baseClasses =
			"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
		switch (role) {
			case "superadmin":
				return `${baseClasses} bg-purple-100 text-purple-800`;
			case "admin":
				return `${baseClasses} bg-blue-100 text-blue-800`;
			default:
				return `${baseClasses} bg-gray-100 text-gray-800`;
		}
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<LoadingSkeleton className="h-8 w-48" />
				<div className="grid gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<LoadingSkeleton key={i} className="h-20 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Info Card */}
			<Card className="bg-blue-50 border-blue-200">
				<CardContent className="p-4">
					<div className="flex items-start space-x-3">
						<Shield className="h-5 w-5 text-blue-600 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-blue-900">
								{isSuperAdmin ? "Superadmin Access:" : "Admin Access:"}
							</p>
							<p className="text-sm text-blue-700">
								{isSuperAdmin
									? "Tambah/edit/hapus user & admin, promosi/demote user & admin."
									: "Kelola user biasa (tidak bisa mengelola admin)."}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Display */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<AlertCircle className="h-5 w-5 text-red-600" />
							<p className="text-red-800">{error}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Action Bar */}
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Users className="h-5 w-5 text-gray-600" />
					<h3 className="text-lg font-semibold text-gray-900">
						User List ({users.length} users)
					</h3>
				</div>
				<Button
					onClick={openCreateModal}
					className="flex items-center space-x-2"
				>
					<UserPlus className="h-4 w-4" />
					<span>Add User</span>
				</Button>
			</div>

			{/* Users Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{users.map((user) => (
					<Card key={user.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center space-x-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
										{getRoleIcon(user.role)}
									</div>
									<div>
										<p className="font-medium text-gray-900">
											{user.display_name || user.username}
										</p>
										<p className="text-sm text-gray-500">@{user.username}</p>
									</div>
								</div>
								<span className={getRoleBadge(user.role)}>{user.role}</span>
							</div>

							<div className="space-y-2 mb-4">
								<div className="flex items-center space-x-2 text-sm text-gray-600">
									<Mail className="h-4 w-4" />
									<span>{user.email}</span>
								</div>
								<div className="flex items-center space-x-2 text-sm text-gray-600">
									<User className="h-4 w-4" />
									<span>ID: {user.id.slice(0, 8)}...</span>
								</div>
							</div>

							<div className="flex space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleEdit(user)}
									className="flex-1"
								>
									<Edit className="h-4 w-4 mr-1" />
									Edit
								</Button>
								{isSuperAdmin && user.role !== "superadmin" && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => handlePromoteDemote(user)}
										className="flex-1"
									>
										{user.role === "admin" ? (
											<>
												<User className="h-4 w-4 mr-1" />
												Demote
											</>
										) : (
											<>
												<UserCheck className="h-4 w-4 mr-1" />
												Promote
											</>
										)}
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleDelete(user)}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{users.length === 0 && !loading && (
				<Card>
					<CardContent className="p-8 text-center">
						<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No users found
						</h3>
						<p className="text-gray-500 mb-4">
							{isSuperAdmin
								? "No users have been created yet."
								: "No regular users found."}
						</p>
						<Button onClick={openCreateModal}>
							<UserPlus className="h-4 w-4 mr-2" />
							Add First User
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Modal */}
			{modalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
					<Card className="w-full max-w-md">
						<CardHeader>
							<CardTitle>{isEdit ? "Edit User" : "Add New User"}</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleFormSubmit} className="space-y-4">
								{formError && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-3">
										<div className="flex items-center space-x-2">
											<XCircle className="h-4 w-4 text-red-600" />
											<p className="text-red-800 text-sm">{formError}</p>
										</div>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Username
									</label>
									<input
										type="text"
										name="username"
										value={form.username || ""}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										type="email"
										name="email"
										value={form.email || ""}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Display Name
									</label>
									<input
										type="text"
										name="display_name"
										value={form.display_name || ""}
										onChange={handleFormChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>

								{!isEdit && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Password
										</label>
										<input
											type="password"
											name="password"
											value={form.password || ""}
											onChange={handleFormChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
								)}

								{isSuperAdmin && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Role
										</label>
										<select
											name="role"
											value={form.role || "user"}
											onChange={handleFormChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
									</div>
								)}

								<div className="flex space-x-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={closeModal}
										className="flex-1"
										disabled={formLoading}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										className="flex-1"
										disabled={formLoading}
									>
										{formLoading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												{isEdit ? "Updating..." : "Creating..."}
											</>
										) : (
											<>
												{isEdit ? (
													<>
														<CheckCircle className="h-4 w-4 mr-2" />
														Update
													</>
												) : (
													<>
														<UserPlus className="h-4 w-4 mr-2" />
														Create
													</>
												)}
											</>
										)}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};

export default AdminUsers;
