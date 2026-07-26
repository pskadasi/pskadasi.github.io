# Memory images

Put gallery images in this folder, then add each one to
`../_data/memories.yml`:

```yaml
- src: /images/conference.jpg
  alt: Pritam at a research conference
  caption: Conference, 2026
```

Use descriptive `alt` text. Keep image filenames lowercase and avoid spaces.

The site favicon files also live here:

- `favicon.svg` is the primary transparent browser icon. It renders the mark
  black in light browser themes and white in dark browser themes.
- `favicon-fallback.svg` is the outlined source for legacy raster exports.
- `favicon.png` is the transparent 512×512 fallback icon.
- `favicon-32.png` is the transparent small browser-tab fallback.
- `apple-touch-icon.png` is the iOS home-screen icon.

The root-level `favicon.ico` is a transparent legacy fallback with white nodes
and edges plus a thin dark outline, so it remains visible on light and dark
browser chrome. Run `scripts/render-favicon.swift`, then convert
`images/favicon-32.png` to `favicon.ico`, when changing the fallback artwork.
