
let banasuraMesh = null;
let banasuraTaunting = false;

function createBanasura() {
    if (modelCache['banasura']) {
        banasuraMesh = modelCache['banasura'].clone();
    } else {
        banasuraMesh = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(10, 30, 10), new THREE.MeshBasicMaterial({color: 0x331111}));
        body.position.y = 15;
        const head = new THREE.Mesh(new THREE.SphereGeometry(6), new THREE.MeshBasicMaterial({color: 0xaa2222}));
        head.position.y = 35;
        banasuraMesh.add(body, head);
    }
    banasuraMesh.visible = false;
    scene.add(banasuraMesh);
}

function triggerBanasuraTaunt(blessingCount) {
    if (!banasuraMesh) return;
    
    // Mini-cutscene lock!
    isPlaying = false; 
    isCinematic = true;
    
    banasuraTaunting = true;
    banasuraMesh.visible = true;
    
    let dialogue = "";
    
    if (blessingCount === 1) {
        banasuraMesh.position.set(player.position.x, 30, player.position.z - 60);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        dialogue = "One blessing. You think that will stop me? Keep searching, little one.";
    } else if (blessingCount === 2) {
        banasuraMesh.position.set(player.position.x + 50, 40, player.position.z + 50);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        dialogue = "Two... You are getting closer. But every step brings you closer to destruction.";
    } else if (blessingCount === 3) {
        banasuraMesh.position.set(player.position.x - 50, 20, player.position.z);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        dialogue = "Three blessings... The final path belongs to me. Come to the Mountain!";
    } else if (blessingCount === 4) {
        banasuraMesh.position.set(-1250, 55, 0);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        dialogue = "You have gathered the blessings. Do you truly believe they can restore what I have destroyed?";
    }
    
    // Force camera to look at Banasura
    camera.position.set(player.position.x, player.position.y + 20, player.position.z + 30);
    camera.lookAt(banasuraMesh.position.x, banasuraMesh.position.y, banasuraMesh.position.z);
    
    uiCinematic.classList.add('active');
    cinematicText.innerText = dialogue;
    
    createSmokePuff(banasuraMesh.position);
    
    if (blessingCount < 4) {
        setTimeout(() => {
            if (banasuraMesh) banasuraMesh.visible = false;
            createSmokePuff(banasuraMesh.position);
            banasuraTaunting = false;
            
            // Release cinematic lock
            uiCinematic.classList.remove('active');
            isCinematic = false;
            isPlaying = true;
        }, 10000);
    } else {
        banasuraTaunting = false;
        setTimeout(() => {
            uiCinematic.classList.remove('active');
            isCinematic = false;
            isPlaying = true;
        }, 8000);
    }
}

function createSmokePuff(pos) {
    for(let i=0; i<15; i++) {
        let p = new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*3), new THREE.MeshBasicMaterial({color: 0x111111, transparent: true, opacity: 0.8}));
        p.position.copy(pos);
        p.position.y += Math.random() * 20;
        p.position.x += (Math.random()-0.5)*15;
        p.position.z += (Math.random()-0.5)*15;
        scene.add(p);
        let shrink = setInterval(() => {
            p.position.y += 0.5;
            p.scale.multiplyScalar(0.95);
            p.material.opacity -= 0.05;
            if (p.material.opacity <= 0) {
                scene.remove(p);
                clearInterval(shrink);
            }
        }, 50);
    }
}

function setObjective(text) { 
    const elDesc = document.getElementById('quest-desc'); 
    const elTitle = document.getElementById('quest-title');
    if(elTitle) elTitle.innerText = "CURRENT OBJECTIVE";
    if(elDesc) elDesc.innerText = text; 
}

function startQuiz() { console.log("Quiz UI not yet loaded"); }
// Game State
let gameState = {
    health: 3,
    keys: 0,
    modaks: 0,
    blessings: 0,
    checkpoint: { x: 0, z: 0 }
};

// Open World Quest Tracking
let questData = {
    symbolsHit: 0,
    flagsFound: 0,
    offeringsFound: 0,
    bridgeParts: 0,
    bridgeBuilt: false,
    vighnaOpen: false
};

let currentZone = "HUB";

let isPlaying = false;
let cameraMode = 0; // 0: Classic, 1: Action, 2: Top-Down
let isCinematic = false;
let isPaused = false;
let inRunnerMode = false;
let currentQuestion = 0;
let cinematicIndex = 0;
let boulders = [];
let player, ganesha;



function showToast(text) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'absolute';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0,0,0,0.8)';
        toast.style.color = '#ffcc00';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.fontSize = '24px';
        toast.style.fontWeight = 'bold';
        document.body.appendChild(toast);
    }
    toast.innerText = text;
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    toast.style.display = 'block';
}

// Audio context
let audioCtx;

// 3D Asset Management System
const modelCache = {};
let gltfLoader = null;
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
            console.warn(`GLTFLoader not available. Falling back to procedural for ${name}.`);
            resolve(false);
            return;
        }
        gltfLoader.load(path, (gltf) => {
            const model = gltf.scene;
            
            // 1. Calculate Bounding Box of the raw model
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // 2. Center the model locally
            model.position.x = -center.x;
            model.position.y = -box.min.y; // Align bottom of model to Y=0
            model.position.z = -center.z;
            
            // 3. Wrap it so we can scale the whole thing safely
            const wrapper = new THREE.Group();
            wrapper.add(model);
            
            // 4. Normalize the scale (Ganesha = ~12 units tall)
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetSize = name === 'ganesha' ? 60 : (name === 'banasura' ? 45 : 5); 
            const scale = maxDim > 0 ? targetSize / maxDim : 1;
            wrapper.scale.set(scale, scale, scale);
            
            modelCache[name] = wrapper;
            console.log(`Loaded and auto-scaled realistic model: ${name}`);
            resolve(true);
        }, undefined, (error) => {
            console.warn(`No realistic model found at ${path}. Using procedural fallback for ${name}.`);
            resolve(false);
        });
    });
}

