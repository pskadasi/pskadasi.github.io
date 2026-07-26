@echo off
cd /d "%~dp0"

bundle check >nul 2>&1
if errorlevel 1 (
  echo Jekyll dependencies are missing. Run: bundle install
  exit /b 1
)

echo Local website: http://localhost:4000
echo Press Ctrl+C to stop the server.
bundle exec jekyll serve --livereload

