# BlueberryDating

Girly iOS-feeling + Windows 94 retro app for private photo lists.

- Sign up with **userword + password** (logins saved: hashed + session cookie)
- Owner vault with edit / spicy pics / share link
- `/slideshow` — private vault of every upload (Blob + local)

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:5454](http://localhost:5454)

## Accounts

| userword | password | notes |
|---|---|---|
| `demo` | `1111` | auto-seeded |
| `berryberryberry` | `berryberry` | `npm run seed:berry` |

## Slideshow vault

- URL: `/slideshow`
- Password: `Gamlastan24` (or `SLIDESHOW_PASSWORD` env)
- Lists every upload from Vercel Blob + local `/public/uploads` + item photos
- Play / pause slideshow · preview strip · Win94 girl vibes

## Env

```bash
AUTH_SECRET=...
SLIDESHOW_PASSWORD=Gamlastan24
BLOB_READ_WRITE_TOKEN=   # optional — enables Vercel Blob
```
