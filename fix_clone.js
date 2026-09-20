const fs = require('fs');
let code = fs.readFileSync('src/characters.js', 'utf8');

// Remove .clone() for unique characters because SkinnedMeshes (rigged characters) break when cloned with standard Object3D.clone()
code = code.replace(/modelCache\['mooshak'\]\.clone\(\)/g, "modelCache['mooshak']");
code = code.replace(/modelCache\['ganesha'\]\.clone\(\)/g, "modelCache['ganesha']");

fs.writeFileSync('src/characters.js', code);