// Helper to generate highly realistic procedural textures (wood, stone, metal noise)
function createProceduralTexture(r, g, b, varR, varG, varB, isWood = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(128, 128);
    for(let i=0; i<imgData.data.length; i+=4) {
        let noise = Math.random();
        if (isWood) noise = Math.sin((i/4 % 128) * 0.1 + Math.random()*2) * 0.5 + 0.5; // simple wood grain
        imgData.data[i] = Math.max(0, Math.min(255, r + noise * varR));
        imgData.data[i+1] = Math.max(0, Math.min(255, g + noise * varG));
        imgData.data[i+2] = Math.max(0, Math.min(255, b + noise * varB));
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// The global procedural textures cache
const Textures = {
    Stone: createProceduralTexture(100, 100, 100, 50, 50, 50),
    Wood: createProceduralTexture(92, 58, 33, 40, 20, 10, true),
    Gold: createProceduralTexture(255, 200, 0, 40, 30, 0),
    Cloth: createProceduralTexture(200, 50, 50, 30, 10, 10)
};

// Three.js Core
const container = document.getElementById('game-container');
const scene = new THREE.Scene();

// Visual Upgrades: Sky and Fog
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.FogExp2(0x87CEEB, 0.0015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
let camOffset = new THREE.Vector3(0, 60, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffaa55, 0.8);
dirLight.position.set(100, 200, 50);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 1000;
dirLight.shadow.camera.bottom = -1000;
dirLight.shadow.camera.left = -1000;
dirLight.shadow.camera.right = 1000;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 3000;
scene.add(dirLight);

const vighnaLight = new THREE.PointLight(0xff0000, 0, 800);
vighnaLight.position.set(-600, 50, 0);
scene.add(vighnaLight);

// Particles (Fireflies)
const pGeo = new THREE.BufferGeometry();
const pCount = 1000;
const pPos = new Float32Array(pCount * 3);
for(let i=0; i<pCount*3; i+=3) {
    pPos[i] = (Math.random() - 0.5) * 2000;
    pPos[i+1] = Math.random() * 50;
    pPos[i+2] = (Math.random() - 0.5) * 2000;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

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

const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);


// Characters







// Input
const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, e: false, ' ': false };
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = true;
    if (k === 'e' && isPlaying && !isPaused) checkInteraction();
    
    // Heal with Modak
    if (k === 'm' && isPlaying && !isPaused) {
        if (gameState.modaks > 0) {
            if (gameState.health < 3) {
                gameState.modaks--;
                gameState.health++;
                updateHUD();
                showToast("Ate a Modak! Restored 1 Health.");
            } else {
                showToast("Health is already full.");
            }
        } else {
            showToast("No Modaks left! Visit the Knowledge Shrine.");
        }
    }
    
    // Live Scale Tuning for Ganesha (Press + or -)
    if (e.key === '=' || e.key === '+') {
        if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
            modelCache['ganesha'].scale.multiplyScalar(1.2);
            localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x); showToast('Ganesha Scale: ' + modelCache['ganesha'].scale.x.toFixed(3)); showToast('Ganesha Scale: ' + modelCache['ganesha'].scale.x.toFixed(3));
        }
    }
    if (e.key === '-' || e.key === '_') {
        if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
            modelCache['ganesha'].scale.multiplyScalar(0.8);
            localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x);
        }
    }
    
    // Live Scale Tuning for Mooshak (Press ] or [)
    if (e.key === ']') {
        player.scale.multiplyScalar(1.2);
        localStorage.setItem('mooshakScale', player.scale.x); showToast('Mooshak Scale: ' + player.scale.x.toFixed(3)); showToast('Mooshak Scale: ' + player.scale.x.toFixed(3));
    }
    if (e.key === '[') {
        player.scale.multiplyScalar(0.8);
        localStorage.setItem('mooshakScale', player.scale.x);
    }
});
window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = false;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Elements
const uiMainMenu = document.getElementById('main-menu');
const uiHow = document.getElementById('how-to-play');
const uiCinematic = document.getElementById('cinematic-screen');
const cinematicText = document.getElementById('cinematic-text');
const uiHud = document.getElementById('hud');
const uiQuiz = document.getElementById('quiz-modal');
const uiGameOver = document.getElementById('game-over');
const uiComplete = document.getElementById('game-complete');
const notifyEl = document.getElementById('notification');

let cinematicTimeout = null;
let dioramaGroup = null;
let meteorMesh = null;
let introCameraShake = 0;

function startCinematic() {
    uiMainMenu.classList.remove('active');
    uiCinematic.classList.add('active');
    cinematicIndex = 0;
    introCameraShake = 0;
    
    // Position Characters for Intro
    player.position.set(0, 0, 10);
    
    // Create Guide Arrow
    arrowContainer = new THREE.Group();
    const arrowMat = new THREE.MeshToonMaterial({color: 0x00ffff, emissive: 0x00aaaa, roughness: 0.2});
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(4, 0), arrowMat);
    diamond.scale.set(1, 1.5, 1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.5, 8, 16), arrowMat);
    ring.rotation.x = Math.PI / 2;
    arrowContainer.add(diamond, ring);
    scene.add(arrowContainer);
    
    if (typeof ganesha !== 'undefined') ganesha.position.set(0, 7, -20);
    
    isCinematic = true;
    isPlaying = false; // Lock controls
    
    // Build Diorama at Z=2000
    if (!dioramaGroup) {
        dioramaGroup = new THREE.Group();
        dioramaGroup.position.set(0, 0, 2000);
        
        // Base platform
        const dFloor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({color: 0x445544}));
        dFloor.rotation.x = -Math.PI/2;
        dioramaGroup.add(dFloor);
        
        // City buildings (better aesthetics)
        const buildingMat = new THREE.MeshToonMaterial({color: 0xe0e0e0});
        for(let i=0; i<25; i++) {
            let h = 15 + Math.random()*40;
            let w = 10 + Math.random()*15;
            let b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), buildingMat);
            b.position.set((Math.random()-0.5)*200, h/2, (Math.random()-0.5)*200);
            
            // Randomly rotate some buildings
            b.rotation.y = (Math.random() > 0.5) ? Math.PI/4 : 0;
            dioramaGroup.add(b);
        }
        
        scene.add(dioramaGroup);
    } else {
        dioramaGroup.visible = true;
        // Reset colors
        dioramaGroup.children.forEach(c => {
            if (c.geometry.type === 'BoxGeometry') c.material.color.setHex(0xe0e0e0);
        });
    }

    if (!meteorMesh) {
        meteorMesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(12, 1),
            new THREE.MeshBasicMaterial({color: 0xffaa00})
        );
        scene.add(meteorMesh);
    }
    meteorMesh.visible = false;
    
    if (banasuraMesh) banasuraMesh.visible = false;
    
    camera.position.set(0, 80, 2200);
    camera.lookAt(0, 0, 2000);
    
    nextCinematicText();
}

function nextCinematicText() {
    if (cinematicIndex === 0) {
        cinematicText.innerText = "The cities had fallen one by one...";
        // Smooth camera pan setup
        camera.position.set(80, 70, 2250);
        camera.lookAt(0, 0, 2000);
        
    } else if (cinematicIndex === 1) {
        cinematicText.innerText = "The destroyer had arrived.";
        
        // Trigger Asteroid Fall
        meteorMesh.position.set(20, 400, 1950);
        meteorMesh.visible = true;
        
        if (banasuraMesh) {
            banasuraMesh.visible = true;
            banasuraMesh.position.set(0, 20, 2080);
            banasuraMesh.lookAt(0, 0, 2000);
        }
        
        camera.position.set(0, 60, 2150);
        camera.lookAt(0, 10, 2000);
        
    } else if (cinematicIndex === 2) {
        cinematicText.innerText = "The final sacred temple still stood.";
        introCameraShake = 0;
        if (banasuraMesh) banasuraMesh.visible = false;
        if (dioramaGroup) dioramaGroup.visible = false;
        if (meteorMesh) meteorMesh.visible = false;
        
        // Jump to Shrine
        camera.position.set(0, 120, 200);
        camera.lookAt(0, 20, 0);
        
    } else if (cinematicIndex === 3) {
        cinematicText.innerText = "Banasura approaches the Sacred Shrine...";
        camera.position.set(80, 60, 80);
        camera.lookAt(0, 20, 0);
        
    } else if (cinematicIndex === 4) {
        cinematicText.innerText = "Mooshak must recover the Four Lost Blessings!";
        camera.position.set(40, 30, 60);
        camera.lookAt(0, 10, -10);
    }

    cinematicIndex++;
    if (cinematicIndex <= 5) {
        cinematicTimeout = setTimeout(nextCinematicText, 5000);
    } else {
        endCinematic();
    }
}

