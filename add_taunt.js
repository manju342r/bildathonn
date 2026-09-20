const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const injection = `
let banasuraMesh = null;
let banasuraTaunting = false;

function createBanasura() {
    if (modelCache['banasura']) {
        banasuraMesh = modelCache['banasura'].clone();
    } else {
        // Placeholder procedural if glb is missing
        banasuraMesh = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(10, 30, 10), new THREE.MeshToonMaterial({color: 0x331111}));
        body.position.y = 15;
        const head = new THREE.Mesh(new THREE.SphereGeometry(6), new THREE.MeshToonMaterial({color: 0xaa2222}));
        head.position.y = 35;
        banasuraMesh.add(body, head);
    }
    banasuraMesh.visible = false;
    scene.add(banasuraMesh);
}

function triggerBanasuraTaunt(blessingCount) {
    if (!banasuraMesh) return;
    
    banasuraTaunting = true;
    banasuraMesh.visible = true;
    
    // Position him cinematically based on biome
    if (blessingCount === 1) {
        // Assuming North desert (place him on a dune/ruin in front of player)
        banasuraMesh.position.set(player.position.x, 30, player.position.z - 60);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        showToast("Banasura: 'One blessing. You think that will stop me? Keep searching, little one.'");
    } else if (blessingCount === 2) {
        // Assuming South grove or East city (place him up high)
        banasuraMesh.position.set(player.position.x + 50, 40, player.position.z + 50);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        showToast("Banasura: 'Two... You are getting closer. But every step brings you closer to destruction.'");
    } else if (blessingCount === 3) {
        banasuraMesh.position.set(player.position.x - 50, 20, player.position.z);
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        showToast("Banasura: 'Three blessings... The final path belongs to me. Come to the Mountain!'");
    } else if (blessingCount === 4) {
        banasuraMesh.position.set(-1250, 55, 0); // Mountain Summit fixed position
        banasuraMesh.lookAt(player.position.x, player.position.y, player.position.z);
        showToast("Banasura: 'You have gathered the blessings. Do you truly believe they can restore what I have destroyed?'");
    }
    
    // Add smoke puff effect
    createSmokePuff(banasuraMesh.position);

    // Hide him after 12 seconds, unless it's the 4th blessing (he stays at the mountain)
    if (blessingCount < 4) {
        setTimeout(() => {
            if (banasuraMesh) banasuraMesh.visible = false;
            createSmokePuff(banasuraMesh.position);
            banasuraTaunting = false;
        }, 12000);
    } else {
        banasuraTaunting = false; // He stays visible!
    }
}

function createSmokePuff(pos) {
    // Simple visual puff
    for(let i=0; i<15; i++) {
        let p = new THREE.Mesh(new THREE.SphereGeometry(3+Math.random()*3), new THREE.MeshToonMaterial({color: 0x111111, transparent: true, opacity: 0.8}));
        p.position.copy(pos);
        p.position.y += Math.random() * 20;
        p.position.x += (Math.random()-0.5)*15;
        p.position.z += (Math.random()-0.5)*15;
        scene.add(p);
        
        let targetY = p.position.y + 20 + Math.random()*20;
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
`;

code = code.replace("function createMooshak() {", injection + "\nfunction createMooshak() {");
code = code.replace("player = createMooshak();", "player = createMooshak();\n    createBanasura();");

fs.writeFileSync('src/main.js', code);
