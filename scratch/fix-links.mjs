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

      // Replace /app/ to / (but careful with /app/add etc)
      // Actually /app is better replaced by /
      if (content.includes('"/app"')) {
        content = content.replace(/"\/app"/g, '"/"');
        changed = true;
      }
      if (content.includes('"/app/')) {
        content = content.replace(/"\/app\//g, '"/');
        changed = true;
      }
      if (content.includes('"/auth/signin"')) {
        content = content.replace(/"\/auth\/signin"/g, '"/signin"');
        changed = true;
      }
      if (content.includes('"/auth/signup"')) {
        content = content.replace(/"\/auth\/signup"/g, '"/signup"');
        changed = true;
      }
      if (content.includes('"/auth/forgot-password"')) {
        content = content.replace(/"\/auth\/forgot-password"/g, '"/forgot-password"');
        changed = true;
      }
      if (content.includes('"/auth/update-password"')) {
        content = content.replace(/"\/auth\/update-password"/g, '"/update-password"');
        changed = true;
      }
      if (content.includes('"/auth/callback"')) {
        content = content.replace(/"\/auth\/callback"/g, '"/callback"');
        changed = true;
      }
      if (content.includes('"/auth/magic-link"')) {
        content = content.replace(/"\/auth\/magic-link"/g, '"/magic-link"');
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
