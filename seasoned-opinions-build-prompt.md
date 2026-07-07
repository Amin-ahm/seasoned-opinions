# Build Prompt: "Seasoned Opinions" — 0 to 100 + Deploy

> Paste everything below into **Claude Code** (run in an empty folder). It will scaffold, build, and prepare the app for deployment. A short **Manual Checklist** at the very end lists the handful of steps only you can do in the Firebase and GitHub web consoles — do those, then Claude Code finishes the deploy.

---

## ROLE & GOAL

You are building a complete, production-ready web app called **Seasoned Opinions** from scratch and deploying it to **GitHub Pages**. Build it end to end, create every file, wire up everything, and get it to a deployable state. Work autonomously; only stop to ask me for the values listed in "Inputs I Will Provide" below.

**What the app is:** A crowdsourced guide where coworkers share and rate nearby restaurants, coffee shops, and bakeries. Each spot has star ratings, a price scale, an honest "what's good / what to skip" breakdown, tags, ways to order (dine-in / pickup / DoorDash / Uber Eats / delivery) with direct links, and Google Maps links. Signed-in users vote, comment, and use a "Decide for Me" random picker. There's also a map view of all spots.

---

## TECH STACK (use exactly this)

- **Vite + React** (JavaScript, not TypeScript, unless trivial to add cleanly)
- **React Router** using **hash routing** (`createHashRouter` / `HashRouter`) — required because GitHub Pages has no server-side rewrites
- **Firebase JS SDK v10+**: Firestore + Auth
- **Auth: Google provider ONLY** (one-click Google sign-in). Do NOT add Apple, email/password, or any other provider.
- **Leaflet** + **react-leaflet** with **OpenStreetMap** tiles for the map view (no API key, no billing)
- **Google Maps via plain URLs only** — never the Maps JavaScript API (avoids billing)
- **Three.js via `@react-three/fiber` + `@react-three/drei`** for 3D visuals (react-three-fiber is Three.js for React — idiomatic and much cleaner than raw Three.js here)
- **GSAP** for motion, plus the official **`@gsap/react`** package for its `useGSAP()` hook (handles cleanup automatically in React). GSAP and all its plugins (ScrollTrigger, SplitText, etc.) are 100% free including commercial use — use them freely.
- Styling: your choice of plain CSS modules or Tailwind — keep it clean, modern, readable, and **mobile-first responsive** (see the Motion/3D/Responsiveness section). No heavy UI kit needed.
- Deploy: **GitHub Actions workflow** that runs `vite build` and publishes to GitHub Pages.

---

## AUTH & ACCESS MODEL

- The **entire site is gated behind Google sign-in.** An unauthenticated visitor sees only a landing/login screen with a "Sign in with Google" button. Nothing else is readable or writable until signed in.
- Any Google account may sign in (this is open to anyone, not domain-restricted).
- On first sign-in, create/merge a `users/{uid}` doc with `displayName`, `email`, `photoURL`, `createdAt`.
- I never want to handle passwords or credentials — rely entirely on Firebase Auth + Google OAuth. Do not build any custom credential handling.

---

## FIRESTORE DATA MODEL

```
users (collection)
  {uid}: { displayName, email, photoURL, createdAt }

spots (collection)
  {spotId}:
    name            (string)
    category        (string: "restaurant" | "coffee" | "bakery" | "other")
    address         (string)
    lat, lng        (number | null)   // for the map; may be null if not geocoded
    priceScale      (number 1-4)        // $ to $$$$
    tags            (array<string>)     // e.g. "vegan","quiet","team-lunch","cash-only"
    availability    (array<string>)     // subset of "dine-in","pickup","doordash","ubereats","delivery"
    orderLinks      (map)               // { doordash?, ubereats?, googleMaps? } — googleMaps auto-generated from address
    whatsGood       (array<string>)     // menu winners
    whatToSkip      (array<string>)     // menu duds
    photoUrl        (string | null)     // PASTED image URL only — no file upload
    createdBy       (uid string)
    createdByName   (string)
    createdAt       (timestamp)
    avgRating       (number)            // denormalized, maintained client-side in a transaction
    ratingCount     (number)            // denormalized
    voteScore       (number)            // denormalized net (upvotes - downvotes)

    comments (subcollection)
      {commentId}: { text, authorId, authorName, createdAt }

    ratings (subcollection)
      {uid}: { stars: number 1-5 }      // doc keyed by uid => one rating per person

    votes (subcollection)
      {uid}: { value: 1 | -1 }          // doc keyed by uid => one vote per person

reports (collection)
  {reportId}: { targetType: "spot" | "comment", spotId, commentId?, reason, reportedBy (uid), createdAt }
```

