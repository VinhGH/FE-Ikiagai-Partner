const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/thaiv/OneDrive/Máy tính/Ikigai-user/FE-Ikiagai-Food-main/assets/images';
const destDir = 'c:/Users/thaiv/OneDrive/Máy tính/Ikigai-Partner/FE-Ikiagai-Partner/src/assets/images';

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(path.join(srcDir, 'icon.png'), path.join(destDir, 'icon.png'));
  fs.copyFileSync(path.join(srcDir, 'favicon.png'), path.join(destDir, 'favicon.png'));
  fs.copyFileSync(path.join(srcDir, 'splash-icon.png'), path.join(destDir, 'splash.png'));
  fs.copyFileSync(path.join(srcDir, 'android-icon-foreground.png'), path.join(destDir, 'adaptive-icon.png'));
  
  console.log('✅ Đã copy toàn bộ assets hình ảnh thành công!');
} catch (error) {
  console.error('❌ Lỗi khi copy assets:', error.message);
}
