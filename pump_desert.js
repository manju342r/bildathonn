const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

code = code.replace("for(let i=0; i<8; i++) {", "for(let i=0; i<15; i++) {");
code = code.replace("let bx = (Math.random() - 0.5) * 500;", "let bx = (Math.random() - 0.5) * 800;");
code = code.replace("let bz = -200 - Math.random() * 500;", "let bz = -150 - Math.random() * 600;");
code = code.replace("if (Math.abs(bx) < 40 && bz > -300) safe = false;", "if (Math.abs(bx) < 60 && bz > -350) safe = false;");

fs.writeFileSync('src/world.js', code);
