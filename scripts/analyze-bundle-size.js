/**
 * Bundle Size Analysis Script
 *
 * Analyzes the JavaScript bundle size and provides insights.
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_OUTPUT = path.resolve(__dirname, '../ios/SalahCompanion/main.jsbundle');
const MAX_BUNDLE_SIZE = 50 * 1024 * 1024; // 50MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundleSize() {
  console.log('📦 Bundle Size Analysis');
  console.log('========================\n');

  if (!fs.existsSync(BUNDLE_OUTPUT)) {
    console.log('❌ Bundle file not found. Run "npm run bundle:ios" first.');
    process.exit(1);
  }

  const stats = fs.statSync(BUNDLE_OUTPUT);
  const size = stats.size;
  const formattedSize = formatBytes(size);

  console.log(`Bundle Location: ${BUNDLE_OUTPUT}`);
  console.log(`Bundle Size: ${formattedSize} (${size} bytes)`);
  console.log(`Max Recommended: ${formatBytes(MAX_BUNDLE_SIZE)}\n`);

  // Analysis
  const percentage = (size / MAX_BUNDLE_SIZE) * 100;
  console.log(`Size Usage: ${percentage.toFixed(1)}% of recommended maximum\n`);

  if (size > MAX_BUNDLE_SIZE) {
    console.log('⚠️  WARNING: Bundle size exceeds recommended maximum!');
    console.log('   Consider:');
    console.log('   - Code splitting');
    console.log('   - Lazy loading');
    console.log('   - Removing unused dependencies');
    console.log('   - Tree shaking optimization\n');
  } else if (percentage > 80) {
    console.log('⚠️  CAUTION: Bundle size is approaching maximum');
    console.log('   Consider optimization before adding more features\n');
  } else {
    console.log('✅ Bundle size is within acceptable range\n');
  }

  // Read bundle content for analysis
  try {
    const content = fs.readFileSync(BUNDLE_OUTPUT, 'utf8');
    const lines = content.split('\n').length;
    console.log(`Bundle Statistics:`);
    console.log(`  - Lines of code: ${lines.toLocaleString()}`);
    console.log(`  - Average line length: ${Math.round(content.length / lines)} chars`);
  } catch (error) {
    console.log('Could not analyze bundle content');
  }

  console.log('\n📊 Recommendations:');
  console.log('1. Use React.lazy() for screen components');
  console.log('2. Implement code splitting for large features');
  console.log('3. Remove unused dependencies');
  console.log('4. Optimize images and assets');
  console.log('5. Use tree shaking');
  console.log('6. Consider using Hermes engine optimizations');
}

analyzeBundleSize();

