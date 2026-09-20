const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// Change targetSize from 36 to 120 for Ganesha to make him massive
code = code.replace(/const targetSize = name === 'ganesha' \? \d+ : 5;/g, "const targetSize = name === 'ganesha' ? 120 : 5;");

fs.writeFileSync('src/main.js', code);
