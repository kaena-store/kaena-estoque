# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

-   Adicionado "Tamanho Único" como uma opção de tamanho de roupa.

-   **Firebase Configuration:**
    -   Moved Firebase configuration from `dados firebase.txt` to `src/firebase.js`.
    -   Replaced hardcoded Firebase credentials with environment variables (`VITE_FIREBASE_API_KEY`, etc.) in `src/firebase.js`.
    -   Created a `.env` file to store these environment variables.
    -   Added `.env` to `.gitignore`.
    -   Corrected `src/firebase.js` to `export const app` and `export const analytics`.

-   **Data Migration:**
    -   Created `src/migration.js` to migrate data from `localStorage` to Firestore.
    -   Integrated `migrateData` function into `App.jsx` to run on application startup.

-   **Authentication Implementation:**
    -   Modified `App.jsx` to handle user authentication state using Firebase Authentication (`onAuthStateChanged`).
    -   Modified `Login.jsx` to provide a login form, pre-filled with provided credentials, and using `signInWithEmailAndPassword`.
    -   Modified `Navigation.jsx` to include a logout button using `signOut`.

-   **Firestore Integration and User-Specific Data:**
    -   Refactored `Clientes.jsx`, `Estoque.jsx`, `Compras.jsx`, `Vendas.jsx`, and `Dashboard.jsx` to:
        -   Receive the `user` object as a prop.
        -   Filter data queries by `user.uid`.
        -   Add `userId` to new documents created in Firestore.

-   **Version Control and Deployment Setup:**
    -   Initialized a Git repository.
    -   Set up Firebase Hosting using `firebase init`, configuring it to use `dist` as the public directory and setting up GitHub Actions for automatic deployments.

### Changed

-   **GitHub Actions Workflow:**
    -   Updated `.github/workflows/firebase-hosting-merge.yml` and `.github/workflows/firebase-hosting-pull-request.yml` to use `pnpm` instead of `npm` for dependency installation and building.
    -   Updated `.github/workflows/firebase-hosting-merge.yml` and `.github/workflows/firebase-hosting-pull-request.yml` to remove `source .env` and pass Firebase environment variables as GitHub Secrets.
    -   Updated `.github/workflows/firebase-hosting-merge.yml` and `.github/workflows/firebase-hosting-pull-request.yml` to remove `entryPoint`, `projectPath`, and `cwd` parameters from the `action-hosting-deploy` step, relying on default behavior.

-   **Git Configuration:**
    -   Configured Git user name and email to `kaenaadm` and `kaenaadm@gmail.com` for the repository.

### Fixed

-   **Build Errors:**
    -   Corrected `Estoque.jsx` and `Clientes.jsx` to include `export default` statements.
    -   Corrected `Login.jsx` to fix unterminated string literal in password `useState`.
    -   Corrected `firebase.json` not found error in GitHub Actions by removing `firebase.json` and `.firebaserc` from `.gitignore` and committing them.

### Removed

-   Removed the data migration logic from `localStorage` to Firestore.

### Fixed

-   Disabled Firestore offline persistence to resolve data inconsistency issues.
-   Fixed various import errors in the components.
-   Improved error handling in the `Vendas` component.

### Removed

-   `dados firebase.txt` file.
-   `DEPLOY_FIREBASE.md` and `README.md` files.
-   `logs/` folder added to `.gitignore`.
