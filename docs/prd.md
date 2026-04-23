# PRD: Personal Site — aravindcm.dev

## Problem Statement

I need a personal site that serves as a curated digital garden and portfolio — a place to publish writing, bookmark and comment on external references, and showcase projects. Existing solutions (resume sites, blogging platforms, productivity timelines) don't match my publishing style: publish only things that feel worth publishing, with taste and commentary as the primary value. I want something I own and control, that is fast, minimal, and pleasant to return to.

## Solution

A statically generated personal site built with Astro, TypeScript, MDX, and Tailwind v4, deployed on Vercel. The site has four routes: a landing page, a mixed feed of writing and curated references, a projects portfolio, and an about page. Content is authored in MDX files with structured frontmatter, validated by Zod schemas at build time. Feed filtering, search, and sort are client-side and URL-backed, powered by a React island. The visual identity is editorial monochrome with an amber/gold accent, Inter for body text, Geist Mono for code, and a system-aware light/dark theme toggled from the nav.

## User Stories

### Visitor — General

1. As a visitor, I want to see a clean landing page with a short intro, so that I understand who the site belongs to and what it contains.
2. As a visitor, I want to see a "Recent" section on the landing page, so that I can see what has been published or updated in the last 30 days without reading a timeline.
3. As a visitor, I want to see selected projects on the landing page, so that I can quickly assess the owner's work without browsing the full projects page.
4. As a visitor, I want to see selected feed items on the landing page, so that I get a sample of the writing and reference curation.
5. As a visitor, I want simple top-level navigation to Feed, Projects, and About, so that I can orient myself immediately.
6. As a visitor, I want the site to respect my OS light/dark preference on first visit, so that I don't get a jarring flash of the wrong theme.
7. As a visitor, I want a theme toggle in the navigation bar, so that I can switch between light and dark without digging through settings.
8. As a visitor, I want my manual theme preference to persist across visits, so that I don't have to toggle it every time.
9. As a visitor on mobile, I want the navigation to collapse into a stacked layout below the logo, so that I can still access all routes without a hamburger overlay.
10. As a visitor, I want pages to load fast, so that reading feels immediate.

### Visitor — Feed

11. As a visitor, I want to browse a mixed feed of essays, notes, links, tweets, videos, papers, and books on a single page, so that I can explore all content types together.
12. As a visitor, I want to filter feed items by type (essay, note, link, video, etc.), so that I can focus on content I'm in the mood for.
13. As a visitor, I want to filter feed items by topic, so that I can find content in a specific domain.
14. As a visitor, I want to filter feed items by person, so that I can find everything referencing a specific author or creator.
15. As a visitor, I want to search feed items by text, so that I can find a specific piece I half-remember.
16. As a visitor, I want filter and search state to be reflected in the URL, so that I can share or bookmark a filtered view.
17. As a visitor, I want filters to work on the client without a page reload, so that browsing feels fast and fluid.
18. As a visitor on desktop, I want filter controls in a right-side panel, so that they don't interrupt the reading flow of the feed.
19. As a visitor on mobile, I want filter controls in a compact collapsed drawer, so that they don't take up reading space by default.
20. As a visitor, I want to see each feed item's type clearly labeled, so that I know what I'm clicking into.
21. As a visitor, I want to see the owner's commentary prominently for external items, so that I understand why this item is worth reading.
22. As a visitor, I want external source metadata (site name, author, URL) displayed secondary to the commentary, so that the curation voice is primary.
23. As a visitor, I want feed items that have a detail page to be clickable into a full page, so that I can read essays and longer commentary in full.
24. As a visitor, I want feed items without a detail page to show as compact cards in the list, so that lightweight saves don't create empty pages.
25. As a visitor, I want feed items sorted by publish date (newest first) by default, so that I see the most recent content first.
26. As a visitor, I want to see people referenced in a feed item as subtle linked chips, so that I can understand the intellectual context.
27. As a visitor, I want topics displayed on each feed item, so that I can understand the domain at a glance.

### Visitor — Feed Detail Pages

28. As a visitor, I want to read a full essay on its own page, so that the reading experience is focused.
29. As a visitor, I want to see the original source linked from a feed detail page, so that I can visit the canonical source if needed.
30. As a visitor, I want commentary to be the primary content on external item detail pages, so that the page has value even if the source disappears.
31. As a visitor, I want feed detail pages to include SEO metadata, so that shared links render well in social previews.

### Visitor — Projects

