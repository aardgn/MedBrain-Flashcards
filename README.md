# Medonie

> **Project status: Active development**
>
> Medonie is an unfinished project that I am actively building and refining. The core study workflow works, but the application is not production-ready and several features, migrations, and operational safeguards are still in progress.

## Overview

Medonie is a spaced-repetition flashcard application for medical students. A user can upload PDF or image-based lecture notes, generate flashcards with Google Gemini, organize them into decks, and review due cards through a custom scheduling algorithm. The goal is to reduce the manual work of creating study material while keeping review timing deterministic and testable.

## Tech Stack

- **Next.js and TypeScript** for the current web application, using the App Router, server-side data loading, API routes, and focused client components for interactive review sessions.
- **Supabase** for PostgreSQL storage, Google OAuth authentication, and Row Level Security policies that isolate each user's cards and review data.
- **Google Gemini API** for multimodal flashcard generation from PDF, PNG, and JPEG uploads. The API key remains server-side in the Next.js generation route.
- **Tailwind CSS** for the responsive desktop and mobile interfaces.
- **Python and Streamlit** in the earlier prototype. The project is being migrated incrementally from that prototype to Next.js; the Python SRS implementation remains a behavioral reference for the TypeScript port.

## Feature Status

### Working now

- Google OAuth authentication through Supabase Auth
- Per-user data isolation through Supabase Row Level Security
- A custom spaced-repetition algorithm with deterministic TypeScript tests
- PDF and image upload with server-side Gemini flashcard generation
- Deck browsing and a due-card review session with animated card flipping
- Review logging and a statistics dashboard based on real review data

### Planned / not yet built

- **Streak system:** date and timezone behavior still needs to be treated as a complete product feature and validated across more user scenarios.
- **AI tutor:** the navigation and UI direction exist, but source-grounded question answering has not been implemented.

## Project Structure

```text
frontend/                 Current Next.js and TypeScript application
  app/                    Routes, server components, API routes, and UI components
  lib/                    Supabase data access, validation, prompts, SRS, and domain logic
  tests/                  Node-based tests for SRS and generated-card validation
services/                 Legacy Python SRS implementation used as a behavior reference
tests/                    Tests for the earlier Python SRS implementation
supabase/migrations/      Incremental PostgreSQL schema and compatibility migrations
requirements.txt          Dependencies retained from the Streamlit/Python prototype
```

The current application keeps server-side data loading separate from desktop and mobile presentation components. Both layouts consume the same fetched data instead of issuing duplicate queries.

## Challenges & Debugging

### Aligning AI output with the database contract

The first end-to-end generation flow appeared to work until validation rejected Gemini's response with a "card is missing a question or answer" error. The model was returning structurally valid JSON, so the failure was not a JSON parsing problem. The mismatch was in the field names: the generated objects used English keys such as `question` and `answer`, while the existing PostgreSQL schema and TypeScript validator expected the Turkish column names `soru` and `cevap`.

I diagnosed this by comparing three boundaries side by side: the actual model output, the validation code that narrows unknown JSON, and the payload passed to Supabase. That made it clear that each layer was individually reasonable but they did not share one contract. I changed the Gemini prompt to emit `[{ "soru": "...", "cevap": "..." }]` and kept strict validation before insertion. I chose to align the prompt with the established database columns rather than rename the database fields because the same schema was still shared with the legacy prototype and changing it would have expanded a generation bug into a broader migration. Parser tests now cover valid arrays, fenced JSON, empty values, missing fields, rejection responses, and malformed output.

### Preventing the next card's answer from flashing during a flip transition

In the review screen, rating a flipped card advanced the session immediately. For a fraction of the transition, the next card's answer could appear before the card returned to its front face. The content had changed, but React was reusing the same card component instance, so its `isFlipped` transform state carried over to the next card.

I treated this as a component lifecycle problem rather than trying to hide it with a shorter animation. The review card now receives `key={currentCard.id}`, forcing a clean component remount whenever the active card changes. The transition handler also resets the flip state and waits for the return animation before swapping the card data. The key guarantees fresh local state; the ordered reset prevents old visual state from being rendered over new content. This combination was more reliable than adding arbitrary delays around the data update alone.

### Making generated cards compatible with the due-card query

After adding an AI-generated deck, the cards were visible in the database and deck list, but the review screen reported that no cards were due. I traced both sides of the boundary instead of changing the SRS algorithm: the generation route's insert payload and the review loader's `sonraki_tekrar <= now` filter. The new insert path was not consistently writing the scheduling fields in the numeric format expected by the TypeScript SRS and due-card query.

The current contract uses absolute Unix time in seconds. New cards are inserted with `sonraki_tekrar = 0`, `aralik = 0`, and `durum = 'yeni'`, which makes them immediately eligible because zero is earlier than the current Unix timestamp. After a review, the SRS function writes the next absolute Unix timestamp using the same unit. I fixed the creation path instead of loosening the due query or changing the scheduling algorithm because the TypeScript SRS was already a tested port of the Python behavior; preserving one time representation keeps new and reviewed cards comparable.

### Handling a legacy `username` constraint during the auth migration

The generation API successfully received and validated cards but Supabase rejected the insert with PostgreSQL error `23502`. Logging the PostgREST error's message, code, and details showed that the failure was not related to Gemini or RLS: the legacy `cards.username` column was still `NOT NULL`. The earlier Streamlit application identified ownership with a username, while the Next.js application uses the authenticated Supabase `user_id` and relies on RLS for isolation.

I considered generating a username in the API route, removing the column immediately, or relaxing the constraint. Supplying a synthetic value would have preserved a misleading ownership mechanism, while deleting the column would have forced a larger migration before the new workflow could be tested. I added a narrow migration that drops only the `NOT NULL` requirement and leaves the column in place for temporary legacy compatibility. Full username cleanup is intentionally deferred to a dedicated migration after the remaining Streamlit dependencies are removed.

## Current Engineering Focus

The next phase is less about adding UI surface area and more about tightening system boundaries: completing the Streamlit-to-Next.js migration, validating calendar-day behavior for streaks, improving failure handling around AI generation, and documenting the database schema and deployment model. I am keeping incomplete features visible in the roadmap rather than presenting the repository as production-ready.