**Critical implementation detail:** enforce "one vote/rating per person" by keying the `votes` and `ratings` docs to the user's `uid` (not auto-IDs). A repeat vote just overwrites the previous. When a user votes or rates, update the parent spot's `voteScore` / `avgRating` / `ratingCount` in the **same Firestore transaction** so no Cloud Function is needed (Cloud Functions would require enabling billing — avoid entirely).

---

## FIRESTORE SECURITY RULES (create `firestore.rules`)

Whole site requires auth. Users can only write their own votes/ratings and can only edit/delete their own spots/comments.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() { return request.auth != null; }

    match /users/{uid} {
      allow read: if signedIn();
      allow write: if request.auth.uid == uid;
    }

    match /spots/{spot} {
      allow read: if signedIn();
      allow create: if signedIn() && request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.createdBy == request.auth.uid;
      // Allow denormalized counter updates from anyone signed in (rating/vote transactions):
      // If you prefer stricter rules, gate updates to only the counter fields.

      match /comments/{c} {
        allow read: if signedIn();
        allow create: if signedIn() && request.resource.data.authorId == request.auth.uid;
        allow delete: if signedIn() && resource.data.authorId == request.auth.uid;
      }
      match /votes/{uid} {
        allow read: if signedIn();
        allow write: if request.auth.uid == uid;
      }
      match /ratings/{uid} {
        allow read: if signedIn();
        allow write: if request.auth.uid == uid;
      }
    }

    match /reports/{report} {
      allow create: if signedIn() && request.resource.data.reportedBy == request.auth.uid;
      allow read, update, delete: if false;   // only the owner reviews these in the Firebase console
    }
  }
}
```

> Note on the counter-update rule: the vote/rating transaction updates the parent spot's `voteScore`/`avgRating`/`ratingCount`. Write the `spots` update rule so a signed-in user may update ONLY those three denormalized fields on any spot (validate that no other fields change), while full edits remain restricted to `createdBy`. Implement this cleanly in the rules.

---

## FEATURES TO IMPLEMENT

1. **Auth gate** — login screen when signed out; full app when signed in. Sign-out button in the header. Show the user's name/avatar.

2. **Add a Spot** — a form for every field above. `orderLinks.googleMaps` is auto-generated from the address, not typed. For lat/lng: attempt free geocoding via the OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search?format=json&q=<address>`) on submit; if it fails, save with `lat/lng = null` (spot still works, just no map pin). Respect Nominatim usage: one request per submit, set a descriptive `User-Agent`/`Referer` if possible.

3. **Spot list / home** — cards showing name, category, price scale ($–$$$$), avg rating (stars), vote score, tags, availability chips. Sortable by rating, vote score, price, distance-unavailable-so-skip, and newest.

4. **Spot detail page** — full info, `whatsGood` / `whatToSkip` lists, the pasted photo (if any), a Google Maps "Open" link and "Directions" link (build URLs below), order buttons for any present `orderLinks`, the ratings + voting controls, and the comments thread.

5. **Voting + rating** — up/down vote and 1–5 star rating, one per user, using the uid-keyed-doc + transaction pattern. UI reflects the current user's existing vote/rating.

6. **Comments** — signed-in users add comments; authors can delete their own.

7. **Filters + search** — text search on name; filter by category, price range, tags, and availability (e.g. "on DoorDash AND under $$"). All client-side over the loaded spot list.

8. **"Decide for Me" picker** — applies the currently active filters, then picks from the survivors. Modes: **Surprise Me** (uniform random), **Crowd Favorite** (weighted by voteScore/avgRating), **Something New** (exclude spots the current user has already rated). This is the app's showcase moment — make the reveal fun with a 3D spinning wheel / slot-machine effect (see Motion/3D section). Handle the empty-result case gracefully.

9. **Map view** — Leaflet + OpenStreetMap, a pin per spot that has lat/lng, popups linking to the spot detail page.

10. **Nice polish** — a "Trending this week" or top-rated strip on the home page (sort by voteScore); loading and empty states everywhere; mobile responsive.

11. **Flag / report content** — a small "Report" action on spots and comments that writes a `reports` doc (see data model) so the owner can review and remove problematic or infringing content. Keep it lightweight.

