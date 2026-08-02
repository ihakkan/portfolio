import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Bangers, Comic_Neue } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import VisitorTracker from '@/components/visitor-tracker';

// Only the two families the design actually uses: Bangers via `font-headline`
// and Comic Neue via `font-body`. Everything else resolves to the system stack,
// so loading extra families only cost bandwidth.
const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
  display: 'swap',
});

const comicNeue = Comic_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-comic-neue',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: "#00ffff",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hakkan.is-a.dev'),
  title: "Hakkan Shah - Full Stack AI Engineer",
  description:
    "Hakkan Shah is a Full Stack AI Engineer at Persist, building AI agents that act on real interfaces, the fullstack systems behind them, and the product UI that makes them feel obvious. Creator of OHMSchool and AURA.",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Hakkan",
    "Hakkan Parbej Shah",
    "Hakkan Shah",
    "Fullstack AI Engineer",
    "AI Engineer",
    "AI Agents",
    "LLM Engineer",
    "Persist",
    "Persistian",
    "OHMSchool",
    "AURA",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "TypeScript Developer",
    "Developer Portfolio",
    "Software Engineer India",
    "hakkan.is-a.dev",
    "Hakkan Portfolio"
  ],
  authors: [{ name: "Hakkan Shah", url: "https://hakkan.is-a.dev" }],
  creator: "Hakkan Shah",
  publisher: "Hakkan Shah",
  category: "Personal Portfolio / AI Engineering",
  applicationName: "Hakkan Portfolio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: "Hakkan Shah - Full Stack AI Engineer",
    description:
      "Fullstack AI Engineer at Persist. I build AI agents that act on real interfaces, the backends that keep them reliable, and the interfaces humans enjoy using.",
    url: "https://hakkan.is-a.dev/",
    siteName: "Hakkan Shah Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hakkan Shah — Full Stack AI Engineer at Persist"
      }
    ],
    locale: "en_US",
    type: "profile"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkan Shah - Full Stack AI Engineer",
    description:
      "Fullstack AI Engineer at Persist, shipping AI agents, fullstack systems and product UI. Creator of OHMSchool and AURA.",
    creator: "@HakkanShah",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bangers.variable} ${comicNeue.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <VisitorTracker />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Hakkan Shah",
              "alternateName": "Hakkan Parbej Shah",
              "url": "https://hakkan.is-a.dev",
              "image": "https://hakkan.is-a.dev/og-image.jpg",
              "description":
                "Fullstack AI Engineer at Persist, building AI agents, fullstack systems and product interfaces. Creator of OHMSchool and AURA.",
              "email": "mailto:hakkanparbej@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://github.com/HakkanShah",
                "https://www.linkedin.com/in/hakkan/",
                "https://g.dev/hakkan",
                "https://hakkan.persist.org"
              ],
              "jobTitle": "Fullstack AI Engineer",
              "worksFor": {
                "@type": "Organization",
                "name": "Persist",
                "url": "https://persist.org/"
              },
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "Greater Kolkata College of Engineering and Management"
              },
              "knowsAbout": [
                "AI Agents",
                "Large Language Models",
                "Retrieval-Augmented Generation",
                "Fullstack Web Development",
                "Next.js",
                "TypeScript",
                "Node.js",
                "Python",
                "Product UI/UX"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
