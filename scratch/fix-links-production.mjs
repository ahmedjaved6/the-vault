import fs from 'fs';
import path from 'path';

const rootDir = 'd:/the-vault/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Specific replacements for Task 2/3
      // item-card.tsx
      if (fullPath.endsWith('item-card.tsx')) {
        content = content.replace(/"\/app\/\${item\.id}"/g, '"/app/items/${item.id}"');
        changed = true;
      }
      
      // collectible-form.tsx redirects
      if (fullPath.endsWith('collectible-form.tsx')) {
        content = content.replace(/router\.push\(\`\/app\/\${inserted\.id}\`\)/g, 'router.push(`/app/items/${inserted.id}`)');
        content = content.replace(/router\.push\(\`\/app\/\${initialData\.id}\`\)/g, 'router.push(`/app/items/${initialData.id}`)');
        changed = true;
      }

      // General link updates (from my previous "root-relative" mistake back to prefixes)
      // Only replace if they are in quotes and match exactly to avoid partial replacements
      
      const replacements = [
        ['"/add"', '"/app/add"'],
        ['"/portfolio"', '"/app/portfolio"'],
        ['"/search"', '"/app/search"'],
        ['"/profile"', '"/app/profile"'],
        ['"/settings"', '"/app/settings"'],
        ['"/collectibles"', '"/app/collectibles"'],
        ['"/signin"', '"/auth/signin"'],
        ['"/signup"', '"/auth/signup"'],
        ['"/forgot-password"', '"/auth/forgot-password"'],
        ['"/update-password"', '"/auth/update-password"'],
        ['"/callback"', '"/auth/callback"'],
        ['"/magic-link"', '"/auth/magic-link"'],
      ];

      for (const [from, to] of replacements) {
        if (content.includes(from)) {
          content = content.split(from).join(to);
          changed = true;
        }
      }

      // Special case for "/" in Link href or router.push
      // We want "/" to become "/app" in sidebar and admin links
      if (fullPath.endsWith('app-sidebar.tsx') || fullPath.endsWith('admin-sidebar.tsx') || fullPath.endsWith('not-found.tsx')) {
         if (content.includes('href="/"')) {
           content = content.replace(/href="\/"/g, 'href="/app"');
           changed = true;
         }
         if (content.includes('router.push("/")')) {
           content = content.replace(/router\.push\("\/"\)/g, 'router.push("/app")');
           changed = true;
         }
      }

      // forgot-password/page.tsx line 28 (Task 3d)
      if (fullPath.endsWith('forgot-password/page.tsx')) {
        content = content.replace(/"\/signin"/g, '"/auth/signin"'); // Should be covered by general but making sure
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(rootDir);
