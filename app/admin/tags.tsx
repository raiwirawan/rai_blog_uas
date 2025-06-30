import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Tag } from "@/types/supabase";
import { useSupabase } from "@/components/supabase-provider";

export default function TagManagement() {
	const { supabase } = useSupabase();
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string>("");
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ name: "", slug: "" });
	const [saving, setSaving] = useState(false);
	const [editTag, setEditTag] = useState<Tag | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);

	const fetchTags = useCallback(async () => {
		setLoading(true);
		setError(null);
		const { data, error } = await supabase
			.from("tags")
			.select("*")
			.order("name", { ascending: true });
		if (error) setError(error.message);
		else setTags(data || []);
		setLoading(false);
	}, [supabase]);

	useEffect(() => {
		fetchTags();
	}, [fetchTags]);

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleAdd = () => {
		setEditTag(null);
		setForm({ name: "", slug: "" });
		setFormError(null);
		setShowForm(true);
	};

	const handleEdit = (tag: Tag) => {
		setEditTag(tag);
		setForm({ name: tag.name, slug: tag.slug });
		setFormError(null);
		setShowForm(true);
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setFormError(null);
		setSuccess("");
		if (!form.name.trim() || form.name.length < 2) {
			setFormError("Name must be at least 2 characters.");
			setSaving(false);
			return;
		}
		if (!form.slug.trim() || form.slug.length < 2) {
			setFormError("Slug must be at least 2 characters.");
			setSaving(false);
			return;
		}
		// Slug unique check
		const exists = tags.some(
			(t) =>
				(editTag ? t.id !== editTag.id : true) &&
				(t.name === form.name || t.slug === form.slug)
		);
		if (exists) {
			setFormError("Name or slug already exists.");
			setSaving(false);
			return;
		}
		let result;
		if (editTag) {
			result = await supabase
				.from("tags")
				.update({ name: form.name, slug: form.slug })
				.eq("id", editTag.id)
				.select()
				.single();
		} else {
			result = await supabase
				.from("tags")
				.insert({ name: form.name, slug: form.slug })
				.select()
				.single();
		}
		const { error } = result;
		if (error) {
			setFormError(error.message);
			setSaving(false);
			return;
		}
		setShowForm(false);
		setSaving(false);
		setSuccess(editTag ? "Tag updated!" : "Tag created!");
		fetchTags();
	};

	const handleDelete = async (id: string) => {
		setDeleteId(id);
		setError(null);
		setSuccess("");
		// Cek apakah ada post terkait
		const { data: rel } = await supabase
			.from("post_tags")
			.select("post_id")
			.eq("tag_id", id)
			.limit(1);
		if (rel && rel.length > 0) {
			setError("Cannot delete: tag is used by a post.");
			setDeleteId(null);
			return;
		}
		const { error } = await supabase.from("tags").delete().eq("id", id);
		if (error) setError(error.message);
		else setSuccess("Tag deleted!");
		setDeleteId(null);
		fetchTags();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tag Management</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-center mb-4">
					<Button onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-2" /> New Tag
					</Button>
					{loading && <LoadingSkeleton className="h-8 w-32" />}
				</div>
				{success && (
					<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded flex items-center gap-2">
						<CheckCircle className="h-4 w-4" /> {success}
					</div>
				)}
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
						<AlertCircle className="h-4 w-4" /> {error}
					</div>
				)}
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded shadow">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Name
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Slug
								</th>
								<th className="px-4 py-2 border-b text-left text-gray-900">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{tags.map((tag) => (
								<tr key={tag.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 border-b text-gray-800 font-medium">
										{tag.name}
									</td>
									<td className="px-4 py-2 border-b text-blue-700 font-mono">
										{tag.slug}
									</td>
									<td className="px-4 py-2 border-b">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(tag)}
											className="mr-2"
										>
											<Edit className="h-4 w-4 mr-1" /> Edit
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleDelete(tag.id)}
											className="text-red-600 hover:text-red-700 hover:bg-red-50"
											disabled={deleteId === tag.id}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{/* Modal Form */}
				{showForm && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
						style={{ backdropFilter: "blur(2px)" }}
						onClick={() => !saving && setShowForm(false)}
						aria-modal="true"
						role="dialog"
					>
						<div
							className="relative w-full max-w-md min-h-[200px] h-auto max-h-[60vh] bg-white rounded-2xl shadow-2xl animate-fadeInScale flex flex-col"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								type="button"
								className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
								onClick={() => !saving && setShowForm(false)}
								aria-label="Close"
								tabIndex={0}
							>
								<X className="h-6 w-6" />
							</button>
							<div className="p-6 overflow-y-auto flex-1">
								<form onSubmit={handleFormSubmit} className="space-y-4">
									{formError && (
										<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 flex items-center gap-2">
											<AlertCircle className="h-4 w-4" /> {formError}
										</div>
									)}
									<div>
										<label className="block text-sm font-medium mb-1">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={form.name}
											onChange={handleFormChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
											maxLength={32}
											placeholder="Tag name"
											disabled={saving}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">
											Slug
										</label>
										<input
											type="text"
											name="slug"
											value={form.slug}
											onChange={handleFormChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
											maxLength={32}
											placeholder="tag-slug"
											disabled={saving}
										/>
									</div>
									<div className="flex gap-2 pt-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowForm(false)}
											disabled={saving}
										>
											Cancel
										</Button>
										<Button type="submit" disabled={saving}>
											{saving ? "Saving..." : editTag ? "Update" : "Create"}
										</Button>
									</div>
								</form>
							</div>
						</div>
						<style jsx global>{`
							@keyframes fadeInScale {
								0% {
									opacity: 0;
									transform: scale(0.95);
								}
								100% {
									opacity: 1;
									transform: scale(1);
								}
							}
							.animate-fadeInScale {
								animation: fadeInScale 0.18s cubic-bezier(0.4, 0, 0.2, 1);
							}
						`}</style>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
