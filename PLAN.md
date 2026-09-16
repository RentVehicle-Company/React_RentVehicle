# Plan: Fix Hardcoded User Data + Dark Mode on Profile Page

## Context

The Profile page has two problems:
1. **Merge conflicts** in `UserProfile.jsx` and `authServices.js` prevent the page from working at all.
2. **Dark mode** is missing from the sidebar and login-method card.

The sub-components (`ProfileInfo`, `ProfileForm`) already consume `user` props dynamically — no hardcoded "John Doe" there. The root cause is the unresolved merge in `UserProfile.jsx` that blocks the data flow.

---

## Changes

### 1. Resolve `src/services/authServices.js` merge conflict
- Keep **both** the mock functions (HEAD: `getSession`, `loginUser`, `logoutUser`, `clearSession`, `persistSession`, `registerUser`, `DEFAULT_USER`, `getRegisteredUsers`) and the real API functions (dev: `login`, `register`, `verifyEmail`, `resendOtp`, `refreshToken`, `logout`, `loginWithGoogle`, `getAuthUser`, `storeAuthSession`, `signOut`).
- `AuthContext` imports the mock exports; `UserProfile` imports `signOut`. Both must exist.

### 2. Resolve `src/services/api.js` merge conflict
- Keep the dev branch's Bearer-token auth header.
- Keep the HEAD branch's try/catch fallback (returns `null` on network error) so the app works offline.

### 3. Resolve `src/pages/customer/UserProfile.jsx` merge conflict
- Use `useAuth()` for `user`, `isAuthenticated`, `logout`, `updateUser`, `openAuth` (from HEAD).
- Initialize user state from `sessionUser` with `getCachedUser()` fallback (from HEAD).
- Include `.catch()` fallback in `useEffect` (from dev).
- Include `handlePhotoChange` handler (from dev, missing in HEAD).
- Use context `logout()` for sign-out (from HEAD — cleaner than dev's `signOut` + `navigate`).
- Drop the `signOut` import (no longer needed).
- Pass `loginMethod` from `user` to `LoginMethodCard`.

### 4. Dark mode: `src/components/profile/ProfileSidebar.jsx`
- Container div: `bg-white` → `bg-white dark:bg-slate-800`
- Divider: add `dark:border-slate-700`
- Hover state on nav items: add `dark:hover:bg-slate-700`
- Icon color in inactive state: add `dark:text-slate-300`
- Text in inactive state: add `dark:text-slate-200`
- Logout hover: add `dark:hover:bg-red-900/30`

### 5. Dark mode: `src/components/profile/LoginMethodCard.jsx`
- Outer card: `bg-white` → `bg-white dark:bg-slate-800`, add `dark:border-slate-700`
- Title text: add `dark:text-white`
- Inner method card: `bg-slate-50` → `bg-slate-50 dark:bg-slate-700/50`, add `dark:border-slate-600`
- Method label: add `dark:text-white`
- Method description: add `dark:text-slate-400`
- Icon: add `dark:text-slate-300`

---

## Files Modified

| File | Change |
|------|--------|
| `src/services/authServices.js` | Resolve merge — export both mock + real functions |
| `src/services/api.js` | Resolve merge — token auth + offline fallback |
| `src/pages/customer/UserProfile.jsx` | Resolve merge — AuthContext data flow + `handlePhotoChange` |
| `src/components/profile/ProfileSidebar.jsx` | Add dark mode classes |
| `src/components/profile/LoginMethodCard.jsx` | Add dark mode classes |

## Verification

1. `npm run lint` — no errors
2. `npm run build` — no build errors
