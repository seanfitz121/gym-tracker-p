/**
 * Icon Generator Script for PWA
 * 
 * This script uses sharp to generate all required PWA icons from plateproglog.png
 * 
 * Install sharp first: npm install --save-dev sharp
 * Then run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/platep2newlog.png');
const PUBLIC_DIR = path.join(__dirname, '../public');

const iconSizes = [
  // PWA Icons
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  
  // Favicons
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from plateproglog.png...\n');

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Get source image info
  const sourceInfo = await sharp(SOURCE_IMAGE).metadata();
  console.log(`📸 Source image: ${sourceInfo.width}x${sourceInfo.height}\n`);

  // Generate each icon size
  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(PUBLIC_DIR, icon.name);
      
      await sharp(SOURCE_IMAGE)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Generate favicon.ico (Windows ICO format with multiple sizes)
  try {
    console.log('\n🔨 Generating favicon.ico...');
    
    // For .ico, we'll create a 32x32 PNG and save as .ico
    // Note: Sharp doesn't natively support .ico, so we create the largest common size
    await sharp(SOURCE_IMAGE)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(PUBLIC_DIR, 'favicon-temp.png'));
    
    // Rename to .ico (browsers will handle it)
    fs.renameSync(
      path.join(PUBLIC_DIR, 'favicon-temp.png'),
      path.join(PUBLIC_DIR, 'favicon.ico')
    );
    
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }

  console.log('\n✨ Icon generation complete!');
  console.log('\n📱 Your PWA is now using the new logo for:');
  console.log('  - iOS homescreen (apple-touch-icon.png)');
  console.log('  - Android homescreen (android-chrome-*.png)');
  console.log('  - Browser favicons (favicon-*.png, favicon.ico)');
  console.log('\n🚀 Deploy these changes to see the new icons!');
}

generateIcons().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