32. As a visitor, I want to see a curated grid of projects on the projects page, so that I can browse finished and active work.
33. As a visitor, I want featured projects to have a more prominent visual treatment, so that the most important work stands out.
34. As a visitor, I want project cards to be text-first with optional cover images, so that every project can be represented even without strong visual assets.
35. As a visitor, I want to see project status (done, active, paused, archived) on each card, so that I understand where the project stands.
36. As a visitor, I want to click into a project detail page for serious projects, so that I can read a full writeup.
37. As a visitor, I want a project detail page to include a summary, commentary, links (demo, GitHub, article, docs), and optional screenshots, so that I understand the project's purpose and outcome.
38. As a visitor, I want project topics shown on cards, so that I can understand the technology domain at a glance.

### Visitor — About

39. As a visitor, I want an about page with a short intro, interests, principles, and contact information, so that I understand who the owner is and how to reach them.
40. As a visitor, I want broad location shown on the about page, so that I have geographic context without exposing precise details.
41. As a visitor, I want social links (GitHub, Twitter, LinkedIn, RSS) on the about page or footer, so that I can follow the owner elsewhere.

### Visitor — RSS

42. As an RSS reader user, I want to subscribe to a feed at /feed.xml, so that I receive new essays and substantial posts automatically.
43. As an RSS reader user, I want each RSS item to include a summary and short commentary excerpt, so that the feed is readable in my RSS client without clicking through.
44. As an RSS reader user, I want RSS items to link to the local detail page, so that I can read the full commentary in context.
45. As an RSS reader user, I want drafts excluded from the RSS feed, so that I only receive published content.

### Content Author (Site Owner)

46. As the site owner, I want to write content in MDX with frontmatter, so that I can use familiar tooling and embed components when needed.
47. As the site owner, I want content schemas validated at build time, so that I catch missing required fields or type errors before deploying.
48. As the site owner, I want to mark content as draft, so that I can work on pieces locally without publishing them.
49. As the site owner, I want drafts to appear with a visible Draft label in local development, so that I can preview unpublished content in context.
50. As the site owner, I want to mark feed items as featured, so that selected items can be promoted on the landing page.
51. As the site owner, I want to mark projects as featured, so that selected projects appear prominently on the landing page and projects page.
52. As the site owner, I want to set activityAt on feed items and projects, so that the Recent section surfaces only content I've intentionally marked as recent.
53. As the site owner, I want filenames to serve as slugs by default, so that URL structure is predictable without extra config.
54. As the site owner, I want to override the slug in frontmatter when needed, so that I can rename the URL without renaming the file.
55. As the site owner, I want a people collection I can reference from feed items, so that repeated references to creators and thinkers are structured, not ad hoc.
56. As the site owner, I want external items to use a typed source model (url, tweet, youtube, paper, book), so that rendering and previews are consistent.
57. As the site owner, I want hasPage: false items to exist in the feed list without generating a detail page, so that lightweight saves don't require written commentary.
58. As the site owner, I want Vercel Analytics enabled, so that I have basic privacy-friendly page view data without Google Analytics.
59. As the site owner, I want a sitemap generated at build time, so that search engines can index the site correctly.
60. As the site owner, I want canonical URLs and basic Open Graph metadata on every page, so that shared links render correctly.

## Implementation Decisions

### Stack
- Astro as the primary framework (static output)
- TypeScript throughout
- MDX for all content files
- Tailwind v4 with CSS-first `@theme` configuration for color tokens
- React islands for interactive components (feed filter, theme toggle)
- Vercel for deployment and analytics
- Inter (body/headings) and Geist Mono (code) via `@fontsource`

### Modules

**Content Schema Layer**
Zod schemas defined in `content.config.ts` for three collections: feed items, projects, and people. Schemas enforce required fields, discriminated source unions, and enum types. Validated entirely at build time — no runtime schema checks. This is the deepest module in the site; its interface is stable once defined.

**Site Config**
A single exported constant in `src/data/site.ts` containing: name, title, description, url, email, location, ogImage, socialLinks (github, twitter, linkedin, rss), and a data-driven nav array. All pages reference this for metadata and navigation.

**Base Layout**
An Astro layout component that wraps every page. Responsibilities: HTML shell, font preloads, inline theme initialization script (runs before first paint to prevent flash), Tailwind stylesheet, Vercel Analytics component, SEO meta slot, nav component, footer component.

**Theme System**
An inline `<script>` in `<head>` reads localStorage for an explicit preference, falls back to `prefers-color-scheme`, and sets a `dark` class on `<html>` before first paint. Tailwind's `dark:` variant handles all color switching. A ThemeToggle React island in the nav handles user interaction and updates both the class and localStorage.

**Feed Filter Island**
A React component that receives the full list of published feed items as props, manages URL search params for filter state (type, topic, person, source, q), and returns a filtered, sorted list using `useMemo`. Text search covers title, summary, and commentary fields. Filter controls render as a right-side panel on desktop and a collapsible drawer on mobile. This is the most complex interactive module.

