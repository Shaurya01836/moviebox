# MovieBox — Code Quality & Engineering Standards

This document defines the coding standards, architectural rules, and engineering practices for the MovieBox project.

**Every developer and AI coding agent MUST follow these rules when creating, modifying, or reviewing code.**

The goal is to keep MovieBox:

* Clean
* Maintainable
* Scalable
* Type-safe
* Accessible
* Performant
* Secure
* Easy to understand
* Easy to extend

---

# 1. Core Principles

Always prioritize:

1. Correctness
2. Simplicity
3. Maintainability
4. Readability
5. Type safety
6. Performance
7. Security
8. Accessibility
9. Scalability

Do not introduce complexity without a real requirement.

> **Simple code that works is better than clever code that is difficult to maintain.**

Avoid premature optimization and premature abstraction.

---

# 2. Before Writing Code

Before modifying the project:

1. Inspect the existing project structure.
2. Read relevant existing files.
3. Understand the existing architecture.
4. Search for existing components/utilities/services that can be reused.
5. Check whether the functionality already exists.
6. Follow existing project conventions.
7. Avoid creating duplicate implementations.

Never assume a component, utility, hook, or service does not exist without checking.

---

# 3. Architecture

MovieBox uses a feature-oriented architecture.

Prefer:

```text
src/
├── app/
├── components/
├── features/
├── lib/
├── services/
├── hooks/
├── types/
└── constants/
```

Keep responsibilities separated.

### `app/`

Responsible primarily for:

* Routing
* Layouts
* Route-level loading states
* Route-level error states
* Metadata
* API route handlers

Route files should remain thin.

Do not place large business logic inside:

```text
page.tsx
layout.tsx
route.ts
```

Delegate complex logic to appropriate modules.

---

# 4. Feature-Based Organization

Feature-specific code should live inside its feature.

Example:

```text
features/
└── movies/
    ├── components/
    ├── services/
    ├── hooks/
    ├── utils/
    ├── types.ts
    └── index.ts
```

Do not unnecessarily move feature-specific code into global folders.

Use global folders only for genuinely shared functionality.

### Good

```text
features/movies/components/MovieCard.tsx
```

### Avoid

```text
components/MovieCard.tsx
```

if `MovieCard` is only used by the movies feature.

Move it to `components/shared/` only when it is genuinely shared across multiple features.

---

# 5. Single Responsibility

Each module should have one clear responsibility.

Avoid components that:

* Fetch data
* Transform data
* Handle authentication
* Perform business logic
* Manage multiple unrelated states
* Render hundreds of lines of UI

all at the same time.

Instead, separate responsibilities.

For example:

```text
MoviePage
    ↓
MovieList
    ↓
MovieCard
```

Business logic should not be mixed unnecessarily with presentation logic.

---

# 6. React & Next.js

Use Next.js App Router conventions.

### Server Components

Use Server Components by default.

Do NOT add:

```tsx
"use client";
```

unless the component actually requires client-side functionality.

Client Components are appropriate when using:

* `useState`
* `useEffect`
* Browser APIs
* Event handlers
* Client-side interaction
* Client-only libraries

Avoid turning entire pages into Client Components when only a small interactive component requires client functionality.

### Server-side code

Keep server-only logic on the server.

Never expose:

* API secrets
* Database credentials
* Private tokens
* Server-only environment variables

to Client Components.

---

# 7. TypeScript

TypeScript must be used properly.

Avoid:

```ts
any
```

unless there is a documented technical reason.

Prefer precise types.

### Bad

```ts
function getMovie(movie: any) {
  return movie.title;
}
```

### Better

```ts
interface Movie {
  id: string;
  title: string;
}

function getMovie(movie: Movie) {
  return movie.title;
}
```

Do not use excessive type assertions:

```ts
const movie = data as Movie;
```

unless the assertion is actually justified.

Prefer runtime validation when handling untrusted external data.

---

# 8. Naming

Use clear and descriptive names.

### Components

Use PascalCase:

```text
MovieCard
SearchBar
Navbar
UserProfile
```

### Functions and variables

Use camelCase:

```text
getMovie
searchMovies
movieList
isLoading
```

### Constants

Use descriptive names.

```ts
const MAX_SEARCH_RESULTS = 20;
```

