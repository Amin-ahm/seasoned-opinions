# 💬 Seasoned Opinions

A crowdsourced guide where coworkers share and rate the things worth knowing
about, organized into sections: **Places** (restaurants, coffee, services,
mechanics, and more, with a map + place search), a **Marketplace** for coworker
side hustles, **Software & Skills**, and **News**. Star ratings, upvotes,
comments, tags, a **"Decide for Me"** picker with a 3D spinning wheel, and a map
of every place.

The entire site is gated behind **Google sign-in**. Any Google account can join.

## Tech stack

- **Vite + React** (JavaScript)
- **React Router** with **hash routing** (works on GitHub Pages, no server rewrites)
- **Firebase**, Firestore + Auth (Google provider only)
- **Leaflet + react-leaflet** with OpenStreetMap tiles (no API key, no billing)
- **Google Maps via plain URLs** (no Maps JS API, no billing)
- **three.js** via `@react-three/fiber` + `@react-three/drei` for the 3D scenes
- **GSAP** + `@gsap/react` (`useGSAP`) for motion
- Plain CSS design system, mobile-first, `prefers-reduced-motion`-aware
- Deployed to **GitHub Pages** via GitHub Actions

Everything runs on **free tiers with no billing account**. The only thing that
would require billing is real photo file uploads (Firebase Storage), which this
app deliberately avoids by using pasted image URLs.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/seasoned-opinions/
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Firebase setup

The Firebase web config is read from `VITE_FIREBASE_*` env vars, it is never
hardcoded in the source. (A web app's config is still visible in the shipped JS
bundle; env vars just keep it out of the repo. Real security comes from the
Firestore rules and the Auth authorized-domains list.)

1. In the [Firebase console](https://console.firebase.google.com), create a
   project (e.g. `seasoned-opinions`). Analytics can be off.
2. **Firestore Database** → create in production mode, nearby region.
3. **Authentication** → enable the **Google** sign-in provider.
4. **Project settings → Your apps** → register a **Web app** and copy the
   `firebaseConfig` object.
5. Local dev: create a `.env.local` file (gitignored) with the six keys:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   CI / GitHub Pages: add the same names as repository **Actions secrets**
   (`gh secret set VITE_FIREBASE_API_KEY --body ...`); the deploy workflow
   passes them into the build.
6. **Authentication → Settings → Authorized domains** → add
   `<your-username>.github.io` so Google sign-in works on the live site.

### Deploy the Firestore security rules

Rules live in [`firestore.rules`](firestore.rules). Deploy them with the
Firebase CLI (more reliable than pasting in the console):

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project seasoned-opinions
# or: npm run deploy:rules
```

The rules gate the whole database behind auth, restrict edits/deletes to
content owners, key votes/ratings to each user's uid (one per person), and let
any signed-in user update **only** the denormalized counter fields
(`voteScore`, `avgRating`, `ratingCount`) so the rating/vote transactions work
without a Cloud Function.

## Deployment (GitHub Pages)

Deployment is automated by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): on every push to
`main` it runs `npm ci`, `npm run build`, and publishes `dist/` to GitHub Pages
using the official `upload-pages-artifact` + `deploy-pages` actions.

One-time setup:

```bash
# Create a personal public repo, push, and enable Pages via GitHub Actions:
gh auth login
gh repo create seasoned-opinions --public --source=. --remote=origin --push
gh api -X POST repos/{owner}/seasoned-opinions/pages -f build_type=workflow
```

Your site lands at `https://<your-username>.github.io/seasoned-opinions/`.

> **Repo name matters.** The Vite `base` in
> [`vite.config.js`](vite.config.js) is set to `/seasoned-opinions/`. If you use
> a different repo name, update `REPO_NAME` there. For a `<user>.github.io` root
> repo, set `base` to `'/'`.

## Data model

```
users/{uid}                      { displayName, email, photoURL, createdAt }
spots/{spotId}                   { name, category, address, lat, lng, priceScale,
                                   tags[], availability[], orderLinks{}, whatsGood[],
                                   whatToSkip[], photoUrl, createdBy, createdByName,
                                   createdAt, avgRating, ratingCount, voteScore }
  comments/{commentId}           { text, authorId, authorName, createdAt }
  ratings/{uid}                  { stars }        // one per person
  votes/{uid}                    { value: 1|-1 }  // one per person
reports/{reportId}               { targetType, spotId, commentId?, reason,
                                   reportedBy, createdAt }
```

## Notes on content & photos

- Photos are **pasted image URLs only**, no file uploads. Users are responsible
  for having the rights to any image URL they submit (see the in-app Terms).
- The app never scrapes or displays images from Google Maps, DoorDash, or Uber
  Eats, it only ever renders those as clickable "Open / Order" links.
- A lightweight **Report** action on spots and comments writes a `reports` doc
  for the owner to review in the Firebase console.

## Legal

`#/privacy` and `#/terms` are real, readable starter templates with clearly
marked placeholders (`[CONTACT EMAIL]`, `[SITE OWNER / ENTITY NAME]`,
`[GOVERNING JURISDICTION]`, `[EFFECTIVE DATE]`). **They are not legal advice.**
Review and tailor them before relying on them.
