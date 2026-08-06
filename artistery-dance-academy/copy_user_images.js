const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Shubhangi Wagh\\.gemini\\antigravity\\brain\\20796e4b-7d8b-46fc-9bee-dcc0b8194abd\\.user_uploaded';
const dstDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

fs.copyFileSync(path.join(srcDir, 'media__1786038366174.jpg'), path.join(dstDir, 'hero.jpg'));
fs.copyFileSync(path.join(srcDir, 'media__1786038366174.jpg'), path.join(dstDir, 'semiclassical.jpg'));
fs.copyFileSync(path.join(srcDir, 'media__1786038491691.jpg'), path.join(dstDir, 'bollywood.jpg'));
fs.copyFileSync(path.join(srcDir, 'media__1786038561984.jpg'), path.join(dstDir, 'garba.jpg'));
fs.copyFileSync(path.join(srcDir, 'media__1786038698695.jpg'), path.join(dstDir, 'sangeet.jpg'));

console.log('All 4 images copied successfully into public/uploads!');
