const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== '.git') {
      searchInDir(full, pattern);
    } else if (f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.json') || f.name.endsWith('.jsx') || f.name.endsWith('.txt') || f.name.endsWith('.md'))) {
      const content = fs.readFileSync(full, 'utf8');
      if (pattern.test(content)) {
        console.log(`Match in: ${full}`);
      }
    }
  }
}

console.log('Searching for 429, 300, 303 in project:');
searchInDir('d:\\Desarollo\\inventario_SITE', /\b(429|303|25710)\b/);
