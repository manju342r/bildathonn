const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// Change targetSize from 12 to 36
code = code.replace(/const targetSize = name === 'ganesha' \? 12 : 5;/g, "const targetSize = name === 'ganesha' ? 36 : 5;");

fs.writeFileSync('src/main.js', code);
