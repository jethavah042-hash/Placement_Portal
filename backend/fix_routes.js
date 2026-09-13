const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'routes');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(
      /const { protect, restrictTo } = require\('\.\.\/middlewares\/auth.middleware'\);/g,
      "const { protect } = require('../middlewares/auth.middleware');\nconst { authorize } = require('../middlewares/role.middleware');"
    );

    // Replace function call
    content = content.replace(/restrictTo\(/g, "authorize(");

    fs.writeFileSync(filePath, content);
  }
});

console.log("Successfully fixed restrictTo -> authorize in all route files");
