# Pending Decisions

This document tracks decisions that are still open. The intended workflow is to continue deciding these one by one, with a recommended answer for each decision before implementation.

## 1. Theme

Open question:

```txt
Should the site support both light and dark themes, or be light-only?
```

Current recommendation:

```txt
Use system-aware light/dark with a manual toggle.
Design the light theme first.
Persist only explicit user preference in localStorage.
Avoid layout shift on initial load.
```

Why this needs a decision:

- A writing site benefits from dark mode for reading.
- The design should not become another dark developer portfolio by default.
- Theme behavior affects CSS architecture, initial render scripts, and color tokens.

Follow-up decisions:

```txt
Light-only vs light/dark
Manual toggle placement
Default behavior: system vs light
Color palette
Accent color
Code block theme
```

## 2. Visual Theme and Palette

Open question:

```txt
What should the site feel like visually?
```

Known direction:

```txt
Minimal
Writing-first
Restrained
Not timeline-driven
Not a clone of any reference site
```

Options to consider:

```txt
Editorial monochrome with one sharp accent
Warm paper-like reading theme
Technical notebook theme
High-contrast minimal theme
Soft personal archive theme
```

Guardrails:

```txt
Avoid a dominant purple / purple-blue gradient look.
Avoid generic dark blue / slate developer-site styling.
Avoid beige / cream / tan if it makes the site feel like a template.
Avoid cards inside cards.
Use cards only where they clarify repeated items.
```

Decision needed:

```txt
Primary background
Text color
Accent color
Border color
Code color theme
Light/dark color token mapping
```

## 3. Typography

Open question:

```txt
What type system should the site use?
```

Current recommendation:

```txt
Use strong readable typography as the main visual identity.
Use one excellent text face and one code face.
Avoid too many font families.
```

Decisions needed:

```txt
System fonts vs hosted fonts
Serif vs sans for long-form writing
Monospace choice for code
Heading scale
Line length
Line height
```

Suggested starting direction:

```txt
Body: readable sans or serif
Headings: same family with stronger weight, or a restrained display face
Code: stable monospace
Content width: around 680-760px for prose
```

## 4. Styling Implementation

Open question:

```txt
How should styles be implemented?
```

Options:

```txt
Plain CSS with CSS variables
Astro scoped styles
CSS modules
Tailwind CSS
UnoCSS
```

Current recommendation:

```txt
Use plain CSS with CSS variables and a small set of layout/component classes.
Consider Tailwind only if rapid utility-driven iteration is preferred.
```

Reason:

- The site is content-heavy and does not need a large design system on day one.
- CSS variables are enough for theme tokens.
- Plain CSS keeps the generated UI easier to inspect and less framework-dependent.

Decision needed:

```txt
Plain CSS vs Tailwind
Global token file structure
Component style pattern
Dark theme token strategy
```

## 5. Layout Details

Open questions:

```txt
What is the max content width?
How does navigation behave on mobile?
How does the feed filter rail collapse?
How dense should list pages be?
```

Known structure:

```txt
Landing: intro, recent, selected projects, selected feed items, footer
Feed: mixed stream with right-side filters on desktop
Projects: curated grid
About: short profile, interests, principles, contact, broad location
```

Decisions needed:

```txt
Desktop page width
Prose width
Grid breakpoints
Header layout
Sticky nav or static nav
Footer contents
Mobile nav pattern
Mobile filter drawer pattern
```

## 6. Feed Card Design

Open question:

```txt
How should feed items look in the list?
```

Known behavior:

```txt
Mixed content stream
Lightweight previews
Commentary is important
External source appears after or beside commentary
No category-tab UI
```

Decisions needed:

```txt
Dense list vs card-lite entries
Where type labels appear
How much commentary appears before truncation
How source previews look
How people references appear
How topics appear
How hasPage false items differ from hasPage true items
```

Recommended direction:

```txt
Use card-lite entries with clear hierarchy.
Avoid heavy boxed cards for every item.
Make commentary visually primary for external items.
Make source metadata secondary.
```

## 7. Feed Search and Sort

Open question:

```txt
Should the feed include text search on day one?
```

Known decision:

```txt
Filtering is client-side and URL-backed.
```

Decisions needed:

```txt
Filters only vs filters + text search
Sort options
Default sort
Whether search param is named q or search
Whether text search includes commentary and source metadata
```

Current recommendation:

```txt
Add lightweight text search on day one if implementation cost stays small.
Default sort by publishedAt descending.
Use activityAt only for homepage Recent, not for feed ordering.
```

## 8. Project Card Design

Open question:

```txt
Should project cards be image-first or text-first?
```

Known behavior:

```txt
Projects route is a curated grid.
No filters initially.
Project detail pages are optional and curated.
README may be included as a local snapshot.
```

Decisions needed:

```txt
Image-first vs text-first cards
Featured project card size
How links are shown
How project status appears
How screenshots are displayed
Whether cards use view transitions into detail pages
```

Current recommendation:

```txt
Use text-first cards with optional cover images.
Use larger visual treatment only for featured projects with strong assets.
```

## 9. View Transitions

Open question:

```txt
Where should route transitions be used?
```

Known direction:

```txt
Use route-level view transitions tastefully.
Avoid theatrics.
```

Decisions needed:

```txt
Global page fade or no global fade
Project card -> project detail transition
Feed item -> feed detail transition
Navigation active-state transition
Whether to use Astro view transitions or React-related transition APIs
Fallback behavior for unsupported browsers
```

Current recommendation:

```txt
Use Astro route-level view transitions for page navigation.
Use shared transitions only for project/feed cards when the visual mapping is clear.
```

## 10. Content Format and Folder Structure

Open question:

```txt
How should content files be organized?
```

