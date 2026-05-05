import * as PImage from 'pureimage';
import * as fs from 'fs';
import * as path from 'path';

async function generate(size: number, filename: string) {
  const img = PImage.make(size, size);
  const ctx = img.getContext('2d');
  ctx.fillStyle = '#FF6B6B'; // Coral
  ctx.fillRect(0, 0, size, size);
  
  const iconDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
  
  const filePath = path.join(iconDir, filename);
  await PImage.encodePNGToStream(img, fs.createWriteStream(filePath));
  console.log(`✅ Generated ${filename} (${size}x${size})`);
}

async function main() {
  try {
    await generate(192, 'icon-192x192.png');
    await generate(512, 'icon-512x512.png');
    console.log("🚀 All icons generated successfully!");
  } catch (error) {
    console.error("❌ Icon generation failed:", error);
    process.exit(1);
  }
}

main();
