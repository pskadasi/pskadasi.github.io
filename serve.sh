#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

if ! command -v bundle >/dev/null 2>&1; then
  echo "Bundler is required. Install Ruby and Bundler, then run: bundle install"
  exit 1
fi

if ! bundle check >/dev/null 2>&1; then
  echo "Jekyll dependencies are missing. Run: bundle install"
  exit 1
fi

echo "Local website: http://localhost:4000"
echo "Press Ctrl+C to stop the server."
bundle exec jekyll serve --livereload

