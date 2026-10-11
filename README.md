# ✦ Your Personal Universe

A cinematic personal dashboard with a live clock, daily missions, quick-launch links, and cosmic messages — built with React, TypeScript, and Vite.

![Dark cosmic theme](https://img.shields.io/badge/theme-cosmic%20dark-6d28d9)
![Built with](https://img.shields.io/badge/built%20with-React%20%2B%20TypeScript-61dafb)

## Features

- **Live clock** with seconds, AM/PM, and formatted date
- **Time-based greeting** that changes throughout the day
- **Daily mission** with editable text and completion toggle (saved in localStorage)
- **Quick-launch cards** for GitHub, LeetCode, ChatGPT, and YouTube
- **Universe messages** — 17 original quotes cycled on demand
- **Animated starfield** — Canvas-based, 30fps capped, respects `prefers-reduced-motion`
- **Settings panel** to edit display name and mission
- **Accessible** — semantic HTML, ARIA attributes, keyboard navigation

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
pnpm build
pnpm preview
```

## Tech Stack

| Layer   | Choice                |
|---------|-----------------------|
| UI      | React 19              |
| Language| TypeScript            |
| Bundler | Vite                  |
| Styling | Vanilla CSS           |
| Storage | localStorage          |

## License

MIT
