# PDF Text Highlighter – Curie Homework

## Summary

This is a Next.js app with `pdfjs-dist` integration that highlights PDF text:

- ✅ Phrase-level highlighting using logic provided by `pdf.js`
- ✅ Word-level highlighting using a patched `pdf.js` worker (based on [this PR](https://github.com/mozilla/pdf.js/pull/18239/files#diff-cf40014d9c7d352f3ae212e7fffe5386decf96a10e53066a4d900c3eb8fc559eL2968))

## Notes

- Any PDF can be loaded into the app.
- Word-level highlighting uses custom char-level coordinates exposed via a patched worker.
- X-axis highlighting is slightly skewed — fixable with more time.
- Y-axis also required manual tuning (magic number). Could use more investigation.
- The example PDF used is attached in the email with this repo.
- It's not deployed anywhere, but I assume that wasn't required.

## Implementation

- Uses **Next.js** with **pdfjs-dist** (no wrappers).
- **Mantine** used just to make it look nice.
- Rendering logic is extracted into a library that follows **single responsibility** and **open/closed** principles.
- PDF state is handled via context and hooks, decoupling it from UI components.
- Context serves as a **dependency injection** mechanism, enabling flexible architecture. Performance should be sufficient, though integrating a memoized selector library like Redux might improve scalability if needed.

## Reflection

- No tests yet — should include unit, integration (React Testing Library), and E2E (e.g. Playwright).
- `Demo` component could be split further.
- UI is minimal — focus was on logic.
- Once word highlighting is fixed, sentence highlighting becomes straightforward.
- If this were a real product, I’d likely use [`react-pdf-highlighter`](https://github.com/agentcooper/react-pdf-highlighter) to reduce complexity — but I assume the goal was to showcase my abilities, so I implemented it manually. At first glance, it seems to serve the intended purpose well.

## How to start the app?

pnpm install
pnpm run dev