**Google Maps URL helpers (no API key):**
- Open location: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
- Directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

**Order/map links (`orderLinks`):** users may paste Google Maps, DoorDash, and Uber Eats URLs. Store them and render them as clickable "Open" / "Order" buttons. Linking out is all we do with them.

**Photos — IMPORTANT policy:**
- Photos come ONLY from the user: a pasted image URL they took or otherwise have the rights to use. Store it as `photoUrl`.
- Do NOT implement Firebase Storage / file upload (would require billing).
- Do NOT scrape, fetch, unfurl, or auto-display images from Google Maps, DoorDash, Uber Eats, or any pasted third-party link. Those images are copyrighted and those platforms' terms prohibit reuse — and it's technically impossible from a static, backend-less site anyway (CORS + JS-rendered pages). Only ever render the link as a clickable button, never its images.
- The Terms (below) must make users responsible for having rights to any image URL they submit.

---

## MOTION, 3D & RESPONSIVENESS

Make the site feel cool and fun with Three.js and GSAP — but never at the cost of load speed, mobile smoothness, or accessibility. Follow these rules exactly.

**Art direction — whimsical:** aim for playful and cartoony, not sleek/corporate. Chunky low-poly food characters with rounded edges, warm saturated colors, soft bouncy easing (a little squash-and-stretch, gentle overshoot), maybe subtle googly personality on the food objects. Think "fun and friendly," not "minimal glass and particles." Keep it charming and light, and still subject to all the performance/mobile/reduced-motion rules below.

**Where to use 3D (react-three-fiber):**
- **Hero scene** on the landing/home area: a light, playful low-poly 3D scene — e.g. a few gently bobbing/rotating food objects (coffee cup, croissant, pin/marker) or a soft animated particle/gradient backdrop. Tasteful, not noisy.
- **"Decide for Me" picker:** a 3D spinning wheel or slot-machine reveal is the centerpiece. GSAP drives the spin timing/easing; react-three-fiber renders the wheel. Land it on the chosen spot with a satisfying ease-out.
- Keep every 3D scene **optional and non-blocking** — the app must be fully usable if 3D never loads.

**Where to use GSAP:**
- Staggered reveal of spot cards as they load / scroll into view (ScrollTrigger).
- Page/route transitions (short, snappy timelines).
- Micro-interactions: star-rating pop, upvote bounce, filter-chip toggles, button hovers.
- Optional SplitText headline reveal on the hero.
- Use the **`useGSAP()`** hook from `@gsap/react` for all GSAP work in components (automatic cleanup). Register plugins (`gsap.registerPlugin(ScrollTrigger, ...)`) once at app init.

**Performance guardrails (mandatory):**
- **Lazy-load all 3D.** Three.js is heavy — code-split the 3D scenes with `React.lazy` + dynamic `import()` and wrap in `<Suspense>` so they never block first paint or the initial bundle. The core app (list, detail, voting) must render fast without waiting on Three.js.
- Cap `react-three-fiber` device pixel ratio: `dpr={[1, 2]}`. Use `frameloop="demand"` (or pause via IntersectionObserver) so scenes don't burn battery when offscreen or idle.
- Prefer low-poly geometry and cheap materials; no heavy post-processing on mobile.

**Responsiveness (mandatory):**
- **Mobile-first.** Everything works and looks good from ~320px up through desktop. Fluid layouts, sensible breakpoints, comfortable touch targets.
- On small screens: collapse filters into a bottom-sheet/drawer, stack cards single-column, keep the map full-width, and **simplify or drop the 3D** (smaller scene, fewer objects, lower dpr — or a static image/CSS fallback) so phones stay smooth.
- The Leaflet map, forms, and the Decide-for-Me modal must all be fully usable on touch.

**Accessibility (mandatory):**
- Respect **`prefers-reduced-motion`**: when set, disable or drastically reduce animations and skip the spinning/3D flourishes, showing an instant result instead. Use `gsap.matchMedia()` and/or a CSS media query to gate motion — this also lets you scope different animations to mobile vs desktop cleanly.
- Motion is decorative: never hide essential content or functionality behind an animation completing.

---

## LEGAL PAGES (Privacy Policy & Terms) — required

