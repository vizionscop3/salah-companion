#!/usr/bin/env node
/**
 * Bundle script for iOS - Creates .jsbundle file for React Native
 * Usage: node scripts/bundle-ios.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'ios', 'SalahCompanion', 'main.jsbundle');
const assetsPath = path.join(projectRoot, 'ios', 'SalahCompanion');

console.log('📦 Starting iOS bundle creation...');
console.log(`📁 Output: ${outputPath}`);

try {
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build the bundle
  const bundleCommand = [
    'npx react-native bundle',
    `--platform ios`,
    `--dev false`,
    `--entry-file index.js`,
    `--bundle-output ${outputPath}`,
    `--assets-dest ${assetsPath}`,
    `--reset-cache`
  ].join(' ');

  console.log(`\n🔨 Running: ${bundleCommand}\n`);
  
  execSync(bundleCommand, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  // Verify bundle was created
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ Bundle created successfully!`);
    console.log(`📊 Size: ${sizeInMB} MB`);
    console.log(`📍 Location: ${outputPath}`);
    
    // Get bundle URL
    const bundleURL = `file://${outputPath}`;
    console.log(`\n🔗 Bundle URL: ${bundleURL}`);
    console.log(`\n💡 You can now use this bundle URL in your iOS app configuration.`);
  } else {
    throw new Error('Bundle file was not created');
  }
} catch (error) {
  console.error('\n❌ Error creating bundle:', error.message);
  process.exit(1);
}

