# Cognitive Systems Lab Website

A Jekyll-based website for the Cognitive Systems Lab.

## Setup

1. Install Ruby, Ruby development headers, and build tools:
   ```bash
   # On Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install ruby-full ruby-dev build-essential zlib1g-dev
   
   # Install Bundler
   gem install bundler
   ```

2. Configure Bundler to install gems locally (recommended):
   ```bash
   bundle config set --local path 'vendor/bundle'
   ```

3. Install Jekyll and dependencies:
   ```bash
   bundle install
   ```

3. Build and serve the site:
   ```bash
   bundle exec jekyll serve
   ```

4. Visit `http://localhost:4000` in your browser.

## Development

- `_config.yml` - Jekyll configuration
- `_layouts/` - HTML layouts
- `_includes/` - Reusable HTML snippets
- `_posts/` - Blog posts (in YYYY-MM-DD-title.md format)
- `assets/css/` - Stylesheets
- `index.md` - Homepage

## Adding a New Post

Create a new file in `_posts/` with the format: `YYYY-MM-DD-title.md`

```markdown
---
layout: default
title: Your Post Title
date: 2026-02-19
---

Your post content here.
```

## Deployment

This site can be deployed to:
- GitHub Pages (automatically builds from `main` branch)
- Netlify
- Vercel
- Any static hosting service

For GitHub Pages, ensure your `_config.yml` has the correct `url` and `baseurl` settings.