function endCinematic() {
    if (cinematicTimeout) clearTimeout(cinematicTimeout);
    uiCinematic.classList.remove('active');
    uiHud.classList.add('active');
    
    isCinematic = false;
    isPlaying = true;
    // Sky handled dynamically
    
    gameState.stage = 'TALK_TO_GANESHA';
    setObjective("Speak to Ganapati at the Shrine");
    showToast("Press WASD/Arrows to move, E to interact");
}

document.getElementById('btn-play').onclick = startCinematic;
document.getElementById('btn-how').onclick = () => { uiMainMenu.classList.remove('active'); uiHow.classList.add('active'); };
document.getElementById('btn-close-how').onclick = () => { uiHow.classList.remove('active'); uiMainMenu.classList.add('active'); };
document.getElementById('btn-restart').onclick = revivePlayer;
document.getElementById('btn-play-again').onclick = () => location.reload();
document.getElementById('btn-start-quiz').onclick = startQuiz;
document.getElementById('btn-cancel-quiz').onclick = () => { uiQuiz.classList.remove('active'); uiHud.classList.add('active'); isPaused = false; };
document.getElementById('btn-leave-mid-quiz').onclick = () => { uiQuiz.classList.remove('active'); uiHud.classList.add('active'); isPaused = false; };
document.getElementById('btn-skip-cinematic').onclick = endCinematic;
document.getElementById('btn-revive').onclick = () => {
    if (gameState.keys > 0) {
        gameState.keys--;
        gameState.health = 3;
        revivePlayer();
    }
};

function setQuest(title, desc) {
    document.getElementById('quest-title').innerText = title;
    document.getElementById('quest-desc').innerText = desc;
}

function updateHUD() {
    document.getElementById('val-health').innerText = gameState.health;
    document.getElementById('val-keys').innerText = gameState.keys;
    if (document.getElementById('val-modaks')) document.getElementById('val-modaks').innerText = gameState.modaks;
    document.getElementById('val-blessings').innerText = gameState.blessings;
    
    if (gameState.health <= 0) {
        isPlaying = false;
        isPaused = true;
        uiHud.classList.remove('active');
        uiGameOver.classList.add('active');
        document.getElementById('btn-revive').style.display = gameState.keys > 0 ? 'inline-block' : 'none';
    }
}

function revivePlayer() {
    gameState.health = 3;
    player.position.set(gameState.checkpoint.x, 3, gameState.checkpoint.z);

    uiGameOver.classList.remove('active');
    uiHud.classList.add('active');
    isPlaying = true;
    isPaused = false;
    updateHUD();
    boulders.forEach(b => scene.remove(b.mesh));
    boulders = [];
}

function showNotification(msg) {
    notifyEl.innerText = msg;
    notifyEl.style.opacity = 1;
    setTimeout(() => { notifyEl.style.opacity = 0; }, 3000);
}

function startGameplay() {
    isPlaying = true;
    isPaused = false;
    uiHud.classList.add('active');
    updateZoneQuests();
}

// Dynamic Zone Detection
function updateZoneQuests() {
    const px = player.position.x;
    const pz = player.position.z;
    
    let newZone = "HUB";
    if (pz < -100) newZone = "GROVE";
    else if (px > 100) newZone = "CITY";
    else if (pz > 100) newZone = "MOUNTAIN";
    else if (px < -100) newZone = "VIGHNA";
    
    if (newZone !== currentZone) {
        currentZone = newZone;
        gameState.checkpoint = { x: px, z: pz > 300 ? 250 : pz }; // Safe checkpoints
        
        // Darken fog in Vighna
        if (currentZone === "VIGHNA") {
            // Sky handled dynamically
            vighnaLight.intensity = 1.0;
        } else {
            scene.fog.color.setHex(0x87CEEB);
            scene.background.setHex(0x87CEEB);
            vighnaLight.intensity = 0.0;
        }
    }
    
    // UI is now driven entirely by the State Machine via setObjective()
    
    // Unlock Vighna
    if (gameState.blessings >= 3 && !questData.vighnaOpen) {
        questData.vighnaOpen = true;
        gateVighna.isActive = false;
        gateVighna.mesh.visible = false;
        showNotification("The West Gate to Vighna has opened!");
    }
}

function triggerEnding() {
    isPlaying = false;
    uiHud.classList.remove('active');
    uiCinematic.classList.add('active');
    cinematicText.innerText = "The blessings were never meant to make the journey easy. They were meant to guide it.";
    setTimeout(() => {
        uiCinematic.classList.remove('active');
        uiComplete.classList.add('active');
    }, 5000);
}

// ==========================================
// INTERACTIONS
// ==========================================
function checkInteraction() {
    const pX = player.position.x;
    const pZ = player.position.z;
    
    // Check Ganesha interaction
    if (ganesha) {
        let gDist = Math.sqrt(Math.pow(pX - ganesha.position.x, 2) + Math.pow(pZ - ganesha.position.z, 2));
        if (gDist < 30) {
            handleGaneshaInteraction();
            return;
        }
    }
    
    for (let obj of interactables) {
        if (!obj.visible || obj.interacted) continue;
        let dist = Math.sqrt(Math.pow(pX - obj.x, 2) + Math.pow(pZ - obj.z, 2));
        
        // Increase radius for blessings so they are easy to collect
        let interactRadius = (obj.type === 'blessing') ? 60 : 25;
        
        if (dist < interactRadius) { 
            // If it's a blessing, interact immediately and stop
            if (obj.type === 'blessing') {
                handleObjInteraction(obj);
                return;
            }
        }
    }
    
    // If no blessing found, check regular objects
    for (let obj of interactables) {
        if (!obj.visible || obj.type === 'blessing') continue;
        let dist = Math.sqrt(Math.pow(pX - obj.x, 2) + Math.pow(pZ - obj.z, 2));
        if (dist < 25) { 
            handleObjInteraction(obj); 
            break; 
        }
    }
}

function handleGaneshaInteraction() {
    if (gameState.stage === 'TALK_TO_GANESHA') {
        showToast("The central statue stands silent and lifeless.");
        setTimeout(() => showToast("A divine echo fills your mind: 'Mooshak, my faithful vahana...'"), 3000);
        setTimeout(() => showToast("Echo: 'Banasura has banished me. Gather the blessings to summon me back!'"), 6000);
        setTimeout(() => {
            showToast("Echo: 'You are small, but devotion matters. Head NORTH to the Desert Ruins first.'");
            gameState.stage = 'NORTH_DEVOTION';
            setObjective("Find the Forgotten Shrine and 3 Unlit Diyas in the North.");
        }, 9000);
    } else if (gameState.stage === 'RETURN_CENTER' && gameState.sacredDiya) {
        showToast("The four blessings and the Sacred Diya resonate, emitting a blinding light from the shrine!");
        setTimeout(() => {
            showToast("Banasura: 'FOOL! I WILL NOT LET YOU SUMMON HIM!'");
            startFinalVighnaEvent();
        }, 3000);
    } else {
        showToast("The statue remains cold. You must find all blessings to summon Vinayaka.");
    }
}



