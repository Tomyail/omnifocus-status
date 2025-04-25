This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

This project requires certain environment variables to be set. Create a `.env.local` file in the project root and add the following:

```
# Connection string for your PostgreSQL database (e.g., from Neon, Supabase, etc.)
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require

# A secret key to protect the data import API endpoint
IMPORT_API_SECRET_KEY=your_strong_random_secret_key
```

Replace the placeholder values with your actual database connection string and a secure, randomly generated secret key.

When deploying to platforms like Vercel, ensure these environment variables are also configured in the project settings.

## Setup and Usage

Follow these steps to set up the project and visualize your OmniFocus task activity:

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd omnifocus-status
    npm install
    ```

2.  **Set Environment Variables:**
    *   Create a `.env.local` file in the project root.
    *   Add your PostgreSQL `DATABASE_URL`.
    *   Add a secure `IMPORT_API_SECRET_KEY`.
    ```
    DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
    IMPORT_API_SECRET_KEY=your_strong_random_secret_key
    ```
    *   *(Optional but recommended)* Run database migrations if you haven't already:
        ```bash
        npx drizzle-kit generate:pg
        npm run migrate # Or the command defined in your package.json
        ```

3.  **Deploy to Vercel:**
    *   Push your code to a Git repository (GitHub, GitLab, Bitbucket).
    *   Import the project into Vercel.
    *   During import or in the Vercel project settings, configure the **same** `DATABASE_URL` and `IMPORT_API_SECRET_KEY` environment variables you used locally.
    *   Let Vercel build and deploy the application. Note your deployment URL (e.g., `https://your-app-name.vercel.app`).

4.  **Configure the OmniFocus Script:**
    *   Open the OmniFocus script file: `support/task-activity-stats.omnijs`.
    *   Locate the configuration section at the top:
        ```javascript
        // Configuration: API Endpoint URL
        const API_ENDPOINT = 'https://your-app-name.vercel.app/api/import'; // <-- REPLACE with your Vercel URL
        // Configuration: Export tasks added within how many days
        const EXPORT_DAYS_AGO = 365; // Or your desired range
        // Configuration: API Authentication Token (replace with your own)
        const API_TOKEN = 'your_strong_random_secret_key'; // <-- REPLACE with your IMPORT_API_SECRET_KEY
        ```
    *   Replace the placeholder `API_ENDPOINT` with your actual Vercel deployment URL.
    *   Replace the placeholder `API_TOKEN` with the exact value you set for `IMPORT_API_SECRET_KEY`.

5.  **Install the OmniFocus Script:**
    *   In OmniFocus, go to `Help` -> `Open Scripts Folder`.
    *   Copy the modified `task-activity-stats.omnijs` file into this folder.
    *   You may need to restart OmniFocus or reload the scripts for it to appear in the Automation menu.

6.  **Run the OmniFocus Script:**
    *   In OmniFocus, select `Automation` -> `Export Task Activity` (or the label you defined in the script).
    *   The script will gather recent tasks and send them to your deployed API endpoint.
    *   Check the OmniFocus Console (`Window` -> `Console`) for logs and potential errors.

7.  **View the Dashboard:**
    *   Open your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`) in your browser.
    *   The heatmap and stats should reflect the data imported via the script.

## Importing Data

The application includes an API endpoint to import task data, typically from OmniFocus.

- **Endpoint:** `POST /api/import`
- **Authentication:** Requires an `Authorization` header with a Bearer token matching the `IMPORT_API_SECRET_KEY` environment variable.
  ```
  Authorization: Bearer your_strong_random_secret_key
  ```
- **Body:** Expects a JSON payload with a `tasks` array. Each task object in the array should conform to the expected structure (see `src/app/api/import/route.ts` for the Zod schema).

**Example using `curl`:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_strong_random_secret_key" \
  -d '{
        "tasks": [
          {
            "primaryKey": "task123",
            "name": "Example Task",
            "status": "completed",
            "modified": "2025-04-25T10:00:00.000Z",
            "completionDate": "2025-04-25T10:00:00.000Z"
            # ... other relevant task fields
          }
        ]
      }' \
  http://localhost:3000/api/import # Or your deployed URL
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
