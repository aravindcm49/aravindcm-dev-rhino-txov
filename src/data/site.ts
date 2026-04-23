export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
  email?: string;
  location?: string;
  ogImage?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    rss?: string;
  };
  nav: { label: string; href: string }[];
}

export const site: SiteConfig = {
  name: "aravindcm",
  title: "aravindcm.dev",
  description:
    "A curated digital garden and portfolio — writing, references, and projects worth returning to.",
  url: "https://aravindcm.dev",
  email: "aravindcm49@gmail.com",
  location: "India",
  ogImage: "/og-default.png",
  socialLinks: {
    github: "https://github.com/aravindcm49",
    rss: "/feed.xml",
  },
  nav: [
    { label: "Feed", href: "/feed" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
  ],
};