function handleObjInteraction(obj) {
    if (obj.type === 'shrine') {
        isPaused = true;
        uiHud.classList.remove('active');
        uiQuiz.classList.add('active');
        document.getElementById('quiz-story').innerText = QUIZ_DATA.intro;
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('quiz-start-buttons').style.display = 'block';
        document.getElementById('quiz-question-container').style.display = 'none';
    } 
    else if (obj.type === 'symbol') {
        if (gameState.stage !== 'SOUTH_WISDOM') {
            showToast("The ancient symbols are dormant.");
            return;
        }
        
        // Sequence puzzle
        if (!questData.symbolSequence) questData.symbolSequence = [];
        
        if (obj.id === 'sym1' && questData.symbolSequence.length === 0) {
            questData.symbolSequence.push('sym1');
            obj.visible = false; obj.mesh.visible = false;
            showToast("Symbol 1 of 3 Activated.");
        } else if (obj.id === 'sym2' && questData.symbolSequence.length === 1) {
            questData.symbolSequence.push('sym2');
            obj.visible = false; obj.mesh.visible = false;
            showToast("Symbol 2 of 3 Activated.");
        } else if (obj.id === 'sym3' && questData.symbolSequence.length === 2) {
            questData.symbolSequence.push('sym3');
            obj.visible = false; obj.mesh.visible = false;
            showToast("The Ancient Gate hums with power... The Wisdom Blessing appears!");
            let b1 = interactables.find(i => i.id === 'blessing_wisdom');
            if (b1) { b1.mesh.visible = true; b1.visible = true; }
            setObjective("Collect the Blessing of Wisdom.");
        } else {
            // Wrong sequence
            showToast("Incorrect Sequence! The symbols reset.");
            questData.symbolSequence = [];
            let s1 = interactables.find(i => i.id === 'sym1'); if(s1) { s1.visible = true; s1.mesh.visible = true; }
            let s2 = interactables.find(i => i.id === 'sym2'); if(s2) { s2.visible = true; s2.mesh.visible = true; }
            let s3 = interactables.find(i => i.id === 'sym3'); if(s3) { s3.visible = true; s3.mesh.visible = true; }
        }
    }
    else if (obj.type === 'offering') {
        if (gameState.stage !== 'EAST_PROSPERITY') {
            showToast("A festive offering. (Not needed yet)");
            return;
        }
        obj.visible = false; obj.mesh.visible = false;
        scene.remove(obj.mesh);
        let idx = interactables.indexOf(obj);
        if (idx > -1) interactables.splice(idx, 1);
        questData.offeringsFound = (questData.offeringsFound || 0) + 1;
        showToast("Offering Collected! " + questData.offeringsFound + "/5");
        if (questData.offeringsFound >= 5) {
            showToast("All offerings collected! The Blessing of Prosperity appears at the top!");
            let b2 = interactables.find(i => i.id === 'blessing_prosperity');
            if (b2) { b2.visible = true; b2.mesh.visible = true; }
            setObjective("Collect the Blessing of Prosperity at the top of the platforms.");
        }
    }
    else if (obj.type === 'mountain_shrine') {
        if (gameState.stage === 'WEST_COURAGE') {
            showToast("The Mountain Shrine opens! The Blessing of Courage is revealed!");
            let b4 = interactables.find(i => i.id === 'blessing_courage');
            if (b4) { b4.visible = true; b4.mesh.visible = true; }
        } else {
            showToast("A shrine standing firm against the rock slides.");
        }
    }
    else if (obj.type === 'diya') {
        if (gameState.stage !== 'NORTH_DEVOTION') {
            showToast("An unlit Diya. It feels cold.");
            return;
        }
        // Don't remove the Diya, just light it!
        let flame = obj.mesh.getObjectByName("diya_flame");
        let light = obj.mesh.getObjectByName("diya_light");
        if (flame) flame.visible = true;
        if (light) light.visible = true;
        obj.interacted = true;
        questData.diyasLit = (questData.diyasLit || 0) + 1;
        showToast("Sacred Diya Lit! " + questData.diyasLit + "/3");
        if (questData.diyasLit >= 3) {
            showToast("The Desert Shrine illuminates. The Blessing appears!");
            let b3 = interactables.find(i => i.id === 'blessing_devotion');
            if (b3) { b3.mesh.visible = true; b3.visible = true; }
            setObjective("Collect the Blessing of Devotion.");
        }
    }
    else if (obj.type === 'hidden_shrine') {
        if (gameState.stage === 'NORTH_DEVOTION' && !questData.diyasLit) {
            setObjective("Light the 3 Sacred Diyas in the ruins.");
            showToast("The Shrine is dormant. Light the 3 nearby Diyas.");
        }
    }
    else if (obj.type === 'corruption') {
        obj.visible = false; obj.mesh.visible = false;
        scene.remove(obj.mesh);
        let idx = interactables.indexOf(obj);
        if (idx > -1) interactables.splice(idx, 1);
        questData.corruptionsCleared = (questData.corruptionsCleared || 0) + 1;
        showToast("Corruption Cleared! " + questData.corruptionsCleared + "/4");
        if (questData.corruptionsCleared >= 4) {
            playEndingCinematic();
        }
    }
    else if (obj.type === 'blessing') {
        obj.visible = false; obj.mesh.visible = false;
        scene.remove(obj.mesh);
        let idx = interactables.indexOf(obj);
        if (idx > -1) interactables.splice(idx, 1);
        gameState.blessings++;
        updateHUD();
        
        // Taunt from Banasura!
        triggerBanasuraTaunt(gameState.blessings);
        
        if (obj.id === 'blessing_devotion') {
            showToast("BLESSING OF DEVOTION OBTAINED\nThe path to the East is open!");
            gameState.stage = 'EAST_PROSPERITY';
            setObjective("Climb the platforms and collect all 5 offerings in the East.");
        }
        else if (obj.id === 'blessing_prosperity') {
            showToast("BLESSING OF PROSPERITY OBTAINED\nThe Southern winds clear the path!");
            gameState.stage = 'SOUTH_WISDOM';
            setObjective("Find the three Stone Symbols in the Southern Grove.");
        }
        else if (obj.id === 'blessing_wisdom') {
            showToast("BLESSING OF WISDOM OBTAINED\nThe treacherous Western path reveals itself!");
            gameState.stage = 'WEST_COURAGE';
            setObjective("Navigate the Mountain canyon in the West.");
        }
        else if (obj.id === 'blessing_courage') {
            showToast("BLESSING OF COURAGE OBTAINED\nALL FOUR BLESSINGS RECOVERED!");
            gameState.stage = 'RETURN_CENTER';
            setObjective("Return to Ganapati at the Central Shrine.");
        }
    }
}

let activeQuizQuestions = [];

function startQuiz() {
    document.getElementById('quiz-start-buttons').style.display = 'none';
    document.getElementById('quiz-question-container').style.display = 'block';
    
    // Pick 3 random questions from the 20 available
    let shuffled = QUIZ_DATA.questions.slice().sort(() => 0.5 - Math.random());
    activeQuizQuestions = shuffled.slice(0, 3);
    
    currentQuestion = 0;
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= activeQuizQuestions.length) {
        document.getElementById('quiz-question-container').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'block';
        document.getElementById('quiz-score').innerText = "Knowledge Key & 2 Modaks Granted!";
        gameState.keys++;
        gameState.modaks += 2;
        updateHUD();
        document.getElementById('btn-quiz-continue').onclick = () => { uiQuiz.classList.remove('active'); uiHud.classList.add('active'); isPaused = false; };
        return;
    }
    const q = activeQuizQuestions[currentQuestion];
    document.getElementById('quiz-q').innerText = q.q;
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('opt-' + i);
        btn.innerText = q.options[i];
        btn.onclick = () => {
            if (i === q.correct) { 
                currentQuestion++; 
                showQuestion(); 
            } 
            else { 
                // Wrong answer! End quiz and deduct health
                gameState.health--;
                updateHUD();
                
                uiQuiz.classList.remove('active'); 
                uiHud.classList.add('active'); 
                isPaused = false;
                
                showToast("Incorrect! The Shrine demands a toll. Lost 1 Health.");
                
                if (gameState.health <= 0) {
                    showGameOver();
                }
            }
        };
    }
}

