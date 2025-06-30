# Rai Blog UAS

A modern, full-featured blog platform built with **Next.js**, **Supabase**, **Tailwind CSS**, and **TypeScript**. Supports multi-role access (User, Admin, Superadmin), content management, and advanced performance optimizations.

---

## 🚀 Features

- **Authentication & Authorization**: Supabase Auth with roles (user, admin, superadmin)
- **Blog Management**: Create, edit, publish, categorize, and tag posts
- **Admin Dashboard**: Manage users, posts, categories, and tags
- **Superadmin Tools**: Promote/demote admins, full user control
- **User Dashboard**: Manage your own posts
- **Profile Management**: View and update profile
- **Modern UI**: Built with shadcn/ui, Tailwind CSS, and Lucide icons
- **Performance Optimizations**: Caching, lazy loading, skeletons, and more
- **Debug Panel**: Auth and role troubleshooting for admins

---

## 🗺️ Application Flow

### Guest (Belum Login)

- Bisa melihat halaman Home, Blog, dan Register/Login
- Tidak bisa mengakses Dashboard, Admin, atau Profile

### User (Setelah Login)

- Bisa mengakses Dashboard ("User Dashboard") untuk mengelola post sendiri
- Bisa mengedit profile
- Tidak bisa mengakses halaman Admin

### Admin

- Bisa mengakses Admin Dashboard
- Bisa mengelola post, kategori, dan tag
- Tidak bisa mengelola user/admin lain

### Superadmin

- Semua akses Admin
- Bisa mengelola user, promosi/demote admin, dan full control

---

## 🏗️ Tech Stack & Architecture

- **Next.js 15 (App Router)**
- **Supabase** (Auth, Database)
- **React 19**
- **TypeScript**
- **Tailwind CSS** (with shadcn/ui)
- **Radix UI** (for select, modal, etc)
- **Lucide React** (icons)

### Folder Structure

```
app/                # Next.js app directory (pages, layouts, API routes)
  ├─ admin/         # Admin & superadmin dashboard
  ├─ dashboard/     # User dashboard
  ├─ blog/          # Public blog pages
  ├─ profile/       # User profile page
  ├─ login/, register/ # Auth pages
  ├─ ...
components/         # Reusable UI components (ui/, navigation/, auth/, blog/, debug/)
hooks/              # Custom React hooks (auth, loading, etc)
lib/                # Supabase client, utilities
public/             # Static assets (favicon, images)
types/              # TypeScript types (database, supabase)
utils/              # Helper functions
```

---

## 🗄️ Database Schema (Supabase)

- **users**: id, email, username, display_name, role (superadmin/admin/user), created_at
- **posts**: id, author_id, title, slug, content, status, created_at, updated_at
- **categories**: id, name, slug
- **tags**: id, name, slug
- **post_categories**: post_id, category_id
- **post_tags**: post_id, tag_id

Role enum: `user_role = 'superadmin' | 'admin' | 'user'`

---

## ⚙️ Setup & Configuration

1. **Clone the repo:**
   ```bash
   git clone <repo-url>
   cd rai_blog_uas
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or yarn / pnpm / bun
   ```
3. **Configure environment:**
   - Copy `.env.example` to `.env.local` (if available)
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Run development server:**
   ```bash
   npm run dev
   ```
5. **Open:** [http://localhost:3000](http://localhost:3000)

### Other Scripts

- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code

---

## 🏎️ Performance Optimizations (Ringkasan)

- **Auth Hook**: Caching profile, parallel API, memoization, optimized loading
- **Loading Skeletons**: Reusable, consistent, and fast
- **Lazy Loading**: Navbar, DashboardButton, and more
- **Suspense**: Optimized fallback for async components
- **Next.js Config**: SWC minify, image/webp, gzip, tree shaking, suppress warnings
- **Supabase Provider**: Memoized, no unnecessary reloads
- **See:** [`PERFORMANCE_OPTIMIZATIONS.md`](./PERFORMANCE_OPTIMIZATIONS.md) for details

---

## 🧭 Navigation & Main Pages

- `/` — Home (intro, features, CTA)
- `/blog` — Public blog listing
- `/dashboard` — User dashboard (login required)
- `/admin` — Admin/superadmin dashboard (role required)
- `/profile` — User profile
- `/login`, `/register` — Auth pages
- `/not-found`, `/error` — Error handling

---

## 🛠️ Debug & Troubleshooting

- **Debug Panel**: Accessible from navbar (user menu)
  - Shows user, profile, role, and troubleshooting tips
  - Tools: Refresh profile, clear cache, force refresh
- **Common Issues**:
  - Tidak bisa akses admin? Cek role di Supabase table `users`
  - Profile tidak muncul? Pastikan user ada di table `users`
  - Lihat console/log untuk error detail

---

## 🤝 Contribution & Future Improvements

- PRs welcome! Lihat kode, buat branch, dan submit pull request
- **Planned:**
  - Service worker & asset caching
  - Preloading & virtual scroll for large lists
  - Image lazy loading
  - CDN for static assets
  - More tests & CI

---

## 🙏 Credits

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

---

> Rai Blog UAS — Modern, fast, and extensible blog platform for your next project!
