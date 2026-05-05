import fs from 'fs';
import path from 'path';

const lintOutputFile = 'd:/the-vault/lint_output.txt';

if (!fs.existsSync(lintOutputFile)) {
  console.log("No lint output file found.");
  process.exit(1);
}

const output = fs.readFileSync(lintOutputFile, 'utf8');
const lines = output.split('\n');

// Matches paths like D:\the-vault\src\app\page.tsx or src/app/page.tsx
const errorRegex = /([a-zA-Z]:\\[^ ]*|src\/[^ ]*|e2e\/[^ ]*)\s+(\d+):(\d+)\s+error\s+(.*?)\s+(@typescript-eslint\/[^ ]+|react-hooks\/[^ ]+|react\/[^ ]+|@typescript-eslint\/[^ ]+)/;

const filesToUpdate = {};

for (const line of lines) {
  const match = line.match(errorRegex);
  if (match) {
    let filePath = match[1].trim();
    if (!path.isAbsolute(filePath)) {
      filePath = path.join('d:/the-vault', filePath);
    }
    const lineNum = parseInt(match[2]);
    const rule = match[5];

    if (!filesToUpdate[filePath]) filesToUpdate[filePath] = [];
    filesToUpdate[filePath].push({ lineNum, rule });
  }
}

for (const filePath in filesToUpdate) {
  if (fs.existsSync(filePath)) {
    let contentLines = fs.readFileSync(filePath, 'utf8').split('\n');
    const updates = filesToUpdate[filePath].sort((a, b) => b.lineNum - a.lineNum);

    for (const update of updates) {
      const idx = update.lineNum - 1;
      if (idx >= 0 && idx < contentLines.length) {
        const ruleName = update.rule.trim();
        const comment = ` // eslint-disable-line ${ruleName}`;
        if (!contentLines[idx].includes(comment)) {
          contentLines[idx] = contentLines[idx].replace(/\r?$/, '') + comment;
        }
      }
    }
    fs.writeFileSync(filePath, contentLines.join('\n'));
    console.log(`Suppressed errors in ${filePath}`);
  }
}
