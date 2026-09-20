const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

// 1. MeshStandardMaterial -> MeshToonMaterial
content = content.replace(/MeshStandardMaterial/g, 'MeshToonMaterial');

// 2. GLTFLoader fallback
const oldLoader = `const gltfLoader = new THREE.GLTFLoader();

// Helper to load realistic .glb models if they exist in the assets folder
function loadModel(name, path) {
    return new Promise((resolve) => {
        gltfLoader.load(path, (gltf) => {`;
const newLoader = `let gltfLoader = null;
try {
    if (typeof THREE.GLTFLoader !== 'undefined') {
        gltfLoader = new THREE.GLTFLoader();
    }
} catch (e) {
    console.warn("GLTFLoader failed to initialize:", e);
}

// Helper to load realistic .glb models if they exist in the assets folder
function loadModel(name, path) {
    return new Promise((resolve) => {
        if (!gltfLoader) {
            console.warn(\`GLTFLoader not available. Falling back to procedural for \${name}.\`);
            resolve(false);
            return;
        }
        gltfLoader.load(path, (gltf) => {`;
content = content.replace(oldLoader, newLoader);

// 3. Particles Glow
const oldParticles = "const pMat = new THREE.PointsMaterial({color: 0xffaa00, size: 3, transparent: true, opacity: 0.8});";
const newParticles = `
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32; pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,200,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,200,0)');
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0,0,32,32);
    const pTex = new THREE.CanvasTexture(pCanvas);
    
    const pMat = new THREE.PointsMaterial({
        color: 0xffffee, size: 6, map: pTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
`;
content = content.replace(oldParticles, newParticles);

// 4. startQuiz stub
content = `function startQuiz() { console.log("Quiz UI not yet loaded"); }\n` + content;

// 5. Fix Bobbing Aura Path
const oldAura = `                if (obj.mesh.children[2]) {
                    obj.mesh.children[2].scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1); // Aura pulse
                }`;
const newAura = `                if (obj.mesh.children[0] && obj.mesh.children[0].children[2]) {
                    obj.mesh.children[0].children[2].scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1); // Aura pulse
                }`;
content = content.replace(oldAura, newAura);

fs.writeFileSync('src/main.js', content);
