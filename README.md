# SoundWave

A responsive music player built with React, Vite, React Router, and Lucide icons. Cover artwork is in `covers/`. Audio files are intentionally kept local and are not included in this public repository; add audio you have permission to distribute to `songs/` to enable playback.

## Run the app

```sh
npm install
npm run dev
```

## Build

```sh
npx vite build
```

Home, Search, Library, Liked Songs, and Recently played are available from the sidebar. Likes and recent listens are saved in browser local storage. The persistent player plays local audio files; there is no streaming service or backend.
