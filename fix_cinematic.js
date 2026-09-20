const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const oldCinematic = `function startCinematic() {
    isCinematic = true;
    cinematicIndex = 0;
    
    // Quick camera pan across the world
    camera.position.set(0, 150, 400);
    camera.lookAt(0, 0, 0);`;

const newCinematic = `
// Diorama elements for opening
let dioramaGroup;

function startCinematic() {
    isCinematic = true;
    cinematicIndex = 0;
    
    // Create a stylized off-camera ruined city diorama at Z=2000
    dioramaGroup = new THREE.Group();
    dioramaGroup.position.set(0, 0, 2000);
    
    const dFloor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshToonMaterial({color: 0x88cc88}));
    dFloor.rotation.x = -Math.PI/2;
    dioramaGroup.add(dFloor);
    
    for(let i=0; i<15; i++) {
        let h = 10 + Math.random()*30;
        let b = new THREE.Mesh(new THREE.BoxGeometry(10, h, 10), new THREE.MeshToonMaterial({color: 0xdddddd}));
        b.position.set((Math.random()-0.5)*150, h/2, (Math.random()-0.5)*150);
        dioramaGroup.add(b);
    }
    scene.add(dioramaGroup);
    
    // Position camera at diorama
    camera.position.set(0, 50, 2150);
    camera.lookAt(0, 0, 2000);`;

code = code.replace(oldCinematic, newCinematic);

const oldAdvance = `function advanceCinematic() {
    cinematicIndex++;
    if (cinematicIndex === 1) {
        showToast("The Sacred Shrine stands as the last beacon of hope.");
        camera.position.set(-200, 100, 200);
        camera.lookAt(0, 0, 0);
    } else if (cinematicIndex === 2) {
        showToast("The Dark Lord Banasura has scattered its power.");
        camera.position.set(0, 50, -300);
        camera.lookAt(0, 0, 0);
    } else if (cinematicIndex === 3) {
        showToast("Only Mooshak can restore the Lost Blessings...");
        camera.position.set(50, 30, 50);
        camera.lookAt(0, 10, 0);
    } else {
        isCinematic = false;
        showToast("Use W,A,S,D to move. Press Space to jump. Press E to interact.");
        gameState.stage = 'TALK_TO_GANESHA';
        setObjective("Approach Ganapati Ji at the Central Shrine.");
    }
}`;

const newAdvance = `function advanceCinematic() {
    cinematicIndex++;
    if (cinematicIndex === 1) {
        showToast("The cities had fallen one by one...");
        // Make the diorama buildings turn red/corrupted
        dioramaGroup.children.forEach(c => {
            if (c.geometry.type === 'BoxGeometry') c.material.color.setHex(0x220000);
        });
        camera.position.set(50, 60, 2150);
        camera.lookAt(0, 0, 2000);
    } else if (cinematicIndex === 2) {
        showToast("The destroyer had arrived.");
        if (banasuraMesh) {
            banasuraMesh.visible = true;
            banasuraMesh.position.set(0, 20, 2050);
            banasuraMesh.lookAt(0,0,2000);
        }
    } else if (cinematicIndex === 3) {
        showToast("The final sacred temple still stood.");
        if (banasuraMesh) banasuraMesh.visible = false;
        if (dioramaGroup) scene.remove(dioramaGroup); // Cleanup
        
        // Teleport camera to Central Shrine
        camera.position.set(0, 150, 250);
        camera.lookAt(0, 20, 0);
    } else if (cinematicIndex === 4) {
        showToast("Banasura approaches the Sacred Shrine...");
        camera.position.set(100, 80, 100);
        camera.lookAt(0, 20, 0);
    } else {
        isCinematic = false;
        showToast("Use W,A,S,D to move. Press Space to jump. Press E to interact.");
        gameState.stage = 'TALK_TO_GANESHA';
        setObjective("Approach Ganapati Ji at the Central Shrine.");
    }
}`;

code = code.replace(oldAdvance, newAdvance);

fs.writeFileSync('src/main.js', code);
