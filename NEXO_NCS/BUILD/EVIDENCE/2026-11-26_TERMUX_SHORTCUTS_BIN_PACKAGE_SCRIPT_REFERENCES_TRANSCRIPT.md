$ grep -RInE -m 5 \
  --include='*.sh' --include='*.json' \
  --include='*.mjs' \
  'assistants\.mjs|simulate\.mjs' \
  "$HOME/.shortcuts" "$HOME/bin" \
  "$HOME/ncs-m0/package.json" 2>/dev/null | \
head -30
/data/data/com.termux/files/home/ncs-m0/package.json:6:    "simulate": "node scripts/simulate.mjs",
/data/data/com.termux/files/home/ncs-m0/package.json:7:    "assistants": "node scripts/assistants.mjs",
~ $