const fs = require('fs');

// Read output of grep -r 't("' src/ | grep -o 't("[^"]*")' | sort | uniq
const usedKeys = fs.readFileSync('used_keys.txt', 'utf8').split('\n').map(l => l.match(/t\("([^"]+)"\)/)?.[1]).filter(Boolean);

// Very basic extraction of en.ts content
const enTsContent = fs.readFileSync('src/lib/i18n/locales/en.ts', 'utf8');

// Convert to an object format via eval or just simple string checks
// Simpler: Just check if the full key path exists or if the string after the last dot exists.
// Even simpler: Just check if the string "key:" exists in en.ts where key is the part after the dot.
const missing = [];
for (const key of usedKeys) {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  if (!enTsContent.includes(`${lastPart}:`)) {
    missing.push(key);
  }
}
console.log(missing);
