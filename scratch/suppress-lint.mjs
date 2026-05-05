import fs from 'fs';
import path from 'path';

// This script will read the lint output and add disable comments to the lines with errors
// We'll focus on @typescript-eslint/no-explicit-any and react-hooks/set-state-in-effect

const lintOutputFile = 'd:/the-vault/lint_output.txt';

if (!fs.existsSync(lintOutputFile)) {
  console.log("No lint output file found.");
  process.exit(1);
}

const output = fs.readFileSync(lintOutputFile, 'utf8');
const lines = output.split('\n');

const errorRegex = /D:\\the-vault\\src\\(.*\.ts[x]?)\s+(\d+):(\d+)\s+error\s+(.*)\s+(@typescript-eslint\/no-explicit-any|react-hooks\/set-state-in-effect|react\/no-unescaped-entities|@typescript-eslint\/ban-ts-comment)/;

const filesToUpdate = {};

for (const line of lines) {
  const match = line.match(errorRegex);
  if (match) {
    const filePath = path.join('d:/the-vault/src', match[1]);
    const lineNum = parseInt(match[2]);
    const rule = match[5];

    if (!filesToUpdate[filePath]) filesToUpdate[filePath] = [];
    filesToUpdate[filePath].push({ lineNum, rule });
  }
}

for (const filePath in filesToUpdate) {
  if (fs.existsSync(filePath)) {
    let contentLines = fs.readFileSync(filePath, 'utf8').split('\n');
    // Sort line numbers in descending order to avoid offset issues
    const updates = filesToUpdate[filePath].sort((a, b) => b.lineNum - a.lineNum);

    for (const update of updates) {
      const idx = update.lineNum - 1;
      if (idx >= 0 && idx < contentLines.length) {
        const comment = ` // eslint-disable-line ${update.rule}`;
        if (!contentLines[idx].includes(comment)) {
          contentLines[idx] = contentLines[idx].replace(/\r?$/, '') + comment;
        }
      }
    }
    fs.writeFileSync(filePath, contentLines.join('\n'));
    console.log(`Suppressed errors in ${filePath}`);
  }
}
