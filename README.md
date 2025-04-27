# OmniFocus Status Dashboard

## Functionality

This project syncs completed OmniFocus task data to a web service, allowing you to visualize and track your task activity history over time. It consists of two main parts:

1.  **OmniFocus Scripts (`.omnijs`):** Automation scripts that run within OmniFocus. One script configures API settings, and the other collects recently completed tasks and sends them to the web service.
2.  **Web Service (Next.js App):** A web application built with Next.js that receives the task data via an API endpoint, stores it, and displays it on a dashboard.

![Screenshot](image.png)

## How to Use

### 1. Setup Web Service

This is a [Next.js](https://nextjs.org) project.

**Prerequisites:**
*   Node.js and npm/yarn/pnpm/bun installed.
*   A PostgreSQL database (e.g., from Neon, Supabase, Vercel Postgres).

**Installation & Setup:**
1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd omnifocus-status
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or yarn install / pnpm install / bun install
    ```
3.  Create a `.env.local` file in the project root and add your database connection string and API secret:
    ```env
    # Connection string for your PostgreSQL database
    DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"

    # Define a secret token for API authorization (must match OmniFocus config)
    IMPORT_API_SECRET_KEY="your_secure_random_token"
    ```
4.  Run database migrations (adjust command if not using drizzle):
    ```bash
    npx drizzle-kit generate # or your migration generation command
    npx drizzle-kit push # or your migration push command
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 2. Setup OmniFocus Scripts

This project uses two OmniFocus scripts located in the `support/` directory:

*   `configure-export.omnijs`: Allows you to set up the necessary API endpoint, token, and export duration via a form within OmniFocus.
*   `task-activity-stats.omnijs`: Reads the configuration saved by the configure script and exports task data to your web service.

**Setup Steps:**

1.  **Set Script Destination:**
    *   You need to tell the project where your OmniFocus Plug-Ins folder is located so the scripts can be copied.
    *   The recommended way is using [`direnv`](https://direnv.net/). Install `direnv` if you haven't already (`brew install direnv` on macOS) and hook it into your shell (follow `direnv` instructions).
    *   Create a file named `.envrc` in the project root (`/Users/lixuexin03/source/personal/omnifocus-status/`) with the following content, replacing the path with your actual OmniFocus Plug-Ins folder path:
        ```bash
        # Find your Plug-Ins folder via OmniFocus Menu: Automation -> Configure... -> Reveal Plug-Ins Folder
        export OMNIFOCUS_SCRIPTS_DIR="/path/to/your/OmniFocus/Plug-Ins"
        ```
    *   Run `direnv allow` in your terminal within the project directory. Now, `direnv` will automatically set the `OMNIFOCUS_SCRIPTS_DIR` environment variable whenever you `cd` into this project.

2.  **Sync Scripts to OmniFocus:**
    *   Run the sync command in your terminal:
        ```bash
        npm run sync
        # or yarn sync
        ```
    *   This command copies both `.omnijs` files from the `support/` directory to the `OMNIFOCUS_SCRIPTS_DIR` you defined in `.envrc`. OmniFocus should automatically detect the new plugins.

3.  **Configure Settings in OmniFocus:**
    *   Open OmniFocus.
    *   Run the "Configure Export Settings" action from the Automation menu (it might be under a submenu named after the plugin identifier or folder).
    *   A form will appear. Enter:
        *   **API Endpoint URL:** The full URL to your web service's import endpoint (e.g., `http://localhost:3000/api/import` or your deployed Vercel URL `/api/import`).
        *   **API Token:** The secret token that matches the `IMPORT_API_SECRET_KEY` in your `.env.local` file.
        *   **Export Tasks from Last (Days):** The number of days of task history to export (e.g., 7).
    *   Click "Save Settings". The configuration is now stored securely within OmniFocus preferences, linked to the plugin identifier (`com.tomyail.omnifocus-status.export`).

4.  **Run the Export Script:**
    *   Run the "Export" action from the Automation menu in OmniFocus whenever you want to send updated task data.
    *   Consider setting up a keyboard shortcut or adding it to your OmniFocus toolbar for quick access.

### 3. Deploy to Vercel (Optional)

*   Push your code to a Git repository (GitHub, GitLab, Bitbucket).
*   Import the project into Vercel.
*   During import or in the Vercel project settings, configure the **same** `DATABASE_URL` and `IMPORT_API_SECRET_KEY` environment variables you used locally.
*   Let Vercel build and deploy the application. Note your deployment URL (e.g., `https://your-app-name.vercel.app`).
*   Make sure to update the **API Endpoint URL** in the OmniFocus "Configure Export Settings" action to point to your Vercel deployment's API endpoint (e.g., `https://your-app-name.vercel.app/api/import`).

### 4. View Status

Once the "Export" script runs successfully and sends data to your web service, visit the web application URL (e.g., `http://localhost:3000` or your Vercel URL) to see your task activity dashboard.

---

*This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).*

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
