# REAPEAT

**Post Tasks. Earn Together.**

REAPEAT is a premium local task marketplace concept and web preview. Anyone can post a local task, and anyone can earn by completing work such as poster distribution, event help, shop surveys, delivery, cleaning, installation, marketing, temporary jobs and student gigs.

## What is included

- Production-style responsive landing page with Material Design 3 inspired surfaces, glassmorphism, soft shadows and rounded 16–20px cards.
- Complete marketplace UX sections for task creators, workers, task cards, nearby tasks, wallet, chat, ratings, notifications and AI safety.
- Admin dashboard preview for users, tasks, payments, commission settings, disputes, verification requests, support tickets and APK link management.
- Profile workspace preview for creator tasks, worker applications, wallet balances, ratings and activity.
- Lightweight Node.js server for static hosting and dynamic APK download URL management.

## Target stack

- Flutter mobile app
- React marketing website
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Cloud Functions
- Push Notifications
- Google Maps
- Responsive web design, dark-mode-ready tokens and SEO optimized pages

## APK Download Management

Admins can update the APK download link from the Admin page without changing code. Homepage and profile Download App buttons fetch the latest saved link before redirecting users to the APK.

## Run locally

```bash
npm start
```

Open <http://localhost:3000>.

## Admin flow

1. Visit `/admin.html`.
2. Paste the latest APK URL in the **APK Link** field.
3. Save the link.
4. Users can click **Download App** on the homepage or profile page to download the latest APK.

## Tests

```bash
npm test
```
