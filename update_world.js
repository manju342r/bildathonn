const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

// Replace flat colors with realistic Textures
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0x888888, roughness: 0\.9}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Stone, roughness: 0.9, color: 0xaaaaaa})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0x4a2f1d}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x664422, roughness: 0.9})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: color}\)/g, 'new THREE.MeshStandardMaterial({color: color, map: Textures.Cloth, roughness: 0.9})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0xfff0cc, roughness: 0\.4}\)/g, 'new THREE.MeshStandardMaterial({color: 0xfff0cc, roughness: 0.4})'); // Modak stays smooth
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0x8b4513}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x8b4513, roughness: 0.9})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0x5c3a21}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x5c3a21, roughness: 0.9})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0xffaa00, metalness: 0\.8, roughness: 0\.2}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Gold, metalness: 0.9, roughness: 0.1, color: 0xffdd00})');
code = code.replace(/new THREE\.MeshStandardMaterial\({color: 0x555555}\)/g, 'new THREE.MeshStandardMaterial({map: Textures.Stone, color: 0x555555, roughness: 1.0})');

// Also update walls to use Stone texture
code = code.replace(/const mat = new THREE\.MeshStandardMaterial\({ color: color, roughness: 0\.8 }\);/g, 'const mat = new THREE.MeshStandardMaterial({ color: color, map: Textures.Stone, roughness: 0.9 });');

// And ground to use Grass texture
// We have `createGrassTexture()` in world.js.

fs.writeFileSync('src/world.js', code);
