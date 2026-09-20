// Game State
let gameState = {
    health: 3,
    keys: 0,
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
const gltfLoader = new THREE.GLTFLoader();

// Helper to load realistic .glb models if they exist in the assets folder
function loadModel(name, path) {
    return new Promise((resolve) => {
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
            const targetSize = name === 'ganesha' ? 120 : 5; 
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
const pMat = new THREE.PointsMaterial({color: 0xffaa00, size: 3, transparent: true, opacity: 0.8});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);


// Characters







// Input
const keys = { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false, e: false };
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (keys.hasOwnProperty(k)) keys[k] = true;
    if (k === 'e' && isPlaying && !isPaused) checkInteraction();
    
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

function startCinematic() {
    uiMainMenu.classList.remove('active');
    uiCinematic.classList.add('active');
    cinematicIndex = 0;
    
    // Position Characters for Intro
    player.position.set(0, 0, 10);
    
    // Create Guide Arrow (Literal Arrow Shape)
    arrowContainer = new THREE.Group();
    const arrowMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    
    // The shaft (rectangular box)
    const shaftGeo = new THREE.BoxGeometry(1.5, 1.5, 6);
    const shaft = new THREE.Mesh(shaftGeo, arrowMat);
    shaft.position.z = -3; // Move shaft back
    
    // The head (triangle/cone)
    const headGeo = new THREE.ConeGeometry(3, 4, 4);
    const head = new THREE.Mesh(headGeo, arrowMat);
    head.rotation.x = Math.PI / 2; // Point forward along Z axis
    head.rotation.y = Math.PI / 4; // Make it look like a flat triangle
    head.position.z = 2; // Move head forward
    
    arrowContainer.add(shaft, head);
    scene.add(arrowContainer);
    
    // Barriers removed per user request (Open World freedom)

    if (typeof ganesha !== 'undefined') ganesha.position.set(0, 7, -20);
    
    isCinematic = true;
    isPlaying = false; // Lock controls
    
    // Start camera high up looking at the center
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);
    
    nextCinematicText();
}

function nextCinematicText() {
    if (cinematicIndex < STORY_TEXTS.intro.length) {
        cinematicText.innerText = STORY_TEXTS.intro[cinematicIndex];
        
        // 3D Camera & Effects synced with text index
        if (cinematicIndex === 2) {
            // Camera zooms in slightly
            camera.position.set(40, 40, 60);
            camera.lookAt(0, 0, -20);
        }
        else if (cinematicIndex === 4) {
            // BOOM - Vighna hits
            // Sky handled dynamically
            let shakes = 0;
            let shaker = setInterval(() => {
                camera.position.x += (Math.random() - 0.5) * 5;
                camera.position.y += (Math.random() - 0.5) * 5;
                shakes++;
                if (shakes > 15) clearInterval(shaker);
            }, 50);
        }
        
        cinematicIndex++;
        cinematicTimeout = setTimeout(nextCinematicText, 4000);
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
        if (!obj.visible) continue;
        let dist = Math.sqrt(Math.pow(pX - obj.x, 2) + Math.pow(pZ - obj.z, 2));
        if (dist < 25) { handleObjInteraction(obj); break; }
    }
}

function handleGaneshaInteraction() {
    if (gameState.stage === 'TALK_TO_GANESHA') {
        showToast("Ganapati: Mooshak, my faithful vahana...");
        setTimeout(() => showToast("Ganapati: Vighna has returned and shattered the Ananta Jyoti!"), 3000);
        setTimeout(() => showToast("Ganapati: The four sacred blessings have been scattered across the land."), 6000);
        setTimeout(() => {
            showToast("Ganapati: You are small, Mooshak, but wisdom matters more than size.\nHead NORTH to the Ancient Grove first.");
            gameState.stage = 'NORTH_WISDOM';
            setObjective("Find the three Stone Symbols in the North.");
        }, 9000);
    } else if (gameState.stage === 'RETURN_CENTER') {
        showToast("Ganapati: You have done well, Mooshak.");
        setTimeout(() => {
            showToast("Ganapati: But Vighna is not finished — it has corrupted the very shrine!\nBreak through it!");
            startFinalVighnaEvent();
        }, 3000);
    } else {
        showToast("Ganapati: I am Vighnaharta — the Remover of Obstacles. But today, you must be the one to remove them.");
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
        if (gameState.stage !== 'NORTH_WISDOM') {
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
        questData.offeringsFound = (questData.offeringsFound || 0) + 1;
        showToast("Offering Collected! " + questData.offeringsFound + "/5");
        if (questData.offeringsFound >= 5) {
            showToast("All offerings collected! Return to the Prosperity Shrine.");
            setObjective("Return to the Prosperity Shrine.");
        }
    }
    else if (obj.type === 'prosperity_shrine') {
        if (questData.offeringsFound >= 5 && !questData.prosperitySpawned) {
            questData.prosperitySpawned = true;
            showToast("The Shrine accepts the offerings. The Blessing appears!");
            let b2 = interactables.find(i => i.id === 'blessing_prosperity');
            if (b2) { b2.mesh.visible = true; b2.visible = true; }
            setObjective("Collect the Blessing of Prosperity.");
        } else if (questData.offeringsFound < 5) {
            showToast("The Shrine requires 5 scattered offerings.");
        }
    }
    else if (obj.type === 'diya') {
        if (gameState.stage !== 'SOUTH_DEVOTION') {
            showToast("An unlit Diya.");
            return;
        }
        obj.visible = false; obj.mesh.visible = false; // "Lit" visually later if we had material change
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
        if (gameState.stage === 'SOUTH_DEVOTION' && !questData.diyasLit) {
            setObjective("Light the 3 Sacred Diyas in the desert.");
            showToast("The Shrine is dormant. Light the 3 nearby Diyas.");
        }
    }
    else if (obj.type === 'corruption') {
        obj.visible = false; obj.mesh.visible = false;
        questData.corruptionsCleared = (questData.corruptionsCleared || 0) + 1;
        showToast("Corruption Cleared! " + questData.corruptionsCleared + "/4");
        if (questData.corruptionsCleared >= 4) {
            playEndingCinematic();
        }
    }
    else if (obj.type === 'blessing') {
        obj.visible = false; obj.mesh.visible = false;
        gameState.blessings++;
        updateHUD();
        
        if (obj.id === 'blessing_wisdom') {
            showToast("BLESSING OF WISDOM OBTAINED\nThe path to the East is open!");
            gameState.stage = 'EAST_PROSPERITY';
            setObjective("Find the 5 offerings in the Eastern Festival.");
        }
        else if (obj.id === 'blessing_prosperity') {
            showToast("BLESSING OF PROSPERITY OBTAINED\nThe Southern winds clear the path!");
            gameState.stage = 'SOUTH_DEVOTION';
            setObjective("Find the Forgotten Shrine in the Southern Desert.");
        }
        else if (obj.id === 'blessing_devotion') {
            showToast("BLESSING OF DEVOTION OBTAINED\nThe treacherous Western path reveals itself!");
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

// Quiz
function startQuiz() {
    document.getElementById('quiz-start-buttons').style.display = 'none';
    document.getElementById('quiz-question-container').style.display = 'block';
    currentQuestion = 0;
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= QUIZ_DATA.questions.length) {
        document.getElementById('quiz-question-container').style.display = 'none';
        document.getElementById('quiz-result').style.display = 'block';
        document.getElementById('quiz-score').innerText = "Knowledge Key Granted!";
        gameState.keys++;
        updateHUD();
        document.getElementById('btn-quiz-continue').onclick = () => { uiQuiz.classList.remove('active'); uiHud.classList.add('active'); isPaused = false; };
        return;
    }
    const q = QUIZ_DATA.questions[currentQuestion];
    document.getElementById('quiz-q').innerText = q.q;
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById('opt-' + i);
        btn.innerText = q.options[i];
        btn.onclick = () => {
            if (i === q.correct) { currentQuestion++; showQuestion(); } 
            else { document.getElementById('quiz-score').innerText = "Incorrect!"; }
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
    } else if (gameState.stage === 'SOUTH_DEVOTION') {
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

    if (!isPlaying && cinematicIndex > 0) {
        camera.position.x = Math.sin(Date.now() * 0.0002) * 150;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 150;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);
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
            
            if (Math.random() < 0.05) {
                const geo = new THREE.DodecahedronGeometry(8);
                const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
                const rock = new THREE.Mesh(geo, mat);
                // Drop from above, rolling towards +X (East)
                rock.position.set(player.position.x - 200, 100, Math.random() * 80 - 40);
                scene.add(rock);
                boulders.push({ mesh: rock, speed: 60 + Math.random() * 40 });
            }
            
            for (let i = boulders.length - 1; i >= 0; i--) {
                let b = boulders[i];
                b.mesh.position.x += b.speed * delta; // Roll East
                b.mesh.position.y -= 50 * delta; // Fall down
                if (b.mesh.position.y < 8) b.mesh.position.y = 8;
                b.mesh.rotation.z -= b.speed * delta * 0.1;
                
                // Collision
                let dist = Math.sqrt(Math.pow(player.position.x - b.mesh.position.x, 2) + Math.pow(player.position.z - b.mesh.position.z, 2));
                if (dist < 12) {
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
            camOffset.set(0, 60, 80);
        }
        
        let dx = 0; let dz = 0;
        if (keys.w || keys.arrowup) dz -= 1;
        if (keys.s || keys.arrowdown) dz += 1;
        if (keys.a || keys.arrowleft) dx -= 1;
        if (keys.d || keys.arrowright) dx += 1;
        
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
        
        // Dynamic Elevation for Central Shrine (Stairs effect)
        const distToCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
        let targetY = 0;
        if (distToCenter < 80) targetY = 7;
        else if (distToCenter < 150) targetY = 4;
        else if (distToCenter < 200) targetY = 2;
        
        // Smoothly step up/down
        player.position.y += (targetY - player.position.y) * 0.2;
        
        // === GUIDING ARROW LOGIC ===
        if (arrowContainer) {
            arrowContainer.position.copy(player.position);
            arrowContainer.position.y += 12 + Math.sin(Date.now() * 0.005) * 2; // Hover and bob
            
            let target = null;
            if (gameState.stage === 'START' || gameState.stage === 'TALK_TO_GANESHA') target = ganesha ? ganesha.position : {x:0, z:0};
            else if (gameState.stage === 'NORTH_WISDOM') {
                let sHit = questData.symbolsHit || 0;
                if (sHit === 0) target = {x: -150, z: -250};
                else if (sHit === 1) target = {x: 200, z: -350};
                else if (sHit === 2) target = {x: -50, z: -550};
                else target = {x: 0, z: -400};
            }
            else if (gameState.stage === 'EAST_PROSPERITY') {
                if ((questData.offeringsFound || 0) < 5) {
                    // Point to the first uncollected offering
                    for (let i=0; i<5; i++) {
                        let off = interactables.find(obj => obj.id === 'offering'+i);
                        if (off && off.visible) { target = off; break; }
                    }
                } else {
                    target = {x: 550, z: 0}; // Prosperity Shrine
                }
            }
            else if (gameState.stage === 'SOUTH_DEVOTION') {
                if ((questData.diyasLit || 0) < 3) {
                    for (let i=1; i<=3; i++) {
                        let diya = interactables.find(obj => obj.id === 'diya'+i);
                        if (diya && diya.visible) { target = diya; break; }
                    }
                } else {
                    target = {x: 0, z: 600}; // Blessing of devotion
                }
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
        
        if (inRunnerMode) camera.position.lerp(new THREE.Vector3(player.position.x + camOffset.x, player.position.y + camOffset.y, player.position.z + camOffset.z), 0.1);
        else {
            camera.position.x = player.position.x + camOffset.x;
            camera.position.y = player.position.y + camOffset.y;
            camera.position.z = player.position.z + camOffset.z;
        }
        camera.lookAt(player.position);
        
        let canInteract = false;
        for (let obj of interactables) {
            if (obj.visible && Math.sqrt(Math.pow(player.position.x - obj.x, 2) + Math.pow(player.position.z - obj.z, 2)) < 25) { canInteract = true; break; }
        }
        document.getElementById('interaction-prompt').style.display = canInteract ? 'block' : 'none';
        
        updateMinimap();
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
        loadModel('flag', 'assets/flag.glb')
    ]);
    
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
    
    // Build World
    createWorld(scene);

    // Characters
    player = createMooshak();
    if (localStorage.getItem('mooshakScale')) {
        player.scale.setScalar(parseFloat(localStorage.getItem('mooshakScale')));
    } else {
        player.scale.setScalar(1.5); // Default procedural scale
    }
    scene.add(player);
    
    ganesha = createGanesha();
    if (localStorage.getItem('ganeshaScale')) {
        ganesha.scale.setScalar(parseFloat(localStorage.getItem('ganeshaScale')));
    }
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
    setObjective("Break through the final Vighna corruption!");
    showToast("VIGHNA RETURNS!");
    // Sky handled dynamically
    
    // Spawn 4 corrupted points around the center
    createInteractable(scene, 'vighna1', 'corruption', 30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna2', 'corruption', -30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna3', 'corruption', 30, -30, 0xff0000, 'box');
    createInteractable(scene, 'vighna4', 'corruption', -30, -30, 0xff0000, 'box');
    questData.corruptionsCleared = 0;
}

function playEndingCinematic() {
    isCinematic = true;
    isPlaying = false;
    
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);
    
    gameState.stage = "GAME_COMPLETE"; // Triggers brilliant dawn
    
    showToast("THE ANANTA JYOTI IS RESTORED!");
    
    setTimeout(() => {
        showToast("Like Ganesha, who turned wisdom into victory over Kartikeya...");
    }, 4000);
    
    setTimeout(() => {
        showToast("You did not race the world. You understood it.");
    }, 8000);

    setTimeout(() => {
        showToast("The blessings were never meant to make the journey easy.");
    }, 12000);
    
    setTimeout(() => {
        showToast("They were meant to guide the journey.");
    }, 16000);

    setTimeout(() => {
        showToast("HAPPY GANESH CHATURTHI!\nGanpati Bappa Morya!");
        document.getElementById('hud-objective').innerHTML = "<b>THE FESTIVAL IS COMPLETE</b>";
    }, 20000);
}

