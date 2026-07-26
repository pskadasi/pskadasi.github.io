# Pritam Kadasi — personal website

A Jekyll website for GitHub Pages. Routine content is written in Markdown or
YAML; Jekyll generates the final HTML. The existing CSS, dark mode, tabbed
navigation, interactive research field, MathJax equations, and BibTeX
citations are preserved.

## What to edit

| Content | File or folder |
| --- | --- |
| Name, role, email, Scholar URL | `_data/profile.yml` |
| Site-wide font | `_config.yml` |
| About and homepage sections | `_sections/*.md` |
| Publications | `_data/publications.yml` |
| Blog posts | `_posts/*.md` |
| Blog references | `assets/references.bib` |
| Gallery entries | `_data/memories.yml` |
| Gallery images | `images/` |
| Navigation labels and order | `_data/navigation.yml` |
| Colors and layout | `assets/style.css` |

Files in `_layouts/` and `_includes/` are reusable HTML templates. You should
not normally need to edit them when updating content.

### Change the font

Set `font_stack` in `_config.yml`:

```yaml
font_stack: "Helvetica, 'Helvetica Neue', Arial, sans-serif"
```

Jekyll compiles this setting directly into the main `assets/style.css` used by
every page. Restart the preview server after editing `_config.yml`, because
Jekyll does not reload configuration changes automatically. Do not edit files
inside the generated `_site/` folder.

## Preview locally

Install Ruby and Bundler once, then run this command in the website folder:

```bash
bundle install --path vendor/bundle
```

Start the local site:

```bash
./serve.sh
```

On Windows, run:

```bat
serve.bat
```

Open `http://localhost:4000`. Jekyll rebuilds the generated pages when source
files change. The generated `_site/` folder is ignored by Git and should not be
edited manually.

## Edit homepage content

Each Markdown file in `_sections/` produces one tab on the homepage. For
example, edit `_sections/01-about.md`:

```markdown
---
section_id: about
order: 1
---
# About

Write the About text here using Markdown.
```

Keep `section_id` aligned with the corresponding `id` in
`_data/navigation.yml`. Change `order` to control the generated section order.

## Add a publication

Add an item to `_data/publications.yml`:

```yaml
- title: "Paper title"
  authors: "First Author, Second Author."
  venue: Conference
  year: 2026
  url: "https://example.com/paper"
```

The Publications tab is generated automatically.

## Add memory images

1. Copy the image into `images/`.
2. Add an entry to `_data/memories.yml`:

```yaml
- src: /images/conference.jpg
  alt: Pritam at a research conference
  caption: Conference, 2026
```

Use descriptive alternative text and filenames without spaces.

## Add a blog post

Create `_posts/YYYY-MM-DD-short-title.md`:

```markdown
---
title: Post title
description: Short description for search results
date: 2026-07-24
eyebrow: Technical note
read_time: 6 min read
abstract: A one-sentence summary shown on the homepage and article.
math: true
bibliography: /assets/references.bib
---

## First section

Write the article in Markdown.
```

Posts appear automatically in the Blog tab. Write inline LaTeX as `$ ... $`
and display LaTeX as `$$ ... $$`. You can wrap a display equation in
`<div class="equation">...</div>` to use the existing equation styling.

To cite a BibTeX key from `assets/references.bib`, use:

```html
<cite data-key="vaswani2017attention"></cite>
```

For multiple sources:

```html
<cite data-key="vaswani2017attention,hoffmann2022training"></cite>
```

The post layout generates the References section. Citation numbers and
backlinks are added in the browser.

## Publish with GitHub Pages

The workflow at `.github/workflows/jekyll.yml` builds and deploys the website
whenever `main` is updated.

1. Push this folder to the root of the `pskadasi.github.io` repository.
2. Open **Settings → Pages** on GitHub.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Push or manually run **Deploy Jekyll site to Pages** from the Actions tab.

Do not add a `.nojekyll` file: Jekyll processing is now required.