Avoid meaningless names:

```ts
const x = ...
const data2 = ...
const temp = ...
```

Names should communicate intent.

---

# 9. Components

Components should be:

* Small
* Focused
* Reusable where appropriate
* Accessible
* Easy to understand

Avoid giant components.

If a component becomes difficult to understand, consider extracting logical pieces.

However, do not split every five lines into a separate component.

Extract components when there is a meaningful boundary.

---

# 10. Props

Keep component APIs simple.

Avoid passing large unrelated objects when only a few properties are needed.

### Prefer

```tsx
<MovieCard
  title={movie.title}
  poster={movie.poster}
  rating={movie.rating}
/>
```

over unnecessarily coupling components to large data structures.

Use composition when it produces a cleaner API.

---

# 11. State Management

Do not introduce a global state library by default.

Start with:

* React state
* URL state
* Server state
* Server Components
* Server Actions where appropriate

Only introduce a state-management library when there is a demonstrated requirement.

Do not use global state for data that can naturally remain local.

---

# 12. Data Fetching

Keep data fetching close to the appropriate server-side boundary.

Do not unnecessarily fetch data on the client when the data can be fetched on the server.

Avoid duplicate requests.

Do not put data-fetching logic directly into reusable presentational components unless that component is explicitly designed to own the data fetching.

Prefer:

```text
Page
 ↓
Server-side data fetching
 ↓
Feature component
 ↓
Presentational components
```

---

# 13. Business Logic

Business logic must not be tightly coupled to UI.

Avoid:

```tsx
function MovieCard() {
  // complex business rules
  // database logic
  // authentication logic
  // API calls
  // large calculations
  // UI
}
```

Instead, separate responsibilities:

```text
UI
 ↓
Feature logic
 ↓
Service
 ↓
Infrastructure
```

As backend functionality is introduced, business rules should remain testable and independent from UI rendering.

---

# 14. API Routes

When API routes are introduced:

```text
app/api/**/route.ts
```

Keep route handlers thin.

They should generally:

1. Receive the request.
2. Validate input.
3. Authenticate/authorize when necessary.
4. Call the appropriate service.
5. Return a response.

Do not put large business logic inside route handlers.

---

# 15. Database

When a database is introduced:

* Keep database configuration isolated.
* Do not access the database directly from UI components.
* Do not expose database clients to the browser.
* Keep queries organized.
* Avoid duplicated database logic.
* Validate input before database operations.
* Use proper indexes where appropriate.
* Avoid N+1 query patterns.
* Use transactions when atomic operations are required.

Database implementation details should not leak into presentation components.

---

# 16. External APIs

Treat all external API responses as untrusted input.

Do not blindly assume the response has the expected structure.

Validate or safely transform external data before using it throughout the application.

Keep external API integrations behind a service boundary.

Example:

```text
features/movies/services/
    movie-api.ts
```

rather than calling an external API from dozens of components.

---

# 17. Error Handling

Never silently swallow errors.

Avoid:

```ts
try {
  await something();
} catch {}
```

Errors should either be:

* Handled meaningfully
* Logged appropriately
* Returned to the caller
* Propagated to an error boundary

Do not expose sensitive internal errors to users.

User-facing errors should be understandable.

---

# 18. Loading & Empty States

Every asynchronous user-facing feature should consider:

* Loading state
* Error state
* Empty state
* Success state

For example:

```text
Loading
   ↓
Success → Content
   ↓
Empty → Empty state

Error → Error state
```

Do not leave users staring at a blank screen while data loads.

Use Next.js loading/error conventions where appropriate.

---

# 19. Accessibility

Accessibility is required, not optional.

Use:

* Semantic HTML
* Proper headings
* Labels for inputs
* Keyboard navigation
* Focus states
* Accessible buttons
* Appropriate ARIA attributes when necessary
* Meaningful alt text for images

Do not use:

```html
<div onClick={...}>
```

when a semantic `<button>` is appropriate.

Interactive elements must be usable with a keyboard.

---

# 20. Styling

Use Tailwind CSS consistently.

Do not introduce another styling system without a strong reason.

Avoid excessive arbitrary values.

Prefer existing design tokens/utilities when possible.

Keep responsive behavior intentional.

Design for:

```text
Mobile
Tablet
Desktop
Large screens
```

