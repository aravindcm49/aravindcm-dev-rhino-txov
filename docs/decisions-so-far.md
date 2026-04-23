# Decisions So Far

This document records the product, architecture, content, and data-model decisions made so far for the personal site. It is intentionally written as a working decision record, not a final PRD.

## Product Shape

The site is a personal digital garden and portfolio.

It is not a resume site, startup landing page, project-management app, or productivity timeline. The site should feel like a curated archive of work, writing, references, and people worth returning to.

Reason:

- The site should match the owner's publishing style: publish only things that feel worth publishing.
- A timeline creates pressure to constantly show progress, which does not fit the desired workflow.
- The value of the site should come from taste, commentary, and finished work rather than activity tracking.

## Route Structure

The public site will have four top-level routes:

```txt
/          Landing page
/feed      Mixed feed of writing and curated external references
/projects  Projects
/about     Profile, interests, principles, contact, broad location
```

The landing page should not visibly say "Home". It should simply open with the site's primary introduction.

Reason:

- Four routes keep the site small and maintainable.
- `/feed` is broader and more accurate than `/articles`, because the content includes essays, notes, links, tweets, videos, papers, and books.
- The site should avoid expanding into unnecessary routes before the content justifies them.

## Landing Page Structure

The landing page will contain:

```txt
Intro
Recent
Selected Projects
Selected Feed Items
Footer / contact links
```

Reason:

- This gives visitors the most useful orientation first.
- It keeps the homepage curated without turning it into a resume, timeline, or marketing hero.
- It supports both finished work and writing/reference content.

## Recent Section

The `Recent` section on the homepage is automatic.

It will show feed items and projects whose `activityAt` date is within the last 30 days.

Rules:

```txt
Include feed items with activityAt in the last 30 days.
Include projects with activityAt in the last 30 days.
Sort newest first.
Limit to roughly 6 items.
Do not visually emphasize exact dates.
```

Both `feedItems` and `projects` will include:

```ts
activityAt?: Date
```

Reason:

- This keeps `Recent` automatic without creating a timeline view.
- `activityAt` prevents small edits, typo fixes, or metadata changes from accidentally resurfacing old content.
- The section represents "recently done or worth surfacing", not every update.

## Feed Route

The `/feed` route is a curated mixed stream.

It will include:

```txt
Original essays
Short notes
External articles
Tweets / threads
YouTube videos / talks
Papers
Books
```

The feed will not use top-level category routes or tab buttons like `All`, `Essays`, `Links`, `Videos`, and `Tweets`.

Instead, it will use filter controls:

```txt
Desktop: right-side filter panel
Mobile: collapsed filter drawer or compact controls
```

Filters should be URL-backed with search params.

Example:

```txt
/feed?type=video
/feed?topic=ai
/feed?person=tania-rascia
/feed?type=link&type=paper&topic=systems
```

Reason:

- The feed should feel mixed and curated, not split into silos.
- URL-backed state makes filtered views shareable and keeps browser navigation correct.
- Client-side filtering is enough because the expected size is hundreds of items, not tens of thousands.

## Feed State Management

Feed filtering, search, and sort state will be client-side.

State ownership:

```txt
URL search params
- filter type
- topic
- person
- source
- search query
- sort

React local state
- mobile filter drawer open/closed
- expanded embeds

localStorage
- theme preference only
```

No global state library is planned.

Reason:

- The state is page-local and simple.
- Hundreds of feed items can be filtered in memory without server complexity.
- Redux, Zustand, Jotai, or similar libraries would be unnecessary for this app.

## Feed Detail Pages

Feed items support optional detail pages.

The model will use an explicit boolean:

```ts
hasPage: boolean
```

Behavior:

```txt
hasPage: true
Generates /feed/[slug]

hasPage: false
Appears only as an item in the feed list
```

Reason:

- Some tweets, videos, or links only need a compact card.
- Some external items deserve deeper commentary.
- An explicit boolean is clearer than inferring page creation from body length.

## Feed Item Types

Initial feed item types:

```txt
essay
note
link
tweet
video
paper
book
```

Definitions:

```txt
essay
Original long-form writing.

note
Original short-form writing.

link
External article, blog post, website, or tool.

tweet
Tweet or thread worth preserving with commentary.

video
YouTube video, talk, course, or lecture.

paper
Research or technical paper.

book
Book or long reading recommendation.
```

Reason:

- These types cover the known content without over-modeling.
- Other categories like podcast, quote, image, repo, and course can be added later if needed.

## Feed Item Data Model

Base shape:

```ts
title: string
type: "essay" | "note" | "link" | "tweet" | "video" | "paper" | "book"
summary: string
commentary: string
publishedAt: Date
updatedAt?: Date
activityAt?: Date
topics: string[]
people?: string[]
source?: Source
hasPage: boolean
draft: boolean
featured: boolean
```

Reason:

- `summary` explains what the item is.
- `commentary` captures the owner's interpretation or reason for saving/publishing the item.
- `topics` and `people` support filtering and cross-reference.
- `draft` keeps unfinished work out of production.
- `featured` allows manual promotion when needed.
- `activityAt` powers homepage Recent without relying on incidental edits.

## Source Model

External feed items will use a strict discriminated source model.

Shape:

```ts
source?:
  | { kind: "url"; url: string; siteName?: string; author?: string }
  | { kind: "tweet"; url: string; tweetId?: string; authorHandle?: string }
  | { kind: "youtube"; url: string; videoId?: string; channel?: string }
  | { kind: "paper"; url: string; doi?: string; arxivId?: string; authors?: string[] }
  | { kind: "book"; isbn?: string; author?: string; url?: string }
```

Validation rules:

```txt
essay / note
source optional

link
source.kind = "url"

tweet
source.kind = "tweet"

video
source.kind = "youtube"

paper
source.kind = "paper"

book
source.kind = "book"
```

Reason:

- Different external content types need different rendering.
- A strict model prevents inconsistent optional fields.
- It supports lightweight previews without depending on third-party embeds.

## Embeds

The site will use lightweight previews by default.

Behavior:

```txt
Feed list
Use lightweight cards and previews.

Detail pages
Allow richer embeds where useful.

YouTube
Prefer thumbnail or lite embed behavior before loading the full player.

Tweets
Avoid relying on X embed scripts as the default representation.
```

Reason:

- Third-party embeds can be slow, noisy, brittle, and privacy-hostile.
- Tweets can disappear or become inaccessible.
- The owner's commentary should preserve the value even if the original source changes.

## Projects Route

The `/projects` route will be a simple curated grid, not a filter-heavy catalog.

Structure:

```txt
Featured projects
Other projects
```

Project tags may be displayed, but they will not drive filter UI on day one.

Reason:

- There are not enough projects yet to justify search/filter UI.
- A curated portfolio page is stronger than an empty-looking catalog.

## Project Detail Pages

Projects can have optional detail pages at:

```txt
/projects/[slug]
```

Project detail page structure:

```txt
Project title
Short summary
Commentary
Links: Demo / GitHub / Article / Docs
Screenshots or preview
README section, optional
Older notes or changelog, optional
```

Reason:

- Serious projects need more than cards.
- The page should explain why the project exists, what mattered, and what was learned.
- README content can support the page, but should not replace curated commentary.

## Project Data Model

Base shape:

```ts
title: string
summary: string
commentary: string
startedAt?: Date
completedAt?: Date
updatedAt?: Date
activityAt?: Date
topics: string[]
featured: boolean
draft: boolean
status: "done" | "active" | "paused" | "archived"
links: {
  demo?: string
  github?: string
  article?: string
  docs?: string
}
images?: {
  src: string
  alt: string
  kind?: "cover" | "screenshot" | "diagram"
}[]
readme?: {
  source: "local" | "github"
  githubRepo?: string
  localPath?: string
  syncedAt?: Date
}
```

Reason:

- Project pages need richer metadata than feed items.
- `status` is useful for projects, but not needed for feed items.
- Dates may exist for context and sorting, but should not be the main UI.
- README support allows GitHub content to be included without making GitHub the runtime dependency.

## README Sync

The site will use a hybrid README plan.

Preferred workflow:

```txt
Store README content locally as an editable snapshot.
Optionally sync from GitHub when there is meaningful new project work.
Render the local snapshot statically with Astro.
```

Avoid:

```txt
Client-side GitHub README fetch on every page load.
```

Reason:

- Local snapshots are fast, reliable, reviewable, and editable.
- Build-time or script-based sync keeps GitHub as a source without making every visitor depend on GitHub availability.
- This matches the owner's preference to publish only reviewed content.

## People Collection

The site will have a `people` collection.

It will not have public people routes initially.

Usage:

```txt
Feed item references
Filters
Tags
Credits
Repeated references to people the owner follows
```

Initial model:

```ts
name: string
handle?: string
summary: string
whyIFollow: string
url?: string
avatar?: string
topics: string[]
links?: {
  website?: string
  github?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  newsletter?: string
}
featured: boolean
```

Reason:

- The site should represent not only what the owner writes, but also what and whom the owner follows.
- A structured people model avoids repeated ad hoc text.
- Public `/people` routes can be added later if the collection becomes valuable enough.

## About Page

The `/about` page will include:

```txt
Intro
Work / interests
Principles
Contact
Broad location
```

It will not include a career timeline by default.

Reason:

- The page should be short, useful, and personal.
- A resume timeline conflicts with the broader design direction.
- Contact and broad location belong here, not in `Recent`.

Email and location guidance:

```txt
Use email carefully because publishing it directly can increase spam.
Prefer broad location only, not precise address details.
```

## Drafts

All main content models use:

```ts
draft: boolean
```

Behavior:

```txt
Production build
Exclude drafts everywhere.

Local dev
Show drafts with a visible Draft label.

RSS / sitemap
Exclude drafts.
```

Reason:

- The only public distinction needed is published vs unpublished.
- More workflow states would create unnecessary maintenance overhead.

## RSS

The site will include an RSS feed at:

```txt
/feed.xml
```

It will include:

```txt
Published feedItems where hasPage is true.
```

It will exclude:

```txt
Drafts
Feed cards where hasPage is false
Projects initially
People
External items without substantial commentary pages
```

Reason:

- RSS subscribers expect meaningful readable entries.
- Including every saved tweet, bookmark, or lightweight card would make the feed noisy.
- Projects can get a separate feed later if needed.

## Stack

The agreed base stack is:

```txt
Astro
TypeScript
MDX
Astro content collections / content layer
React islands where interactivity is needed
```

Reason:

- This is primarily a static content site.
- Astro is a strong fit for writing, projects, MDX, content collections, and fast static output.
- React should be used only where it adds value: filters, interactive previews, theme toggle, and other small islands.
- A heavier app stack like Next.js is not needed unless server features, auth, admin UI, or dynamic APIs become necessary.

## View Transitions

Route-level view transitions are desired, but should be tasteful.

Potential uses:

```txt
Project card to project detail page
Feed item to feed detail page
Small navigation transitions
```

Reason:

- View transitions can improve navigation between routes.
- They should support content continuity rather than becoming portfolio theatrics.
- Browser / framework support details should be handled during stack implementation.

## Styling Direction

The site should be minimal, writing-first, and restrained.

Style direction:

```txt
Readable text-led pages
Simple navigation
Strong typography
Selective cards
Compact feed entries
Subtle motion
Mostly static layouts
```

Avoid:

```txt
Big gradient hero
Timeline UI
Resume chronology as the main structure
Heavy glassmorphism
Excessive animated portfolio effects
Generic dark-blue or purple developer-site palette
Cards everywhere
```

Reason:

- The visual reference direction is closer to a clean personal writing site.
- The site should feel curated and thoughtful, not over-designed.
- Minimal design still needs distinctive typography, spacing, and theme choices so it does not feel unfinished.