// ==========================================
// MINIMAP
// ==========================================
const minimapCanvas = document.getElementById('minimap');
const mmCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

function updateMinimap() {
    if (!mmCtx) return;
    mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    const mapW = minimapCanvas.width;
    const mapH = minimapCanvas.height;
    mmCtx.save();
    mmCtx.translate(mapW/2, mapH/2);
    const scale = mapW / 1200; // Open world is huge, zoom out Minimap
    mmCtx.scale(scale, scale);
    mmCtx.translate(-player.position.x, -player.position.z);
    
    mmCtx.fillStyle = '#5c3a21';
    for (let w of walls) {
        if (!w.isActive) continue;
        mmCtx.fillRect(w.minX, w.minZ, w.maxX - w.minX, w.maxZ - w.minZ);
    }
    for (let obj of interactables) {
        if (!obj.visible) continue;
        mmCtx.fillStyle = (obj.type === 'blessing') ? '#00ff00' : '#ffaa00';
        mmCtx.beginPath(); mmCtx.arc(obj.x, obj.z, 20, 0, Math.PI*2); mmCtx.fill();
    }
    mmCtx.fillStyle = '#ffffff';
    mmCtx.beginPath(); mmCtx.arc(player.position.x, player.position.z, 25, 0, Math.PI*2); mmCtx.fill();
    
    mmCtx.strokeStyle = '#00ff00'; mmCtx.lineWidth = 10;
    mmCtx.beginPath(); mmCtx.moveTo(player.position.x, player.position.z);
    mmCtx.lineTo(player.position.x + Math.sin(player.rotation.y)*60, player.position.z + Math.cos(player.rotation.y)*60);
    mmCtx.stroke();
    mmCtx.restore();
}

