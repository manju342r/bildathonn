const fs = require('fs');
let content = fs.readFileSync('src/world.js', 'utf8');

const oldFlame = "const flame = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), new THREE.MeshToonMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2}));";
const newFlame = `const flame = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), new THREE.MeshToonMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2}));
        flame.name = "diya_flame";
        flame.visible = false;`;

const oldLight = "const diyaLight = new THREE.PointLight(0xffaa00, 1, 30);";
const newLight = `const diyaLight = new THREE.PointLight(0xffaa00, 1, 30);
        diyaLight.name = "diya_light";
        diyaLight.visible = false;`;

content = content.replace(oldFlame, newFlame);
content = content.replace(oldLight, newLight);

fs.writeFileSync('src/world.js', content);
