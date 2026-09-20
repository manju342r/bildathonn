const fs = require('fs');
let code = fs.readFileSync('src/characters.js', 'utf8');

const mooshakReplace = `
function createMooshak() {
    if (modelCache['mooshak']) {
        const model = modelCache['mooshak'].clone();
        // Traverse to enable shadows
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    }
    const group = new THREE.Group();
`;

const ganeshaReplace = `
function createGanesha() {
    if (modelCache['ganesha']) {
        const model = modelCache['ganesha'].clone();
        // Traverse to enable shadows
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    }
    const group = new THREE.Group();
`;

code = code.replace(/function createMooshak\(\) {\n    const group = new THREE\.Group\(\);/, mooshakReplace);
code = code.replace(/function createGanesha\(\) {\n    const group = new THREE\.Group\(\);/, ganeshaReplace);

// Let's also make sure their procedural materials look better just in case (e.g. Ganesha = Gold)
code = code.replace(/color: 0xffaa00/g, 'map: Textures.Gold, metalness: 0.6, roughness: 0.3, color: 0xffcc00');

fs.writeFileSync('src/characters.js', code);