**Feed Page**
An Astro page that queries the feed collection at build time, filters out drafts, passes all items to the Feed Filter Island as serialized props. Initial render is server-side; all filtering happens client-side.

**Feed Detail Page**
An Astro dynamic route (`/feed/[slug]`) generated only for items where `hasPage: true`. Renders the MDX body with full prose styling, source metadata, and people references.

**Landing Page**
An Astro page that queries feed items and projects, filters to those with `activityAt` within the last 30 days (limit ~6), selects featured projects and featured feed items, and renders three static sections: Recent, Selected Projects, Selected Feed Items.

**Projects Page**
An Astro page rendering a curated grid: featured projects first with larger treatment, remaining projects in a standard grid. No filters on day one.

**Project Detail Page**
An Astro dynamic route (`/projects/[slug]`). Renders project title, summary, commentary, links, images, and optional MDX body.

**RSS Feed**
An Astro endpoint at `/feed.xml`. Pure function of the feed collection — filters to published items where `hasPage: true`, serializes to RSS 2.0. Includes title, description, pubDate, link (local detail page), and a summary + commentary excerpt.

**SEO Meta Component**
An Astro component that accepts per-page title, description, and canonical URL, and renders `<meta>` tags, Open Graph tags, and Twitter Card tags. Used in BaseLayout with slot overrides per page.

### Content Model Key Decisions
- `activityAt` on both feed items and projects drives the Recent section — not `updatedAt`, not `publishedAt`
- `hasPage: boolean` is explicit, not inferred from body length
- `draft: boolean` on all content types — excluded from production builds and RSS
- `featured: boolean` on feed items and projects — for manual promotion
- Source model is a discriminated union — each external type has required fields specific to its kind
- Slug defaults to filename, overridable via frontmatter

### Layout Decisions
- Container max-width: 1140px
- Prose max-width: 720px
- Nav: static (scrolls away), inline collapse on mobile, theme toggle in nav bar
- Feed layout on desktop: content area + right-side filter rail
- No sticky nav

### Styling Decisions
- Tailwind v4 with `@theme` block for color tokens
- Color tokens: background `#FAFAFA`, surface `#F2F2F0`, text `#1A1A1A`, muted `#6B6B6B`, border `#E0E0DC`, accent `#C49A1E`, accent hover `#A07E18`
- Dark theme uses inverted values; accent holds across both themes
- Class-based dark mode (`dark:` variant on `<html>`)

### Feed Filter URL Contract
```
?q=       text search
?type=    feed item type (repeatable)
?topic=   topic slug (repeatable)
?person=  person slug (repeatable)
?source=  source kind (repeatable)
?sort=    publishedAt (default) | activityAt
```

## Testing Decisions

Good tests for this site verify **external behavior through the module's public interface**, not implementation details. Tests should not assert on internal state, intermediate variables, or Tailwind class names.

### Content Schema Layer
Test the Zod schemas directly with valid and invalid fixture objects. Good tests here: required fields missing, discriminated source unions with wrong kinds, draft exclusion logic, activityAt date handling. These tests are pure TypeScript — no Astro, no DOM.

### Feed Filter Island
Test the filtering and sorting logic in isolation, separate from the React rendering. Extract the filter function as a pure function that takes items + filter params and returns a filtered list. Test: text search matches on title/summary/commentary, type filters, combined filters, empty results, sort order. These tests run with Vitest, no browser needed.

### What not to test
- Astro page rendering (framework behavior, not product logic)
- Tailwind class application (CSS behavior)
- RSS XML formatting (standard library behavior)
- Vercel Analytics integration (third-party)

## Out of Scope

- View transitions (added after routes are stable)
- GitHub README sync script (`pnpm sync:readmes`)
- Generated Open Graph images (deferred until visual assets exist)
- Public `/people` routes (collection exists, no public pages initially)
- Project filter UI (not enough projects on day one)
- Separate projects RSS feed
- Admin UI or CMS
- Auth, API routes, or any server-side dynamic behavior
- Comment system
- Newsletter integration
- Analytics beyond Vercel Analytics

## Further Notes

- The implementation order is: scaffold → Vercel connect → content schemas → sample content → base layout and theme → landing page → feed page → feed filters → projects page → about page → RSS → sitemap → SEO meta.
- Connect Vercel at step 2 so every subsequent commit gets a preview URL.
- The people collection exists from day one as a data source for feed item filtering and references, but has no public routes.
- The Recent section on the landing page uses `activityAt` deliberately — not `updatedAt` — so that minor edits don't accidentally resurface old content.
- RSS links to local `/feed/[slug]` pages, not external canonical URLs, so the owner's commentary is the primary reading destination.
- All content authored by a coding agent or manually — the MDX + frontmatter format is equally machine-friendly.