Do not rely on desktop-only layouts.

---

# 21. UI Consistency

Reusable UI should come from shared components when appropriate.

For example:

```text
components/ui/
├── Button
├── Input
├── Dialog
├── Badge
├── Card
└── Skeleton
```

Do not recreate the same button/modal/input styling in multiple places.

However, do not create a reusable component simply because two pieces of markup happen to look similar.

Reuse when there is a meaningful shared behavior or design contract.

---

# 22. Performance

Performance should be considered during implementation.

Prefer:

* Server Components
* Server-side data fetching
* Appropriate caching
* Optimized images
* Lazy loading where appropriate
* Small client bundles
* Code splitting
* Avoiding unnecessary re-renders

Do not optimize code without evidence that optimization is useful.

Avoid premature performance hacks that make the code harder to understand.

---

# 23. Images

Use Next.js image optimization where appropriate.

Prefer:

```tsx
<Image ... />
```

over raw `<img>` when the image is part of the application's optimized image pipeline.

Always provide meaningful dimensions/aspect ratios where appropriate to prevent layout shifts.

---

# 24. Security

Never commit secrets.

Never put secrets directly into source code.

Use environment variables.

Never expose server-only environment variables to the client.

Treat:

* User input
* Query parameters
* Form data
* Cookies
* Headers
* External API responses

as untrusted.

Validate at system boundaries.

Do not trust client-side authorization checks alone.

Authorization must be enforced on the server.

---

# 25. Environment Variables

Keep environment-specific configuration in environment variables.

Use public variables only when they are intentionally safe for browser exposure.

Do not prefix a secret with:

```text
NEXT_PUBLIC_
```

unless that value is genuinely intended to be public.

Never commit:

```text
.env
.env.local
```

when they contain secrets.

Maintain an appropriate example environment file when necessary:

```text
.env.example
```

without real secrets.

---

# 26. Dependencies

Before installing a package:

1. Check whether the functionality can be implemented cleanly with existing tools.
2. Check whether the dependency is actually necessary.
3. Consider bundle size.
4. Consider maintenance.
5. Consider security.
6. Prefer well-maintained packages.

Do not install packages for trivial functionality.

Avoid dependency sprawl.

---

# 27. Comments

Write comments only when they provide useful context.

Avoid comments that simply restate the code.

### Bad

```ts
// Increment count
count++;
```

### Good

```ts
// Keep the previous page size when restoring search state.
```

Prefer self-explanatory code over excessive comments.

If a section of code requires a long comment to explain what it does, consider simplifying the implementation.

---

# 28. Magic Numbers & Strings

Avoid unexplained values.

### Avoid

```ts
if (results.length > 20) {
```

Prefer:

```ts
const MAX_RESULTS = 20;

if (results.length > MAX_RESULTS) {
```

Shared constants should live in an appropriate constants module.

Do not create constants for values that are only used once and are already obvious.

---

# 29. DRY — Don't Repeat Yourself

Avoid unnecessary duplication.

If the same meaningful logic exists in multiple places, consider extracting it.

However:

> Do not abstract code merely because it looks similar.

Two pieces of code can remain separate if their responsibilities are different and future changes are likely to differ.

Prefer meaningful abstraction over forced abstraction.

---

# 30. Avoid Over-Engineering

Do not create:

* Unnecessary design patterns
* Unused abstractions
* Generic frameworks inside the application
* Excessive wrapper components
* Unused interfaces
* Unused utilities
* Unnecessary service layers
* Complex state management
* Premature microservices

Build what the application currently needs while maintaining clean boundaries for future growth.

---

# 31. File Size

There is no arbitrary maximum file size.

However, if a file becomes difficult to understand, identify logical responsibilities and consider extracting them.

Warning signs include:

* Large components
* Many unrelated functions
* Multiple responsibilities
* Deep conditional logic
* Repeated code
* Difficult-to-follow data flow

Refactor based on responsibility, not line count alone.

---

# 32. Imports

Use the configured alias:

```ts
@/...
```

for appropriate project imports.

Avoid unnecessarily deep relative imports such as:

```ts
../../../../components/...
```

Keep import ordering consistent.

Remove unused imports.

Do not create circular dependencies.

---

# 33. Circular Dependencies

