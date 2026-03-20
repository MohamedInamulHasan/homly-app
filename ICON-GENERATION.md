# PWA Icon Generation Instructions

Since we don't have image processing tools available, you'll need to generate the PNG icons manually. Here are two options:

## Option 1: Use an Online Tool (Recommended)
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload the `public/icon.svg` file
3. Generate all required sizes
4. Download and extract to `public/` folder

## Option 2: Use ImageMagick (if installed)
If you have ImageMagick installed, run these commands:

```bash
cd public

# Generate all icon sizes from SVG
magick icon.svg -resize 72x72 icon-72x72.png
magick icon.svg -resize 96x96 icon-96x96.png
magick icon.svg -resize 128x128 icon-128x128.png
magick icon.svg -resize 144x144 icon-144x144.png
magick icon.svg -resize 152x152 icon-152x152.png
magick icon.svg -resize 192x192 icon-192x192.png
magick icon.svg -resize 384x384 icon-384x384.png
magick icon.svg -resize 512x512 icon-512x512.png
```

## Option 3: Use Node.js Script (if sharp is available)
Install sharp: `npm install -D sharp`

Then create and run this script:

```javascript
// generate-icons.js
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  const svgBuffer = fs.readFileSync('public/icon.svg');
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}x${size}.png`);
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }
  
  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
```

Run: `node generate-icons.js`

## Temporary Workaround
For now, the PWA will work without the PNG icons. The browser will use the SVG or fallback to default icons. You can add the PNG icons later for better compatibility across all devices.