// ==========================================
// GAME LOOP
// ==========================================
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    particles.rotation.y += 0.05 * delta;
    
    // --- Dynamic Time of Day / Sky System ---
    let targetSkyColor = new THREE.Color(0x87CEEB); // Default Day
    let targetSunIntensity = 1.0;
    
    if (gameState.stage === 'FINAL_VIGHNA' || (isCinematic && cinematicIndex > 4 && cinematicIndex < 10)) {
        targetSkyColor.setHex(0x220000); // Vighna Red
        targetSunIntensity = 0.2;
    } else if (gameState.stage === 'NORTH_DEVOTION') {
        targetSkyColor.setHex(0xff7744); // Sunset for the Desert/Diyas
        targetSunIntensity = 0.8;
    } else if (gameState.stage === 'WEST_COURAGE' || gameState.stage === 'RETURN_CENTER') {
        targetSkyColor.setHex(0x0a0a2a); // Deep Night for the final challenge
        targetSunIntensity = 0.1;
    } else if (gameState.stage === 'GAME_COMPLETE' || (isCinematic && cinematicIndex > 20)) {
        targetSkyColor.setHex(0xaaddff); // Brilliant Dawn
        targetSunIntensity = 1.2;
    }
    
    // Smoothly interpolate sky, fog, and sun
    scene.background.lerp(targetSkyColor, 0.02);
    scene.fog.color.lerp(targetSkyColor, 0.02);
    if (typeof dirLight !== 'undefined') {
        dirLight.intensity += (targetSunIntensity - dirLight.intensity) * 0.02;
    }
    // ----------------------------------------

    // Only spin the camera if we are on the main menu (not playing, not in a cinematic)
    if (!isPlaying && !isCinematic) {
        camera.position.x = Math.sin(Date.now() * 0.0002) * 150;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 150;
        camera.position.y = 100;
        camera.lookAt(0, 20, 0);
    }
    
    if (isPlaying && !isPaused) {
        updateZoneQuests();
        
        // Animate dynamic objects
        for (let obj of interactables) {
            if (!obj.visible) continue;
            if (obj.type === 'blessing') {
                obj.mesh.children[0].rotation.y += delta;
                obj.mesh.children[1].rotation.x += delta * 1.5;
                obj.mesh.children[2].rotation.z += delta * 1.5;
            } else if (obj.type === 'symbol') {
                obj.mesh.children[1].rotation.y += delta;
                obj.mesh.children[1].position.y = 12.5 + Math.sin(Date.now()*0.003) * 0.5;
            }
            
            // Animate highlights
            let highlight = obj.mesh.getObjectByName("quest_highlight");
            if (highlight) {
                highlight.rotation.y += delta * 2;
                highlight.position.y = 20 + Math.sin(Date.now() * 0.005) * 2;
            }
            let ring = obj.mesh.getObjectByName("quest_ring");
            if (ring) {
                ring.rotation.z += delta; // Ring rotates along its normal
            }
        }
        
                // West Region (Courage) - Falling Rocks
        if (player.position.x < -300 && player.position.x > -800 && Math.abs(player.position.z) < 100) {
            inRunnerMode = true;
            camOffset.set(60, 40, 0); // Camera behind player looking West
            
            if (Math.random() < 0.15) { // 3x spawn rate
                const geo = new THREE.DodecahedronGeometry(8 + Math.random() * 8); // varied sizes
                const mat = new THREE.MeshToonMaterial({ color: 0x555555 });
                const rock = new THREE.Mesh(geo, mat);
                // Drop from above, rolling towards +X (East)
                rock.position.set(player.position.x - 200, 100, Math.random() * 80 - 40);
                scene.add(rock);
                boulders.push({ 
                    mesh: rock, 
                    speedX: 80 + Math.random() * 60, // Faster
                    speedZ: (Math.random() - 0.5) * 60 // Move side to side
                });
            }
            
            for (let i = boulders.length - 1; i >= 0; i--) {
                let b = boulders[i];
                b.mesh.position.x += b.speedX * delta; // Roll East
                b.mesh.position.z += b.speedZ * delta; // Roll sideways
                b.mesh.position.y -= 50 * delta; // Fall down
                
                if (b.mesh.position.y < 8) {
                    b.mesh.position.y = 8;
                    // Boulders sometimes bounce off walls
                    if (b.mesh.position.z > 40 || b.mesh.position.z < -40) {
                        b.speedZ = -b.speedZ;
                    }
                }
                b.mesh.rotation.z -= b.speedX * delta * 0.1;
                
                // Collision
                let dist = Math.sqrt(Math.pow(player.position.x - b.mesh.position.x, 2) + Math.pow(player.position.z - b.mesh.position.z, 2));
                if (dist < 15) {
                    // Hit!
                    scene.remove(b.mesh);
                    boulders.splice(i, 1);
                    gameState.health--;
                    updateHUD();
                    showToast("HIT BY A ROCK! Health: " + gameState.health);
                    if (gameState.health <= 0) {
                        showToast("YOU FELL! Restarting...");
                        setTimeout(revivePlayer, 2000);
                    }
                    continue;
                }
                
                if (b.mesh.position.x > -200) {
                    scene.remove(b.mesh);
                    boulders.splice(i, 1);
                }
            }
        } else {
            inRunnerMode = false;
            
            if (cameraMode === 0) camOffset.set(0, 60, 60);
            if (cameraMode === 1) camOffset.set(0, 30, 40);
            if (cameraMode === 2) camOffset.set(0, 120, 15);

        }
        
        let dx = 0; let dz = 0;
        if (inRunnerMode) {
            // Camera is looking West (-X direction).
            // Pressing Up (W) moves West (-X).
            // Pressing Down (S) moves East (+X).
            // Pressing Left (A) moves South (+Z).
            // Pressing Right (D) moves North (-Z).
            if (keys.w || keys.arrowup) dx -= 1;
            if (keys.s || keys.arrowdown) dx += 1;
            if (keys.a || keys.arrowleft) dz += 1;
            if (keys.d || keys.arrowright) dz -= 1;
        } else {
            // Default Top-Down Camera
            if (keys.w || keys.arrowup) dz -= 1;
            if (keys.s || keys.arrowdown) dz += 1;
            if (keys.a || keys.arrowleft) dx -= 1;
            if (keys.d || keys.arrowright) dx += 1;
        }
        
        if (dx !== 0 || dz !== 0) {
            const len = Math.sqrt(dx*dx + dz*dz);
            dx /= len; dz /= len;
            let speed = inRunnerMode ? GAME_CONFIG.runnerSpeed * delta : GAME_CONFIG.playerSpeed * delta;
            
            const newX = player.position.x + dx * speed;
            const newZ = player.position.z + dz * speed;
            if (!checkCollision(newX, player.position.z, 6)) player.position.x = newX;
            if (!checkCollision(player.position.x, newZ, 6)) player.position.z = newZ;
            player.rotation.y = Math.atan2(dx, dz);
        }
        
        // Dynamic Ground Y Calculation (Stairs & Parkour)
        const distToCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
        let groundY = 0;
        if (distToCenter < 80) groundY = 7;
        else if (distToCenter < 150) groundY = 4;
        else if (distToCenter < 200) groundY = 2;
        
        if (typeof platforms !== 'undefined') {
            for (let p of platforms) {
                if (Math.abs(player.position.x - p.x) <= p.width/2 && Math.abs(player.position.z - p.z) <= p.depth/2) {
                    if (player.position.y >= p.y - 2) { 
                        groundY = Math.max(groundY, p.y);
                    }
                }
            }
        }
        
        if (typeof walls !== 'undefined') {
            for (let w of walls) {
                if (player.position.x >= w.minX && player.position.x <= w.maxX &&
                    player.position.z >= w.minZ && player.position.z <= w.maxZ) {
                    if (w.height && player.position.y >= w.height - 2) {
                        groundY = Math.max(groundY, w.height);
                    }
                }
            }
        }
        
        // Jump & Gravity Physics
        if (typeof window.playerVelocityY === 'undefined') window.playerVelocityY = 0;
        
        window.playerVelocityY -= 150 * delta; // Gravity
        player.position.y += window.playerVelocityY * delta;
        
        // Ground Collision
        if (player.position.y <= groundY) {
            player.position.y = groundY;
            window.playerVelocityY = 0;
            if (keys[' ']) {
                window.playerVelocityY = 100; // Jump Force (Increased)
            }
        }
        
        // === GUIDING ARROW LOGIC ===
        if (arrowContainer) {
            arrowContainer.position.copy(player.position);
            arrowContainer.position.y += 25 + Math.sin(Date.now() * 0.003) * 4; // Hover and bob smoothly
            arrowContainer.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15); // Subtle pulse
            arrowContainer.children[0].rotation.z += 0.05; // Spin the ring

            
            let target = null;
            if (gameState.stage === 'START' || gameState.stage === 'TALK_TO_GANESHA') target = ganesha ? ganesha.position : {x:0, z:0};
            else if (gameState.stage === 'NORTH_DEVOTION') {
                if ((questData.diyasLit || 0) < 3) {
                    for (let i=1; i<=3; i++) {
                        let diya = interactables.find(obj => obj.id === 'diya'+i);
                        if (diya && diya.visible) { target = diya; break; }
                    }
                } else {
                    target = {x: 0, z: -600}; // Hidden Shrine in North
                }
            }
            else if (gameState.stage === 'EAST_PROSPERITY') {
                if ((questData.offeringsFound || 0) < 5) {
                    for (let i=0; i<5; i++) {
                        let off = interactables.find(obj => obj.id === 'offering'+i);
                        if (off && off.visible) { target = off; break; }
                    }
                } else {
                    target = interactables.find(obj => obj.id === 'blessing_prosperity') || {x: 550, z: 0};
                }
            }
            else if (gameState.stage === 'SOUTH_WISDOM') {
                let sHit = questData.symbolsHit || 0;
                if (sHit === 0) target = {x: -150, z: 250};
                else if (sHit === 1) target = {x: 200, z: 350};
                else if (sHit === 2) target = {x: -50, z: 550};
                else target = {x: 0, z: 400}; // Shrine in South
            }
            else if (gameState.stage === 'WEST_COURAGE') {
                target = {x: -800, z: 0}; // End of the canyon
            }
            else if (gameState.stage === 'RETURN_CENTER' || gameState.stage === 'FINAL_VIGHNA') {
                target = {x: 0, z: 0};
            }
            
            if (target && isPlaying) {
                arrowContainer.visible = true;
                
                // Correct Math: dx, dz from player TO target
                let dx = target.x - player.position.x;
                let dz = target.z - player.position.z;
                let angle = Math.atan2(dx, dz);
                
                // Apply rotation directly so it perfectly tracks the destination in world space
                arrowContainer.rotation.y = angle;
                
            } else {
                arrowContainer.visible = false;
            }
        }

        // GANAPATI IS STATIONARY. No companion follow logic.
        
        // Always lerp camera for smooth cinematic feel!
        camera.position.lerp(new THREE.Vector3(player.position.x + camOffset.x, player.position.y + camOffset.y, player.position.z + camOffset.z), 0.1);
        camera.lookAt(player.position);
        
        // Move and Check Traps dynamically
        const timeNow = Date.now() * 0.002;
        for (let obj of interactables) {
            if (!obj.visible || obj.type !== 'corruption_trap') continue;
            
            // Movement logic based on trap ID
            if (obj.id.startsWith('trap_s_circle')) {
                // South traps move in fast sweeping circles
                obj.mesh.position.x = obj.x + Math.cos(timeNow * 2 + obj.z) * 60;
                obj.mesh.position.z = obj.z + Math.sin(timeNow * 2 + obj.z) * 60;
            } else if (obj.id.startsWith('trap_p')) {
                // Parkour traps move fast across the platforms
                obj.mesh.position.z = obj.z + Math.sin(timeNow * 3 + obj.x) * (obj.id === 'trap_p2' ? 60 : 30);
            } else if (obj.id.startsWith('trap_s')) {
                // South traps move in quick circles
                obj.mesh.position.x = obj.x + Math.cos(timeNow * 2.5 + obj.z) * 60;
                obj.mesh.position.z = obj.z + Math.sin(timeNow * 2.5 + obj.z) * 60;
            }
            
            let tDist = Math.sqrt(Math.pow(player.position.x - obj.mesh.position.x, 2) + Math.pow(player.position.z - obj.mesh.position.z, 2));
            let yDist = Math.abs(player.position.y - obj.mesh.position.y);
            
            if (tDist < 18 && yDist < 20) {
                // Take damage and bounce back
                gameState.health--;
                updateHUD();
                showToast("You touched corruption! Health remaining: " + gameState.health);
                
                // Bounce back aggressively
                player.position.x += (player.position.x - obj.mesh.position.x) * 1.5;
                player.position.z += (player.position.z - obj.mesh.position.z) * 1.5;
                
                if (gameState.health <= 0) {
                    showToast("YOU WERE OVERWHELMED! Restarting...");
                    setTimeout(revivePlayer, 2000);
                }
            }
        }
        
        
        // Check static hazards (Cacti, Thorns, Pits)
        if (typeof hazards !== 'undefined') {
            for (let hazard of hazards) {
                let hDist = Math.sqrt(Math.pow(player.position.x - hazard.x, 2) + Math.pow(player.position.z - hazard.z, 2));
                
                // Idle sway
                if (hazard.type === 'cactus' || hazard.type === 'thorn') {
                    hazard.mesh.rotation.z = Math.sin(Date.now() * 0.002 + hazard.x) * 0.05;
                }
                
                // Pits snap spikes up if player is near
                if (hazard.type === 'thorn_pit') {
                    let spikes = hazard.mesh.children[1]; // the spikes group
                    if (spikes) {
                        if (hDist < 30) {
                            spikes.position.y = THREE.MathUtils.lerp(spikes.position.y, 2, 0.2);
                        } else {
                            spikes.position.y = THREE.MathUtils.lerp(spikes.position.y, -4, 0.1);
                        }
                    }
                }
                
                let hyDist = Math.abs(player.position.y - hazard.mesh.position.y);
                if (hDist < hazard.radius && hyDist < 20) { // Hit hazard
                    if (!hazard.cooldown || Date.now() - hazard.cooldown > 1000) {
                        hazard.cooldown = Date.now();
                        gameState.health--;
                        updateHUD();
                        let msg = "Pricked by Thorns!";
                        if (hazard.type === 'cactus') msg = "Spiked by a Cactus!";
                        if (hazard.type === 'thorn_pit') msg = "Fell into a Thorn Pit!";
                        showToast("Ouch! " + msg + " Health: " + gameState.health);
                        
                        // Bounce back slightly
                        player.position.x += (player.position.x - hazard.x) * 1.0;
                        player.position.z += (player.position.z - hazard.z) * 1.0;
                        
                        if (gameState.health <= 0) {
                            showToast("YOU WERE DEFEATED! Restarting...");
                            setTimeout(revivePlayer, 2000);
                        }
                    }
                }
            }
        }
        
        // --- Player Animation ---
        if (typeof player !== 'undefined') {
            let legFR = player.getObjectByName('legFR');
            let legFL = player.getObjectByName('legFL');
            let legBR = player.getObjectByName('legBR');
            let legBL = player.getObjectByName('legBL');
            let body = player.getObjectByName('body');
            let tail = player.getObjectByName('tail');
            let head = player.getObjectByName('head');
            let earL = player.getObjectByName('earL');
            let earR = player.getObjectByName('earR');

            
            let isRunning = (typeof dx !== 'undefined') ? (dx !== 0 || dz !== 0) : false;
            let velocityY = (typeof window.playerVelocityY !== 'undefined') ? window.playerVelocityY : 0;
            // The isGrounded check needs groundY
            let isGrounded = (typeof groundY !== 'undefined') ? (player.position.y <= groundY + 0.5) : true;

            let time = Date.now() * 0.015;
            
            if (isRunning) { // Running
                if (legFR) legFR.rotation.x = Math.sin(time) * 0.8;
                if (legFL) legFL.rotation.x = Math.sin(time + Math.PI) * 0.8;
                if (legBR) legBR.rotation.x = Math.sin(time + Math.PI) * 0.8;
                if (legBL) legBL.rotation.x = Math.sin(time) * 0.8;
                
                if (body) body.rotation.z = Math.sin(time) * 0.1; // Body sway
                if (tail) tail.rotation.y = Math.sin(time) * 0.4;
            } else { // Idle
                if (legFR) legFR.rotation.x = 0;
                if (legFL) legFL.rotation.x = 0;
                if (legBR) legBR.rotation.x = 0;
                if (legBL) legBL.rotation.x = 0;
                
                if (body) body.rotation.z = 0;
                if (tail) tail.rotation.y = Math.sin(time * 0.2) * 0.2;
                
                // Random idle sniffs
                if (head) {
                    if (Math.random() < 0.01) head.rotation.x = -0.2;
                    else head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0, 0.1);
                }
                // Random ear twitches
                if (earL) earL.rotation.z = (Math.random() < 0.02) ? -0.5 : 0;
                if (earR) earR.rotation.z = (Math.random() < 0.02) ? 0.5 : 0;
            }
            
            // Jump tilt
            if (!isGrounded && body) {
                body.rotation.x = velocityY > 0 ? -0.3 : 0.3; // Pitch up when jumping, down when falling
            } else if (body) {
                body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, 0, 0.2);
            }
        }

        let canInteract = false;
        for (let obj of interactables) {
            if (!obj.visible) continue;
            let dist = Math.sqrt(Math.pow(player.position.x - obj.x, 2) + Math.pow(player.position.z - obj.z, 2));
            let yDist = Math.abs(player.position.y - obj.mesh.position.y);
            
            // Check interactable prompt
            let interactRadius = (obj.type === 'blessing') ? 60 : 25;
            if (dist < interactRadius && yDist < 30 && obj.type !== 'corruption_trap') { 
                canInteract = true; 
            }
        }
        
        // Check static hazards (Cacti, Thorns, Pits)
        if (typeof hazards !== 'undefined') {
            for (let hazard of hazards) {
                let hDist = Math.sqrt(Math.pow(player.position.x - hazard.mesh.position.x, 2) + Math.pow(player.position.z - hazard.mesh.position.z, 2));
                let hyDist = Math.abs(player.position.y - hazard.mesh.position.y);
                if (hDist < hazard.radius && hyDist < 20) { // Hit hazard
                    if (!hazard.cooldown || Date.now() - hazard.cooldown > 1000) {
                        hazard.cooldown = Date.now();
                        gameState.health--;
                        updateHUD();
                        let msg = "Pricked by Thorns!";
                        if (hazard.type === 'cactus') msg = "Spiked by a Cactus!";
                        if (hazard.type === 'thorn_pit') msg = "Fell into a Thorn Pit!";
                        showToast("Ouch! " + msg + " Health: " + gameState.health);
                        
                        // Bounce back slightly
                        player.position.x += (player.position.x - hazard.mesh.position.x) * 1.5;
                        player.position.z += (player.position.z - hazard.mesh.position.z) * 1.5;
                        
                        if (gameState.health <= 0) {
                            showToast("YOU PERISHED! Restarting...");
                            setTimeout(revivePlayer, 2000);
                        }
                    }
                }
            }
        }

        document.getElementById('interaction-prompt').style.display = canInteract ? 'block' : 'none';
        
        updateMinimap();
    }

    // Intro Cinematic Asteroid Animation
    if (isCinematic && cinematicIndex === 2 && typeof meteorMesh !== 'undefined' && meteorMesh && meteorMesh.visible) {
        meteorMesh.position.y -= 250 * delta; // Faster fall
        meteorMesh.rotation.x += 10 * delta;
        
        // Impact!
        if (meteorMesh.position.y <= 10) {
            meteorMesh.visible = false;
            introCameraShake = 20; // Start shaking
            
            // Turn city corrupted red and ground dark
            if (typeof dioramaGroup !== 'undefined' && dioramaGroup) {
                dioramaGroup.children.forEach(c => {
                    if (c.geometry && c.geometry.type === 'BoxGeometry') c.material.color.setHex(0x550000);
                    if (c.geometry && c.geometry.type === 'PlaneGeometry') c.material.color.setHex(0x221111);
                });
            }
            createSmokePuff(new THREE.Vector3(20, 10, 1950), 20); // Big explosion
        }
    }
    
    // Apply Camera Shake
    if (typeof introCameraShake !== 'undefined' && introCameraShake > 0) {
        camera.position.x += (Math.random() - 0.5) * 5;
        camera.position.y += (Math.random() - 0.5) * 5;
        introCameraShake -= delta * 15;
    }

    renderer.render(scene, camera);
}