Create two real pages as routes (`#/privacy` and `#/terms`), linked in the site footer and on the login screen ("By signing in you agree to our Terms and Privacy Policy"). Write actual readable content, not "lorem ipsum." Use clearly marked placeholders — `[CONTACT EMAIL]`, `[SITE OWNER / ENTITY NAME]`, `[GOVERNING JURISDICTION]`, `[EFFECTIVE DATE]` — for me to fill in. Add a plain-language note at the top of each: "This is a starting template, not legal advice."

**Privacy Policy must cover:**
- What's collected: Google account profile (display name, email, avatar) via Google sign-in; content the user posts (spots, reviews, comments, ratings, votes, image URLs); basic technical/auth data.
- How it's used: to operate the site (show who posted what, enable voting/comments).
- Where it's stored/processed: Google Firebase (Firestore + Authentication); note data leaves the user's device and is handled by Google.
- What is NOT done: data is not sold; no ads.
- Cookies / local storage: used only for keeping the user signed in.
- User rights: how to request deletion of their account/content (contact `[CONTACT EMAIL]`); note users can delete their own spots/comments in-app.
- Third-party links: the site links out to Google Maps, DoorDash, Uber Eats, which have their own privacy policies.
- Contact info and effective date placeholders.

**Terms & Conditions must cover:**
- Eligibility: must have a valid Google account; age requirement placeholder (e.g. 13+ or per `[GOVERNING JURISDICTION]`).
- User-generated content: users keep ownership but grant the site a non-exclusive license to display their submissions on the site.
- **Content responsibility (important):** users represent that they own or have the rights to any image URL, text, and links they post, and must NOT post third-party copyrighted images (including photos copied from Google Maps, DoorDash, Uber Eats, or other sites). Reviews are personal opinions.
- Acceptable use: no spam, harassment, illegal or infringing content.
- Moderation: the owner may remove content or accounts, and provides the Report feature; include a simple takedown/contact path at `[CONTACT EMAIL]`.
- Disclaimer: site provided "as is," no warranty; ratings/reviews are opinions, not endorsements.
- Governing law placeholder and contact info.

> I am not a lawyer and these templates are not legal advice. If the site grows or represents an organization, have them reviewed and tailored to the applicable jurisdiction (e.g. Canada's PIPEDA, GDPR if EU users, etc.).

---

## FIREBASE CONFIG HANDLING

- Put the Firebase web config in `src/firebase.js`. This config (`apiKey`, `authDomain`, `projectId`, etc.) is a public identifier and is **safe to commit** — security comes from the Firestore rules, not from hiding it. Do not invent a secrets/env scheme for it; committing it directly is fine and simplest. (If you prefer, read it from Vite env vars with sensible fallbacks, but do not block deployment on secrets.)
- I will paste my real Firebase config when you ask for it.

---

## DEPLOYMENT (GitHub Pages)

- Set `base` in `vite.config.js` to `'/<REPO_NAME>/'` (I'll give you the repo name; if it's a `<user>.github.io` root repo, base is `'/'`).
- Use **hash routing** so deep links work without server rewrites.
- Create `.github/workflows/deploy.yml` that, on push to `main`: checks out, sets up Node, `npm ci`, `npm run build`, and deploys `dist/` to GitHub Pages using the official `actions/upload-pages-artifact` + `actions/deploy-pages` flow with the correct `permissions` (`pages: write`, `id-token: write`) and `github-pages` environment.
- Add a solid `README.md` documenting local dev (`npm install`, `npm run dev`), the Firebase setup steps, and how deployment works.
- Include a `.gitignore` (node_modules, dist, etc.).

---

## INPUTS I WILL PROVIDE (ask me for these when you need them)

1. My **Firebase web config** object (from the Firebase console).
2. The **GitHub repo name** (for the Vite `base` path).

Everything else: proceed autonomously with good defaults.

---

## SUGGESTED BUILD ORDER

1. Scaffold Vite + React, install deps (firebase, react-router-dom, leaflet, react-leaflet, three, @react-three/fiber, @react-three/drei, gsap, @gsap/react).
2. `src/firebase.js` (init app, Firestore, Auth, Google provider) + `firestore.rules`.
3. Auth gate + header (sign in/out, user chip), `users/{uid}` upsert on login.
4. Data layer: helper functions for spots, comments, votes (uid-keyed + transaction), ratings.
5. Add-a-Spot form (+ Nominatim geocode + auto Google Maps link).
6. Spot list/home + spot detail pages. **Build these to work with zero animation first** — motion is layered on later, never a dependency.
7. Voting + rating UI and transactions.
8. Comments.
9. Filters, search, availability/price/tag/category logic.
10. "Decide for Me" picker (three modes) — wire up the logic first, then the 3D wheel/slot reveal.
11. Leaflet map view.
12. Report/flag action on spots + comments (writes `reports` docs).
13. Privacy Policy + Terms pages (`#/privacy`, `#/terms`), footer links, and the login-screen agreement line.
14. **Motion & 3D pass:** lazy-loaded hero 3D scene, GSAP card reveals + micro-interactions + transitions, the Decide-for-Me 3D reveal. Register GSAP plugins once; use `useGSAP()`.
15. **Responsive + accessibility pass:** mobile-first layouts, filter drawer on small screens, `prefers-reduced-motion` gating, `gsap.matchMedia()` for mobile/desktop scoping, dpr caps and offscreen pausing for 3D.
16. `vite.config.js` base, GitHub Actions workflow, README, .gitignore.
17. Final check: `npm run build` succeeds, no console errors, routes work under hash routing, test at mobile widths, and confirm the app is fully usable with 3D disabled and with reduced-motion on.

Please start now. Scaffold the project, then tell me the first point where you need one of my inputs.

---

---

# SETUP CHECKLIST (mostly automated)

Most of this is now delegated to tools. You supervise and approve; you rarely type.

**A) Firebase setup — drive it with the Claude browser extension (Claude for Chrome)**