Known stack:

```txt
Astro
TypeScript
MDX
Content collections / content layer
```

Proposed structure:

```txt
src/content/feed/
src/content/projects/
src/content/people/
src/data/site.ts
src/content.config.ts
```

Decisions needed:

```txt
MD vs MDX default
Slug conventions
Image location conventions
README snapshot location
How external metadata is represented
Whether feed item body is required when hasPage is true
```

Current recommendation:

```txt
Use MDX for feed and project detail content.
Use Markdown-compatible frontmatter for all content.
Use slug from filename unless explicitly overridden.
```

## 11. README Sync Workflow

Open question:

```txt
How exactly should GitHub README sync work?
```

Known decision:

```txt
Use a hybrid local snapshot model.
Sync only when meaningful project updates happen.
Avoid runtime GitHub fetches.
```

Decisions needed:

```txt
Manual sync script command name
Where snapshots are stored
Whether sync overwrites local edits
How to mark syncedAt
How to handle private repos
How to handle GitHub API rate limits
```

Current recommendation:

```txt
Create a pnpm sync:readmes script later.
Require project entries to opt in with readme.source = "github".
Write snapshots to a local content-adjacent folder.
Never overwrite curated commentary.
```

## 12. RSS Details

Known decision:

```txt
/feed.xml includes published feedItems where hasPage is true.
```

Still undecided:

```txt
RSS title
RSS description
Whether full content or excerpt is included
Whether external source links appear in item description
Whether RSS links to the local detail page or canonical external URL for external items
```

Current recommendation:

```txt
RSS should link to the local /feed/[slug] page.
Descriptions should include summary and a short commentary excerpt.
External source should be linked from the local page.
```

## 13. SEO and Social Cards

Open question:

```txt
How much SEO/social metadata should be built on day one?
```

Decisions needed:

```txt
Default title format
Default description
Per-page descriptions
Open Graph image strategy
Twitter card metadata
Canonical URLs
Sitemap
robots.txt
```

Current recommendation:

```txt
Implement basic SEO metadata and sitemap on day one.
Defer generated OG images unless the first version already has strong visual assets.
```

## 14. Analytics

Open question:

```txt
Should the site include analytics?
```

Options:

```txt
No analytics
Plausible
Fathom
Umami
Cloudflare Web Analytics
Vercel Analytics
```

Current recommendation:

```txt
Start with no analytics or a privacy-friendly tool only.
Avoid Google Analytics by default.
```

Reason:

- The site is personal and writing-first.
- Privacy-friendly defaults fit the content style.
- Analytics can always be added later.

## 15. Deployment

Open question:

```txt
Where should the site be deployed?
```

Options:

```txt
Vercel
Netlify
Cloudflare Pages
GitHub Pages
Personal VPS
```

Current recommendation:

```txt
Use Cloudflare Pages or Netlify for a static Astro site.
Use Vercel only if future server features or Vercel-specific tooling become important.
```

Decision needed:

```txt
Hosting provider
Build command
Output mode
Domain setup
Preview deployment behavior
Environment variables for GitHub README sync if needed
```

## 16. Image Handling

Open question:

```txt
How should images be stored and optimized?
```

Decisions needed:

```txt
Project image location
Feed preview image location
People avatar location
Whether external images are hotlinked or copied locally
Alt text requirements
Image optimization strategy
```

Current recommendation:

```txt
Store important images locally.
Use Astro image optimization where practical.
Require alt text for project images and meaningful feed images.
Avoid hotlinking images that are important to the page.
```

## 17. People Display

Known decision:

```txt
People are a supporting collection with no public routes initially.
```

Still undecided:

```txt
How people appear on feed cards
How people appear on detail pages
Whether people can be filtered from the right rail
Whether avatars are shown
Whether "why I follow" appears inline or only in richer views
```

Current recommendation:

```txt
Show people as subtle linked chips or references in feed items.
Include whyIFollow only when the page context benefits from it.
Use people filters on /feed because that is one of the main reasons for the collection.
```

## 18. About Page Copy and Contact

Open question:

```txt
What exact personal information should be public?
```

Known direction:

```txt
Intro
Work / interests
Principles
Contact
Broad location
```

Decisions needed:

```txt
Exact email presentation
Broad location wording
Which social links are included
Whether resume/CV is linked
Whether availability is mentioned
```

Current recommendation:

```txt
Use broad location only.
Use a mailto link or contact label for email.
Do not publish precise address details.
Defer resume unless this site needs to support job-search use cases.
```

## 19. Site Config Model

Open question:

```txt
What belongs in src/data/site.ts?
```

Proposed fields:

```ts
name: string
title: string
description: string
email?: string
location?: string
url: string
socialLinks: {
  github?: string
  twitter?: string
  linkedin?: string
  rss?: string
}
nav: {
  label: string
  href: string
}[]
```

Decision needed:

```txt
Exact field list
Whether nav is data-driven or hardcoded
Whether contact details are config or content
```

Current recommendation:

```txt
Use site.ts for stable singleton metadata.
Keep long About copy in MDX, not config.
```

## 20. Implementation Order

Open question:

```txt
What should be built first?
```

Recommended order:

```txt
1. Scaffold Astro + TypeScript + MDX.
2. Define content collections and schemas.
3. Add sample feed, project, and people content.
4. Build base layout, theme tokens, navigation, and footer.
5. Build landing page.
6. Build /feed with client-side filters.
7. Build /projects and project detail pages.
8. Build /about.
9. Add RSS and sitemap.
10. Add README sync later.
11. Add view transitions once route UI exists.
```

Reason:

- The data model should come before polished UI.
- Filters need real sample content to design well.
- View transitions should be added after route shapes are stable.

