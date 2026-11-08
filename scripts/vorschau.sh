#!/usr/bin/env bash
# Baut eine Vorschau wie auf GitHub, je eine feste helle und dunkle Seite,
# unabhängig vom Farbschema des Betrachters.
# Aufruf: vorschau.sh <zielordner> <ordner mit github-markdown-light.css und -dark.css>
set -euo pipefail
hier="$(cd "$(dirname "$0")/.." && pwd)"; ziel="$1"; cssdir="$2"
mkdir -p "$ziel"
body="$(npx -y marked@15 --gfm -i "$hier/README.md")"
for modus in hell dunkel; do
  if [ $modus = hell ]; then schema=light; bg='#ffffff'; media='not all'; banner=banner-light.svg
  else schema=dark; bg='#0d1117'; media='all'; banner=banner-dark.svg; fi
  # Grafiken je Modus festlegen: die Dunkel-Regel in den SVGs gilt immer oder nie
  rm -rf "$ziel/assets-$modus"; cp -r "$hier/assets" "$ziel/assets-$modus"
  sed -i "s/@media (prefers-color-scheme: dark)/@media $media/" "$ziel/assets-$modus"/*.svg
  cp "$cssdir/github-markdown-$schema.css" "$ziel/github-markdown-$schema.css"
  # <picture> wählt nach dem System, deshalb in der Vorschau fest das passende Banner
  seite="$(printf '%s' "$body" \
    | sed -e '/<source media="(prefers-color-scheme/d' \
          -e "s#assets/banner-dark.svg#assets/$banner#" \
          -e "s#\"assets/#\"assets-$modus/#g" \
          -e 's/<details>/<details open>/')"
  cat > "$ziel/$modus.html" <<HTML
<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="$schema"><title>Profil ($modus)</title>
<link rel="stylesheet" href="github-markdown-$schema.css">
<style>:root{color-scheme:$schema} body{margin:0;background:$bg}
.markdown-body{box-sizing:border-box;max-width:1012px;margin:0 auto;padding:32px}
@media (max-width:767px){.markdown-body{padding:15px}}</style></head>
<body><article class="markdown-body">$seite</article></body></html>
HTML
done
rm -rf "$ziel/assets" "$ziel/github-markdown.css"