let guideArrow, arrowContainer;
let barrierEast, barrierSouth, barrierWest;

async function initGame() {
    document.getElementById('loading-text').innerText = "Loading 3D Models (Checking assets/ folder)...";
    
    // Attempt to load external realistic models
    await Promise.all([
        loadModel('ganesha', 'assets/ganesha.glb'),
        loadModel('mooshak', 'assets/mooshak.glb'),
        loadModel('modak', 'assets/modak.glb'),
        loadModel('flag', 'assets/flag.glb'),
        loadModel('banasura', 'assets/banasura.glb')
    ]);
    
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
    
    // Build World
    createWorld(scene);

    // Characters
    player = createMooshak();
    createBanasura();
    if (localStorage.getItem('mooshakScale')) {
        player.scale.setScalar(parseFloat(localStorage.getItem('mooshakScale')));
    } else {
        player.scale.setScalar(1.5); // Default procedural scale
    }
    scene.add(player);
    
    ganesha = createGanesha();
    // (If no localStorage, it keeps the auto-scaler scale from loadModel)
    scene.add(ganesha);
    ganesha.position.set(0, 7, -20);
    
    animate();
}
initGame();

// ==========================================
// CINEMATICS
// ==========================================
function playOpeningCinematic() {
    isCinematic = true;
    isPlaying = false; // Lock controls
    
    // Start camera high up looking at the center
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);
    
    showToast("THE LOST BLESSINGS");
    
    setTimeout(() => {
        showToast("The Ananta Jyoti burns brightly...");
        // Move camera closer
        camera.position.set(50, 40, 50);
        camera.lookAt(0, 0, 0);
    }, 4000);
    
    setTimeout(() => {
        // Vighna event!
        // Sky handled dynamically
        showToast("BOOM! VIGHNA HAS STRUCK!");
        // Shake screen effect hack
        let shakes = 0;
        let shaker = setInterval(() => {
            camera.position.x += (Math.random() - 0.5) * 5;
            camera.position.y += (Math.random() - 0.5) * 5;
            shakes++;
            if (shakes > 20) clearInterval(shaker);
        }, 50);
    }, 8000);
    
    setTimeout(() => {
        showToast("The Blessings have been scattered...");
    }, 11000);
    
    setTimeout(() => {
        showToast("Mooshak, you must save the festival!");
        // Return control to player
        isCinematic = false;
        isPlaying = true;
        // Sky handled dynamically
        gameState.stage = 'TALK_TO_GANESHA';
        setObjective("Speak to Ganapati at the Shrine");
    }, 15000);
}

