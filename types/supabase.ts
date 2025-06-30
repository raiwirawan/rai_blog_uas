export type UserRole = "superadmin" | "admin" | "user";

export interface UserProfile {
	id: string;
	username: string;
	email: string;
	display_name: string | null;
	role: UserRole;
	created_at: string;
}

export interface Post {
	id: string;
	title: string;
	slug: string;
	content: string | null;
	author_id: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
	status: "draft" | "published";
	author?: UserProfile;
	categories?: Category[];
	tags?: Tag[];
}

export interface Category {
	id: string;
	name: string;
	slug: string;
}

export interface Tag {
	id: string;
	name: string;
	slug: string;
}

export interface PostCategory {
	post_id: string;
	category_id: string;
}

export interface PostTag {
	post_id: string;
	tag_id: string;
}
