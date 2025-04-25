# OmniFocus Status Dashboard

## Functionality

This project syncs completed OmniFocus task data to a web service, allowing you to visualize and track your task activity history over time. It consists of two main parts:

1.  **OmniFocus Script (`.omnijs`):** An Automation script that runs within OmniFocus to collect recently completed tasks and send them to a specified API endpoint.
2.  **Web Service (Next.js App):** A web application built with Next.js that receives the task data via an API endpoint, stores it (e.g., in a database), and displays it on a dashboard.

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
3.  Create a `.env.local` file in the project root and add your database connection string:
    ```env
    # Connection string for your PostgreSQL database
    DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"

    # Optional: Define a secret token for API authorization
    API_SECRET_TOKEN="your_secure_random_token"
    ```
4.  Run database migrations (if using Prisma or similar):
    ```bash
    npx prisma migrate dev # Or the relevant command for your setup
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 2. Configure & Install OmniFocus Script

1.  **Get the Script:** Find the `support/task-activity-stats.omnijs` file in the project.
2.  **Configure the Script:** Open the `.omnijs` file and modify the configuration variables at the top:
    ```javascript
    // Configuration: API Endpoint URL (Point this to your Web Service API)
    const API_ENDPOINT = 'http://localhost:3000/api/import'; // Or your deployed URL
    // Configuration: Export tasks added within how many days
    const EXPORT_DAYS_AGO = 7; // Adjust as needed
    // Configuration: API Authentication Token (Must match API_SECRET_TOKEN in .env.local)
    const API_TOKEN = 'your_secure_random_token'; // Use the same token as in .env.local
    ```
3.  **Install the Script:**
    *   Open OmniFocus.
    *   Select "Automation" -> "Configure..." from the menu bar.
    *   Click the "+" button and choose "Add Plug-In from File..." or drag the configured `.omnijs` file into the Plug-Ins window.
    *   Alternatively, save the configured script directly into your OmniFocus Plug-Ins folder. You can find this folder via Automation -> Configure... -> Reveal Plug-Ins Folder.
4.  **Run the Script:**
    *   You can run the script manually from the Automation menu in OmniFocus.
    *   Consider setting up a keyboard shortcut or adding it to your OmniFocus toolbar for quick access.

### 3. Deploy to Vercel (Optional)

*   Push your code to a Git repository (GitHub, GitLab, Bitbucket).
*   Import the project into Vercel.
*   During import or in the Vercel project settings, configure the **same** `DATABASE_URL` and `API_SECRET_TOKEN` environment variables you used locally.
*   Let Vercel build and deploy the application. Note your deployment URL (e.g., `https://your-app-name.vercel.app`).

### 4. View Status

Once the script runs successfully and sends data to your web service, visit the web application URL (e.g., `http://localhost:3000`) to see your task activity dashboard.

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