The Firebase console is point-and-click, so use **Claude for Chrome** to do the clicking. Sign into your Google account in Chrome first (the extension acts as you and can't complete the Google login for you), then give it this task and **watch/approve each step** — the console is a sensitive surface, so review actions before confirming:

> "In the Firebase console (console.firebase.google.com), create a new project named `seasoned-opinions` (Google Analytics can be off). Then: (1) create a Firestore Database in production mode in a nearby region; (2) under Authentication, enable the Google sign-in provider; (3) register a new Web app and show me the firebaseConfig object; (4) under Authentication → Settings → Authorized domains, add `<username>.github.io`. Pause and let me confirm before each create/enable action."

Then, two things to hand off:
- **firebaseConfig:** copy the object the extension surfaces (or read it back) and paste it to **Claude Code** when it asks. This is the one value you move by hand.
- **Security rules:** don't paste these in the console. Let **Claude Code** deploy `firestore.rules` from the terminal with the Firebase CLI — more reliable than clicking:
  ```
  npm i -g firebase-tools
  firebase login
  firebase deploy --only firestore:rules --project seasoned-opinions
  ```

> Reality check: Claude for Chrome is a preview browsing agent — it's good at navigating and clicking, but it can stall on unexpected dialogs or verification prompts. Stay in the loop; if it gets stuck on a step, finish that one step by hand and let it continue. The Google account login and any 2FA are always yours to complete.

**B) GitHub repo — create it with the GitHub CLI (`gh`), personal account**

Have **Claude Code** run these (or run them yourself). This creates a **personal** repo (not under an organization), pushes the code, and turns on Pages via the API — no console clicking:
```
# Auth once (opens browser):
gh auth login

# Create a PERSONAL repo (owner defaults to your user; do NOT pass an org):
gh repo create seasoned-opinions --public --source=. --remote=origin --push

# Enable GitHub Pages with the GitHub Actions build type:
gh api -X POST repos/{owner}/seasoned-opinions/pages \
  -f build_type=workflow
# If Pages already exists, update instead:
# gh api -X PUT repos/{owner}/seasoned-opinions/pages -f build_type=workflow
```
Notes:
- Give the repo name (`seasoned-opinions`) to Claude Code so it sets the Vite `base` to `/seasoned-opinions/`.
- Because `gh repo create ... --source=. --push` uses your authenticated **user** as owner, this stays a personal repo. (An org repo would look like `gh repo create ORG/name` — you are deliberately not doing that.)
- After the first push, the deploy workflow runs automatically. Your site lands at `https://<username>.github.io/seasoned-opinions/`.
- Don't forget the Authorized-domains step in part A uses this same `<username>.github.io` domain, or Google sign-in will fail on the live site.

**C) Cost sanity check**
- Everything above stays on free tiers with **no billing account**: GitHub Pages (free), Firebase Spark (free, no pausing), OpenStreetMap/Leaflet (free), Google Maps links (free).
- The ONLY thing that would require enabling billing is real photo file uploads (Firebase Storage). This build avoids that by using pasted image URLs. Keep it that way to stay at $0.
