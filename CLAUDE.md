# CLAUDE.md — Agent Guardrails for MovieMoodMatcher

## Project Overview
MovieMoodMatcher is an asynchronous, client-side movie discovery web application that translates psychological mood states into curated film recommendations using The Movie Database (TMDB) REST API and a Netlify serverless proxy gateway.

---

## 🎭 UI Verification & Automated Testing (Playwright)

Before committing changes affecting layout, interactivity, or API contracts, run automated browser verification using Playwright:

```bash
# Run Playwright tests (Node.js):
npx playwright test

# Or run Python Playwright verification suite:
python3 -m pytest tests/
# Or headless smoke check script:
python3 -c "from playwright.sync_api import sync_playwright; ..."
```

### Critical Test Paths to Verify:
1. **Trending & Now-Playing Feeds:** Cards render with valid poster images, titles, and release dates.
2. **Mood Filtering:** Clicking mood buttons (*Chill*, *Sad*, *Scared*, *Funny*, *Intense*, *Romantic*) compiles compound genre filters and updates the recommendation gallery.
3. **Debounced Search:** Typing in the movie search box triggers queries only after keystroke cooldown, rendering matching results.
4. **Lightbox Modal Details:** Clicking a movie card displays backdrop art, detailed synopsis, and ratings without breaking page scroll.
5. **Watchlist Persistence:** Adding, filtering (*All* / *Watched* / *To Watch*), and removing titles persists in `localStorage` across page reloads.

---

## ⏱️ API Rate-Limit Protection & Debouncing

1. **Mandatory Input Debouncing:**
   - Any keystroke-driven API request (e.g., `#txtSearch` input) **must** implement a debounce timer of at least 300ms–400ms.
   - Clear existing timeout handles before scheduling new requests:
     ```javascript
     clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
       fetchSearchResults(query);
     }, 400);
     ```
2. **In-Flight Request Guards:**
   - Prevent duplicate concurrent requests with boolean state guards (`isSearching = true`) or use `AbortController` to cancel pending obsolete requests when a new search starts.
3. **Client-Side Caching:**
   - Cache repeated trend and mood queries in memory to avoid repetitive upstream API hits.

---

## 🔑 Credential Security — Zero Hardcoded API Keys

1. **Strictly Forbidden:**
   - **Never hardcode, commit, or embed raw TMDB API keys, bearer tokens, or secrets** in `js/app.js`, `index.html`, or any frontend file.
2. **Serverless Proxy Pattern:**
   - All third-party API traffic must route through the secure Netlify serverless function:
     ```
     GET /api/tmdb?endpoint=discover/movie&with_genres=...
     ```
   - The serverless gateway (`netlify/functions/tmdb.js`) injects `process.env.TMDB_API_KEY` securely on the server.
3. **Environment Files:**
   - Store local keys exclusively in `.env` (kept in `.gitignore`).
   - Only document key requirements and variable names in `.env.example`.

---

## 🎨 Clean Vanilla JavaScript & CSS Conventions

1. **No Inline Styles:**
   - **Do not use `element.style.*` or inline `style="..."` attributes** in HTML or JavaScript template strings.
   - Control all visual appearance, dynamic states, and animations via semantic CSS classes in `css/app.css`:
     ```javascript
     // ❌ BAD:
     card.style.display = 'none';
     card.style.borderColor = '#00ADB5';

     // ✅ GOOD:
     card.classList.add('is-hidden');
     card.classList.toggle('active-vibe');
     ```
2. **Vanilla ES6+ Standard:**
   - Use clean modern JavaScript: `const`/`let`, arrow functions, template literals, destructuring, and async/await.
   - Maintain modular OOP structure using domain models (`js/Movie.js`).
   - Clean up event listeners and intervals to prevent memory leaks in single-page navigation.
3. **Responsive & Accessible Design:**
   - Use CSS Grid and Flexbox with mobile-first media queries.
   - Preserve keyboard accessibility (`aria-label`, button focus rings, `.skip-link`).

---

## 📋 Pre-Commit Checklist

Before opening a pull request or pushing to `main`:
1. [ ] Verified UI flows in Chromium with Playwright.
2. [ ] Search input debouncing (300ms+) active on all dynamic query fields.
3. [ ] No hardcoded TMDB keys or personal tokens present in code or commit diffs.
4. [ ] All dynamic styling applied via CSS classes (zero inline styles).
5. [ ] `localStorage` operations safely handle JSON parsing errors.
