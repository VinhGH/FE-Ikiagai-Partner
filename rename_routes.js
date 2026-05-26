const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

function safeRename(oldPath, newPath) {
  const oldAbs = path.join(srcDir, oldPath);
  const newAbs = path.join(srcDir, newPath);
  if (fs.existsSync(oldAbs)) {
    console.log(`Renaming: ${oldPath} -> ${newPath}`);
    fs.renameSync(oldAbs, newAbs);
  } else {
    console.log(`File not found: ${oldPath}, skipping.`);
  }
}

try {
  // Move driver orders
  safeRename(path.join('(driver)', 'orders.tsx'), path.join('(driver)', 'driver-orders.tsx'));
  // Move merchant orders
  safeRename(path.join('(merchant)', 'orders.tsx'), path.join('(merchant)', 'merchant-orders.tsx'));
  console.log('File renaming completed successfully!');
} catch (error) {
  console.error('Error renaming files:', error);
}
