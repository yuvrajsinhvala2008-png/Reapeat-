# Reapeat

Reapeat is a turf booking platform web application. This repository currently includes a lightweight Node.js implementation focused on APK download management for the web experience.

## APK Download Management

Admins can update the APK download link from the Admin page without changing code. Homepage and profile Download App buttons fetch the latest saved link before redirecting users to the APK.

### Run locally

```bash
npm start
```

Open <http://localhost:3000>.

### Admin flow

1. Visit `/admin.html`.
2. Paste the latest APK URL in the **APK Link** field.
3. Save the link.
4. Users can click **Download App** on the homepage or profile page to download the latest APK.

### Tests

```bash
npm test
```
