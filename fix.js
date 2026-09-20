const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// Remove the top initGame and init3D declarations I incorrectly added
const topInitGameRegex = /\/\/ Initialize the 3D Engine & Assets[\s\S]*?\/\/ Three\.js Core/;
code = code.replace(topInitGameRegex, '// Three.js Core');

code = code.replace('let boulders = [];', 'let boulders = [];\nlet player, ganesha;\nlet scene, camera, renderer, hemiLight, dirLight, vighnaLight, particles;');

// We will wrap everything from "// Three.js Core" to the end of the file into `initGame`
// wait, that's too complex for regex.
