# Magic Mail Classifier

A Next.js (App Router) application that uses NextAuth.js with Google OAuth and classifies emails with AI.

---

## Setup & Local Development

### 1. Install dependencies


### 2. Create a `.env.local` file

Copy `.env.example` to `.env.local` and fill in all required secrets (see below for description).

### 3. Required Environment Variables

| Variable Name           | Description                                         |
|------------------------ |-----------------------------------------------------|
| NEXTAUTH_URL           | Base URL of your app (e.g. http://localhost:3000)   |
| NEXTAUTH_SECRET        | Secret for signing NextAuth.js tokens               |
| GOOGLE_CLIENT_ID       | Google OAuth client ID                              |
| GOOGLE_CLIENT_SECRET   | Google OAuth client secret                          |
| NEXT_PUBLIC_BASE_URL   | Base URL exposed to the frontend (same as above)    |

**Note:**  
Add [theindianappguy@gmail.com](mailto:theindianappguy@gmail.com) as a test user in the Google Cloud OAuth console.

---

### 4. Run the development server


Visit [http://localhost:3000](http://localhost:3000) to see your app.

---

## Useful Commands

- `npm run dev`      Start local Next.js development server
- `npm run build`    Build for production
- `npm run start`    Start the production server

---

## Environment Variables Example


---

## Notes

- Do **not** commit your `.env.local` or any real secrets to version control.
- For more on Next.js environment variables, see the [official documentation](https://nextjs.org/docs/pages/guides/environment-variables).

