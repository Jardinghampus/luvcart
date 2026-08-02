# Luvcart

Private Win94 polaroid folders for cute / spicy shares — **incognito by default**.

## Stack

- Next.js + Vercel Blob
- Supabase project: **luvcart** (`eu-north-1`)
- Custom userword + password auth

## Local

```bash
npm install
npm run dev
```

http://localhost:5454

## Demo

| userword | password |
|---|---|
| `demo` | `1111` |

## Product

- Folders: Selfies / Vacation / Food + Feed
- Profile avatar (retro frame)
- Teaser mode: soft **1px** blur (toggle / clear)
- Spicy Filter for nudes
- Share my profile (`/u/username`) — no raw link in the main UI
- `/slideshow` vault (`Gamlastan24`) lists Blob + DB photos
- `robots.txt` disallows crawlers

## Env

```bash
AUTH_SECRET=
SLIDESHOW_PASSWORD=Gamlastan24
BLOB_READ_WRITE_TOKEN=
BLOB_STORE_ID=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```