function startFinalVighnaEvent() {
    gameState.stage = 'FINAL_VIGHNA';
    setObjective("Break Banasura's barrier to summon Vinayaka!");
    showToast("BANASURA SURROUNDS THE STATUE WITH DARKNESS!");
    // Sky handled dynamically
    
    // Spawn 4 corrupted points around the center
    createInteractable(scene, 'vighna1', 'corruption', 30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna2', 'corruption', -30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna3', 'corruption', 30, -30, 0xff0000, 'box');
    createInteractable(scene, 'vighna4', 'corruption', -30, -30, 0xff0000, 'box');
    questData.corruptionsCleared = 0;
}

function triggerBanasuraTaunt(blessingCount) {
    isPaused = true;
    uiHud.classList.remove('active');
    
    const taunts = [
        "YOU CLAIM ONE BLESSING, BUT MY DARKNESS IS ETERNAL!",
        "FOOL! THE MORE YOU GATHER, THE CLOSER YOU COME TO YOUR DOOM!",
        "GANESHA CANNOT SAVE YOU NOW. SURRENDER TO BANASURA!",
        "NO! THE FINAL BLESSING... I WILL CRUSH YOU MYSELF!"
    ];
    
    // Environment changes
    if (scene && scene.background) scene.background.setHex(0x330000); // Deep red
    if (scene && scene.fog) {
        scene.fog.color.setHex(0x330000);
        scene.fog.density = 0.004; // Thicker fog
    }
    
    // Screen shake
    document.getElementById('game-container').classList.add('shake');
    
    // Show cinematic
    const cinematic = document.getElementById('cinematic-screen');
    const textEl = document.getElementById('cinematic-text');
    cinematic.classList.add('active');
    cinematic.style.background = "rgba(100, 0, 0, 0.7)"; 
    
    textEl.innerText = "BANASURA: \"" + taunts[Math.min(blessingCount - 1, 3)] + "\"";
    textEl.style.color = "#ff3333";
    textEl.style.fontSize = "40px";
    
    const skipBtn = document.getElementById('btn-skip-cinematic');
    skipBtn.innerText = "BRACE YOURSELF";
    
    // Temporarily overwrite the skip behavior for this taunt
    const oldOnClick = skipBtn.onclick;
    skipBtn.onclick = () => {
        cinematic.classList.remove('active');
        cinematic.style.background = "rgba(0,0,0,0.3)";
        textEl.style.color = "#fff";
        textEl.style.fontSize = "";
        skipBtn.innerText = "SKIP";
        
        // Restore environment
        if (scene && scene.background) scene.background.setHex(0x0a0a1a);
        if (scene && scene.fog) {
            scene.fog.color.setHex(0x0a0a1a);
            scene.fog.density = 0.0015;
        }
        document.getElementById('game-container').classList.remove('shake');
        
        uiHud.classList.add('active');
        isPaused = false;
        
        // Restore old behavior for cinematic skip
        skipBtn.onclick = oldOnClick;
    };
}

function playEndingCinematic() {
    isCinematic = true;
    isPlaying = false;
    
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);
    
    gameState.stage = "GAME_COMPLETE"; // Triggers brilliant dawn
    
    showToast("THE FINAL CORRUPTION IS CLEARED!");
    
    setTimeout(() => {
        showToast("VINAYAKA IS SUMMONED! The statue bursts with blinding divine light.");
    }, 4000);
    
    setTimeout(() => {
        showToast("Banasura: 'NO! IMPOSSIBLE!'");
    }, 8000);

    setTimeout(() => {
        showToast("With a single strike of his tusk, Vinayaka shatters Banasura into dust.");
    }, 12000);
    
    setTimeout(() => {
        showToast("Ganapati: 'Well done, Mooshak. The darkness is banished.'");
    }, 16000);

    setTimeout(() => {
        showToast("HAPPY GANESH CHATURTHI!\nGanpati Bappa Morya!");
        document.getElementById('hud-objective').innerHTML = "<b>THE FESTIVAL IS COMPLETE</b>";
    }, 20000);
}

