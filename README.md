#  Portfolio of Hakkan

A modern, interactive portfolio website built with Next.js 15, featuring stunning animations, interactive mini games.

**🌐 [Live Preview](https://hakkan.is-a.dev)** **→**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.2-pink?style=flat-square)](https://www.framer.com/motion/)

## ✨ Features

### 🎨 Visual Excellence
- **Stunning Animations** - Smooth, professional animations powered by Framer Motion
- **Interactive Background** - Dynamic floating elements with parallax effects
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices

### 📱 Sections
- **Hero** - Eye-catching introduction with animated terminal
- **About** - Professional background and expertise
- **Skills** - Comprehensive technical skill showcase with interactive effects
- **Experience** - Detailed work history with unique perspectives
- **Projects** - Portfolio of featured projects with live demos
- **Education** - Academic background
- **Certifications** - Professional certifications
- **Contact** - Get in touch via integrated form

> **🐣 Easter Eggs**: This portfolio contains several delightful easter eggs and interactive surprises. Explore and discover them yourself!

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: [Next.js 15.3](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 11.2](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)

### Additional Libraries
- **Icons**: [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Email**: [Resend](https://resend.com/)
- **Backend**: [Firebase](https://firebase.google.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HakkanShah/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
 
3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # 📧 Email Service (Resend)
   RESEND_API_KEY=your_resend_api_key
   # 👾 Discord Webhook (Visitor Notifications)
   DISCORD_WEBHOOK_URL=your_discord_webhook_url
   # 🔥 Firebase Configuration (Visitor Counter)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002)

## 🛠️ Setup Guide

### 🤖 Hakkan Bot (AI Assistant)

The chat assistant is powered by an LLM through [Groq](https://groq.com/), grounded on your own content — it does not make facts up from general knowledge.

1. Get an API key at [console.groq.com/keys](https://console.groq.com/keys).
2. **Set a spend limit while you're there.** The endpoint is public.
3. Add it to `.env.local`:
   ```bash
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=llama-3.3-70b-versatile   # optional override
   NEXT_PUBLIC_SITE_URL=https://your-domain.com   # optional; locks the API to your origin
   ```
4. Check the model id is still current at [console.groq.com/docs/models](https://console.groq.com/docs/models) — Groq retires models fairly often, and `GROQ_MODEL` lets you swap one without a redeploy.

Without a key the site works normally; the bot just explains that it isn't configured.

**Two files control what the bot knows — nothing else:**

| File | What goes in it |
|---|---|
| `src/lib/data.ts` | Structured facts: projects, jobs, skills, education, certifications. These already power the visible site, so editing here updates the page **and** the bot together. |
| `src/content/profile.ts` | Everything the site doesn't show: how the bot should sound, what you're available for, opinions, FAQs, off-limits topics. Plain prose. |

Built-in guardrails: the phone number in `CONTACT_INFO` is filtered out of the bot's context, answers are capped in length so the voice mode stays listenable, and `/api/chat` rate-limits per IP with a global daily ceiling.

### 👾 Discord Notifications
1. Create a server (or use an existing one) on Discord.
2. Go to **Server Settings** > **Integrations** > **Webhooks**.
3. Click **New Webhook**, give it a name (e.g., "Portfolio Bot"), and copy the **Webhook URL**.
4. Paste it into your `.env.local` as `DISCORD_WEBHOOK_URL`.

### 🔥 Firebase Visitor Counter
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Firestore Database** and create a database (Start in production mode).
3. Go to **Project Settings** > **General** > **Your apps** > **Web app** (</> icon).
4. Register the app and copy the `firebaseConfig` object values to your `.env.local`.
5. **Important**: Set Firestore Rules to allow read/write for the counter:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /site_stats/visitors {
         allow read, write: if true;
       }
     }
   }
   ```

## 💡 Features & Usage

### 🔗 Source Tracking
Track where your visitors are coming from by adding a `?ref=` parameter to your URL.
- **LinkedIn**: `your-site.com/?ref=linkedin`
- **Twitter**: `your-site.com/?ref=twitter`
- **Instagram**: `your-site.com/?ref=instagram`

The Discord notification will show **"🔗 Source: linkedin"**.

### Available Scripts

```bash
# Development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## 📦 Project Structure

```
portfolio/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/chat/     # Groq-backed assistant endpoint
│   │   ├── globals.css   # Global styles and animations
│   │   ├── layout.tsx    # Root layout with theme provider
│   │   ├── page.tsx      # Home page
│   │   └── sitemap.ts    # Dynamic sitemap generation
│   ├── components/       # React components
│   │   ├── assistant/    # Hakkan Bot chat UI + 3D bot
│   │   ├── games/        # Interactive mini-games
│   │   ├── ui/           # shadcn/ui components
│   │   ├── hero-section.tsx
│   │   ├── about-section.tsx
│   │   ├── skills-section.tsx
│   │   └── ...
│   ├── content/          # Prose the site doesn't render
│   │   └── profile.ts    # What the bot knows beyond data.ts  ← edit me
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and data
│       ├── assistant/    # Bot: prompt building, API client, voice
│       ├── data.ts       # Portfolio content data              ← edit me
│       ├── sound.ts      # Audio utilities
│       └── utils.ts      # Helper functions
├── public/               # Static assets
├── .gitignore
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 🎨 Customization

### Update Portfolio Content

Edit `src/lib/data.ts` to customize:
- Personal information
- Skills and expertise
- Work experience
- Projects
- Education
- Certifications

This is also what the AI assistant reads, so the site and the bot can never drift apart. For the bot's tone and anything the site doesn't display, edit `src/content/profile.ts`.

### Modify Theme Colors

Update `tailwind.config.ts` to change color scheme:
```typescript
theme: {
  extend: {
    colors: {
      // Customize your colors here
    }
  }
}
```

### Configure Animations

Adjust animation settings in `src/app/globals.css`:
```css
@keyframes your-animation {
  /* Custom animation keyframes */
}
```

## 🚀 Deployment

### Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production, Preview and Development), and mirror them in a local `.env.local`. See [.env.example](.env.example).

| Variable | Required | Notes |
|---|---|---|
| `GROQ_API_KEY` | **Yes**, for the bot | Without it the site works fine and the bot says it isn't configured. Server-only — never prefix with `NEXT_PUBLIC_`. |
| `GROQ_MODEL` | No | Overrides the default model. Change here instead of redeploying code when Groq retires a model. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Locks `/api/chat` to your own origin. `www.`, `*.vercel.app` previews and localhost are allowed automatically. Leave unset and the check is skipped. Inlined at build time, so changing it needs a redeploy. |
| `RESEND_API_KEY` | For the contact form | |
| `DISCORD_WEBHOOK_URL` | For visitor pings | |
| `NEXT_PUBLIC_FIREBASE_*` | For the visitor counter | |

### Pre-flight checklist

```bash
npm run typecheck   # must be clean — type errors now fail the build
npm run build
```

- [ ] `GROQ_API_KEY` set in Vercel, **and a spend limit set in the Groq console** — `/api/chat` is a public endpoint that costs money per call
- [ ] Model id in `GROQ_MODEL` still listed at [console.groq.com/docs/models](https://console.groq.com/docs/models)
- [ ] `src/content/profile.ts` has no `TODO` left that you care about
- [ ] Ask the deployed bot "where do you work now" — it must say Persist

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add the environment variables above
4. Deploy!

> Note: `/api/chat` runs on the Node runtime with `maxDuration = 15s` and aborts the upstream call at 8s. On the Vercel Hobby plan that sits inside the function limit.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HakkanShah/Portfolio)

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Deploy!

### Deploy to Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Connect

- **Portfolio**: [hakkan.is-a.dev](https://hakkan.is-a.dev)
- **LinkedIn**: [Hakkan](https://www.linkedin.com/in/Hakkan)
- **GitHub**: [@HakkanShah](https://github.com/HakkanShah)
- **Email**: [hakkanparbej@gamil.com](mailto:hakkanparbej@gamil.com)

## 🙏 Acknowledgments

- [Framer Motion](https://www.framer.com/motion/) for the incredible animation library
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icon set
- [Vercel](https://vercel.com/) for Next.js and hosting platform

---

<div align="center">
  <p>Built with ❤️ by Hakkan Shah</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div 
