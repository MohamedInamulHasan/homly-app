import sharp from 'sharp';
import path from 'path';

const input = 'C:/Users/moham/.gemini/antigravity/brain/63da9207-bab6-4111-b6d0-f5e6b1fa3608/ily_mart_green_icon_big_logo_final_1778527864904.png';
const outputDir = 'amazon-assets';

async function resize() {
  try {
    await sharp(input)
      .resize(512, 512)
      .toFile(path.join(outputDir, 'big_logo_512_final.png'));
    
    await sharp(input)
      .resize(114, 114)
      .toFile(path.join(outputDir, 'big_logo_114_final.png'));
    
    console.log('✅ Success: Icons resized to 512x512 and 114x114');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

resize();
