const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

const loaderReplace = `function createInteractable(scene, id, type, x, z, color, geoType) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    
    let hasRealModel = false;
    
    // Check if we have realistic models loaded
    if (type === 'flag' && modelCache['flag']) {
        const m = modelCache['flag'].clone();
        m.scale.set(10, 10, 10); // scale up usually needed for web downloaded gltf
        group.add(m);
        hasRealModel = true;
    } else if (type === 'offering' && modelCache['modak']) {
        const m = modelCache['modak'].clone();
        m.scale.set(5, 5, 5);
        group.add(m);
        hasRealModel = true;
    }
    
    if (!hasRealModel) {
`;

// wait I need to find how createInteractable starts
code = code.replace(/function createInteractable\(scene, id, type, x, z, color, geoType\) \{\n    const group = new THREE\.Group\(\);\n    group\.position\.set\(x, 0, z\);\n/, loaderReplace);

// and close the if (!hasRealModel) brace before the shadows logic
code = code.replace(/    \/\/ Cast shadows for all parts/, '    }\n    \n    // Cast shadows for all parts');

fs.writeFileSync('src/world.js', code);
