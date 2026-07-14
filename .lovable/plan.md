Bhai aapne sab kuch select kiya — ye 4 alag-alag batches hain jo ek turn me realistically nahi ho sakte (schema changes, naye admin pages, tracking, XML parser, subscribe system). Main inko **phases me deliver karunga** taaki har phase test ho sake aur kuch toot na jaye. Existing data, users, admin roles — sab as-is rahega.

## Phase 1 — Quick Wins (this turn)
Frontend-only, koi schema change nahi:
- **Social share buttons** (WhatsApp, Facebook, Twitter, Copy link) news detail page pe
- **Related news section** — same category ke 4 articles article ke neeche
- **Auto slug generation** already backend me hai; admin form me live preview add karunga + manual override
- **AdSense-ready ad slots** — existing `AdSlot` component me `<ins class="adsbygoogle">` ke liye `data-ad-slot` prop support, env var `VITE_ADSENSE_CLIENT_ID` se auto-enable
- **robots.txt + sitemap** verify/fix — sitemap me sab published articles + categories include karunga
- **SEO polish**: per-route canonical, og:image se article image, JSON-LD Article schema (already partial hai)
- **Subscribe button** (header me) — email capture, Phase 2 me table banake save

## Phase 2 — Authors + Subscribers (next turn)
Schema changes:
- `authors` table (name, bio, avatar, slug) + `news.author_id` link
- `subscribers` table (email, subscribed_at) for subscribe button
- Author profile page `/author/$slug`
- Admin: authors CRUD page + news form me author dropdown

## Phase 3 — News Analytics (after Phase 2)
- `news_views` table (news_id, viewed_at, referrer)
- Client tracking hook on article view
- Admin dashboard charts (recharts): top 10 articles, daily views, category breakdown
- "Trending" section on homepage based on last 24h views

## Phase 4 — Blogger XML Import (last)
- Admin page `/admin/import`
- Upload Blogger `.xml` export
- Parse with `fast-xml-parser`, extract posts (title, content, labels→category, published_at, images)
- Download images → re-upload to storage bucket → rewrite URLs
- Bulk insert into `news` table with `imported_from_blogger=true` flag

---

## Technical notes (Phase 1 details)

- **Share buttons**: pure links (`https://wa.me/?text=...`, `https://www.facebook.com/sharer/sharer.php?u=...`), no JS deps; Copy uses `navigator.clipboard`
- **Related news**: new server fn `listRelatedNews({ category, excludeId, limit:4 })`, called from article loader
- **AdSense**: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=...">` injected in `__root.tsx` head only when `VITE_ADSENSE_CLIENT_ID` is set; `AdSlot` renders `<ins>` tag when both client ID and slot ID present, otherwise falls back to existing image-ad rendering
- **Sitemap**: update `src/routes/sitemap[.]xml.ts` to fetch all published news slugs + 5 categories, mark robots.txt to point at it
- **Subscribe**: just UI button + modal in Phase 1; saves to `localStorage` placeholder until Phase 2 table

Confirm karein to Phase 1 abhi start kar deta hu. Baki phases ek-ek karke deliver karunga.