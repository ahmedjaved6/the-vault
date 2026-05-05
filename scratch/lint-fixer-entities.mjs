import fs from 'fs';
import path from 'path';

const rootDir = 'd:/the-vault/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix unescaped entities in text nodes
      // This is a naive regex but should handle common cases like Don't, Here's
      // It looks for text between tags
      const unescapedMap = [
        [/'(?=[^<>]*<)/g, '&apos;'],
        [/"(?=[^<>]*<)/g, '&quot;'],
      ];

      // Better: Specific replacements for known errors
      const specificReplacements = [
        ["Don't", "Don&apos;t"],
        ["Here's", "Here&apos;s"],
        ["you're", "you&apos;re"],
        ["You're", "You&apos;re"],
        ["It's", "It&apos;s"],
        ["it's", "it&apos;s"],
        ["Let's", "Let&apos;s"],
        ["let's", "let&apos;s"],
        ["won't", "won&apos;t"],
        ["can't", "can&apos;t"],
      ];

      for (const [from, to] of specificReplacements) {
        if (content.includes(from) && !content.includes(`"${from}"`) && !content.includes(`'${from}'`)) {
           // Only replace if it's likely text content (not in a string literal)
           // This is still risky but better than nothing
           content = content.split(from).join(to);
           changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Lint-fixed ${fullPath}`);
      }
    }
  }
}

walk(rootDir);