Avoid circular imports.

For example:

```text
A → B → C → A
```

If circular dependencies appear, reconsider the architecture.

Shared types/utilities should live at a lower-level dependency boundary when appropriate.

---

# 34. Testing

When meaningful application logic is introduced, test important behavior.

Prioritize tests for:

* Business logic
* Data transformations
* Validation
* Authentication/authorization
* Critical user flows
* Complex utilities

Do not write meaningless tests simply to increase coverage numbers.

Tests should verify behavior, not implementation details.

---

# 35. Git & Changes

Keep changes focused.

A single change should not unnecessarily modify unrelated files.

Before completing a task:

* Remove debugging code.
* Remove unused imports.
* Remove unused variables.
* Remove temporary files.
* Check formatting.
* Check linting.
* Check TypeScript errors.

Do not modify unrelated code unless required.

---

# 36. AI Coding Agent Rules

AI coding agents MUST follow these additional rules.

### Before editing

Inspect:

* Existing architecture
* Relevant components
* Relevant services
* Existing types
* Existing utilities
* Existing styling patterns

### Before creating a new file

Ask:

> Does this responsibility already have an appropriate home?

If yes, extend the existing implementation.

### Before creating a new component

Search for an existing component that can be reused.

### Before installing a dependency

Determine whether the existing stack can solve the problem without it.

### After implementation

Check:

```text
✓ TypeScript
✓ ESLint
✓ Imports
✓ Accessibility
✓ Responsive behavior
✓ Error handling
✓ Loading states
✓ Unused code
✓ Duplicate code
✓ Security concerns
```

Do not claim a task is complete if there are known TypeScript or linting errors unless they are explicitly documented and unrelated.

---

# 37. Refactoring Rules

When refactoring:

* Preserve existing behavior unless the task requires behavior changes.
* Make one conceptual change at a time.
* Avoid unnecessary rewrites.
* Do not rename unrelated files.
* Do not change APIs without a reason.
* Do not introduce new architecture just for style.

If a larger refactor is genuinely necessary, explain why before making it.

---

# 38. Code Review Checklist

Before considering a task complete, verify:

## Architecture

* [ ] Correct feature/module location
* [ ] Responsibilities are separated
* [ ] No unnecessary abstraction
* [ ] No circular dependencies

## TypeScript

* [ ] No unnecessary `any`
* [ ] Types are meaningful
* [ ] No unsafe type assertions without justification
* [ ] No TypeScript errors

## React / Next.js

* [ ] Server Components used by default
* [ ] `"use client"` only where required
* [ ] No unnecessary client-side data fetching
* [ ] No unnecessary re-renders

## UI

* [ ] Responsive
* [ ] Accessible
* [ ] Semantic HTML
* [ ] Loading state considered
* [ ] Error state considered
* [ ] Empty state considered

## Code Quality

* [ ] No duplicated logic
* [ ] No unused code
* [ ] No debugging statements
* [ ] Clear naming
* [ ] Reasonable component size
* [ ] No unnecessary dependencies

## Security

* [ ] No secrets committed
* [ ] User input validated
* [ ] Server-only code remains server-side
* [ ] Authorization enforced server-side where required

## Final verification

Run the appropriate project checks before finishing:

```bash
npm run lint
```

and:

```bash
npx tsc --noEmit
```

If the project has tests, run the relevant test suite as well.

---

# 39. Golden Rule

When deciding between two implementations:

> Choose the implementation that is easiest for another experienced developer to understand, maintain, test, and extend.

Do not optimize for:

* Fewer lines of code
* More abstractions
* More dependencies
* More patterns
* More folders
* More cleverness

Optimize for:

**Clear code + clear boundaries + correct behavior + maintainability.**

---

# 40. Definition of Done

A feature is considered complete only when:

1. The implementation works.
2. The code is in the correct architectural location.
3. TypeScript passes.
4. ESLint passes.
5. There are no obvious accessibility issues.
6. Responsive behavior has been considered.
7. Loading/error/empty states are handled where applicable.
8. No unnecessary dependencies were introduced.
9. No secrets or sensitive information were exposed.
10. No unnecessary code or files were created.
11. Existing functionality has not been unnecessarily broken.
12. The implementation follows this document.

**These standards apply to all future MovieBox development.**
