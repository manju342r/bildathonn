// Global world arrays
const walls = [];
const interactables = [];
const hazards = [];
let gateVighna = null;

function addWall(scene, x, z, w, d, color = 0x5c3a21, h = 20) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color: color, map: Textures.Stone, roughness: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    let wallObj = {
        minX: x - w/2, maxX: x + w/2,
        minZ: z - d/2, maxZ: z + d/2,
        mesh: mesh,
        isActive: true
    };
    walls.push(wallObj);
    return wallObj;
}

function createInteractable(scene, id, type, x, z, color, geoType) {
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
    
    if (type === 'shrine') {
        const stone = new THREE.MeshStandardMaterial({map: Textures.Stone, roughness: 0.9, color: 0xaaaaaa});
        const base = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), stone);
        base.position.y = 1;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 10, 4), new THREE.MeshStandardMaterial({color: 0xcc4400}));
        roof.position.y = 14;
        roof.rotation.y = Math.PI/4;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p1.position.set(-6, 7, -6);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p2.position.set(6, 7, -6);
        const p3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p3.position.set(-6, 7, 6);
        const p4 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p4.position.set(6, 7, 6);
        group.add(base, p1, p2, p3, p4, roof);
    } 
    else if (type === 'flag') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 25), new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x664422, roughness: 0.9}));
        pole.position.y = 12.5;
        const cloth = new THREE.Mesh(new THREE.ConeGeometry(4, 10, 3), new THREE.MeshStandardMaterial({color: color, map: Textures.Cloth, roughness: 0.9}));
        cloth.rotation.z = -Math.PI / 2;
        cloth.position.set(5, 20, 0);
        group.add(pole, cloth);
    }
    else if (type === 'offering') {
        // Modak (Traditional Sweet) Shape
        const mat = new THREE.MeshStandardMaterial({color: 0xfff0cc, roughness: 0.4});
        const body = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), mat);
        body.scale.set(1, 0.8, 1);
        body.position.y = 2.4;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4, 16), mat);
        tip.position.y = 4.5;
        group.add(body, tip);
    }
    else if (type === 'bridge_part') {
        if (id === 'part_rope') {
            const rope = new THREE.Mesh(new THREE.TorusGeometry(3, 1, 8, 16), new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x8b4513, roughness: 0.9}));
            rope.rotation.x = Math.PI/2; rope.position.y = 1;
            group.add(rope);
        } else if (id === 'part_plank') {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 4), new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x5c3a21, roughness: 0.9}));
            plank.position.y = 0.5;
            group.add(plank);
        } else if (id === 'part_emblem') {
            const emblem = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1, 16), new THREE.MeshStandardMaterial({map: Textures.Gold, metalness: 0.9, roughness: 0.1, color: 0xffdd00}));
            emblem.rotation.x = Math.PI/2; emblem.position.y = 3;
            group.add(emblem);
        }
    }
    else if (type === 'symbol') {
        // Ancient Obelisk with glowing orb
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 10, 4), new THREE.MeshStandardMaterial({map: Textures.Stone, color: 0x555555, roughness: 1.0}));
        base.position.y = 5;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(2), new THREE.MeshStandardMaterial({color: color, emissive: color, emissiveIntensity: 0.8}));
        orb.position.y = 12.5;
        group.add(base, orb);
    }
    else if (type === 'blessing') {
        // Sacred glowing crystal with orbiting rings
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(2.5), new THREE.MeshStandardMaterial({color: color, emissive: color, emissiveIntensity: 1}));
        core.position.y = 10;
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.3, 8, 24), new THREE.MeshStandardMaterial({color: 0xffd700, emissive: 0xffd700}));
        ring1.rotation.x = Math.PI/2; ring1.position.y = 10;
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.3, 8, 24), new THREE.MeshStandardMaterial({color: 0xffd700, emissive: 0xffd700}));
        ring2.rotation.y = Math.PI/2; ring2.position.y = 10;
        group.add(core, ring1, ring2);
    }
    else if (type === 'prosperity_shrine') {
        const mat = new THREE.MeshStandardMaterial({color: 0xaa6644, roughness: 0.8});
        const table = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 4, 8), mat);
        table.position.y = 2;
        const cloth = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 1, 8), new THREE.MeshStandardMaterial({color: 0xff4400}));
        cloth.position.y = 4.2;
        group.add(table, cloth);
    }
    else if (type === 'diya') {
        const clayMat = new THREE.MeshStandardMaterial({color: 0x8b4513, roughness: 0.9});
        const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 2, 1, 16), clayMat);
        base.position.y = 0.5;
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16, 0, Math.PI*2, 0, Math.PI/2), clayMat);
        bowl.rotation.x = Math.PI; // Flip half-sphere upside down to make a bowl
        bowl.position.y = 1.5;
        const flame = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), new THREE.MeshStandardMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2}));
        flame.position.y = 2.5;
        const diyaLight = new THREE.PointLight(0xffaa00, 1, 30);
        diyaLight.position.y = 3;
        group.add(base, bowl, flame, diyaLight);
    }
    else if (type === 'hidden_shrine' || type === 'mountain_shrine') {
        const stoneMat = new THREE.MeshStandardMaterial({color: 0x777777, roughness: 1.0});
        const platform = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 20), stoneMat);
        platform.position.y = 1;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p1.position.set(-8, 8.5, -8);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p2.position.set(8, 8.5, -8);
        const p3 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p3.position.set(-8, 8.5, 8);
        const p4 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p4.position.set(8, 8.5, 8);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(22, 2, 22), stoneMat);
        roof.position.y = 17;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16, 0, Math.PI*2, 0, Math.PI/2), stoneMat);
        dome.position.y = 18;
        group.add(platform, p1, p2, p3, p4, roof, dome);
    }
    else if (type === 'corruption') {
        const darkMat = new THREE.MeshStandardMaterial({color: 0x110000, emissive: 0x330000, roughness: 0.1, metalness: 0.8});
        const spike = new THREE.Mesh(new THREE.ConeGeometry(4, 20, 5), darkMat);
        spike.position.y = 10;
        const floatSpike1 = new THREE.Mesh(new THREE.ConeGeometry(2, 10, 4), darkMat);
        floatSpike1.position.set(6, 12, 0); floatSpike1.rotation.z = Math.PI/6;
        const floatSpike2 = new THREE.Mesh(new THREE.ConeGeometry(2, 10, 4), darkMat);
        floatSpike2.position.set(-6, 15, 4); floatSpike2.rotation.z = -Math.PI/6;
        group.add(spike, floatSpike1, floatSpike2);
    }
    
    }
    
    // Add a glowing interaction highlight marker above the object
    if (type !== 'shrine' && type !== 'hidden_shrine' && type !== 'prosperity_shrine') {
        const highlightGeo = new THREE.OctahedronGeometry(3.0); // Twice as large
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Solid bright yellow // Bright yellow wireframe
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.y = 20; // Float above
        highlight.name = "quest_highlight";
        group.add(highlight);
        
        // Add a gentle glow ring
        const ringGeo = new THREE.RingGeometry(3, 3.5, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1;
        ring.name = "quest_ring";
        group.add(ring);
    }
    
    // Cast shadows for all parts
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; } });
    scene.add(group);
    
    let obj = {
        id: id, type: type, x: x, z: z,
        mesh: group, visible: true, data: {}
    };
    interactables.push(obj);
    return obj;
}

function createTree(scene, x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 15), new THREE.MeshStandardMaterial({map: Textures.Wood, color: 0x664422, roughness: 0.9}));
    trunk.position.set(x, 7.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(10, 25, 8), new THREE.MeshStandardMaterial({color: 0x2d4c1e}));
    leaves.position.set(x, 25, z);
    leaves.castShadow = true;
    scene.add(leaves);
    
    walls.push({ minX: x - 3, maxX: x + 3, minZ: z - 3, maxZ: z + 3, isActive: true });
}

function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3a4a2a'; // dark grass
    ctx.fillRect(0,0,256,256);
    ctx.fillStyle = '#425232'; // slightly lighter grass
    ctx.fillRect(0,0,128,128);
    ctx.fillRect(128,128,128,128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(100, 100);
    return tex;
}

function createWorld(scene) {
    // Huge Open Floor
    const floorGeo = new THREE.PlaneGeometry(3000, 3000);
    const floorMat = new THREE.MeshStandardMaterial({ map: createGroundTexture(), roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // World Borders
    addWall(scene, 0, -1500, 3000, 50, 0x222222, 100);
    addWall(scene, 0, 1500, 3000, 50, 0x222222, 100);
    addWall(scene, 1500, 0, 50, 3000, 0x222222, 100);
    addWall(scene, -1500, 0, 50, 3000, 0x222222, 100);

    // ==========================================
    // CENTER HUB (0, 0)
    // ==========================================
    // ==========================================
    // MASSIVE SACRED SHRINE (FOR GANAPATI)
    // ==========================================
    // 1. Lower wide base
    const baseGeo1 = new THREE.CylinderGeometry(200, 200, 2, 64);
    const baseMat1 = new THREE.MeshStandardMaterial({color: 0x8B5A2B, roughness: 0.9}); // Warm sandstone
    const base1 = new THREE.Mesh(baseGeo1, baseMat1);
    base1.position.y = 1;
    base1.receiveShadow = true;
    scene.add(base1);
    
    // 2. Middle elevated tier
    const baseGeo2 = new THREE.CylinderGeometry(150, 150, 2, 64);
    const baseMat2 = new THREE.MeshStandardMaterial({color: 0xA0522D, roughness: 0.8});
    const base2 = new THREE.Mesh(baseGeo2, baseMat2);
    base2.position.y = 3;
    base2.receiveShadow = true;
    scene.add(base2);
    
    // 3. Central seating platform specifically for Ganapati
    const baseGeo3 = new THREE.CylinderGeometry(80, 80, 4, 32);
    const baseMat3 = new THREE.MeshStandardMaterial({color: 0xCD853F, roughness: 0.7});
    const base3 = new THREE.Mesh(baseGeo3, baseMat3);
    base3.position.y = 5;
    base3.receiveShadow = true;
    scene.add(base3);
    
    // 4. Rangoli / Decorative Carpet effect in front
    const carpetGeo = new THREE.CylinderGeometry(40, 40, 0.5, 32);
    const carpetMat = new THREE.MeshStandardMaterial({color: 0xFF4500, roughness: 1.0}); // Bright Orange/Red
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(0, 6, 60);
    carpet.receiveShadow = true;
    scene.add(carpet);
    
    // 5. Sacred Pillars forming a canopy perimeter
    for(let i=0; i<12; i++) {
        let angle = (i / 12) * Math.PI * 2;
        let px = Math.sin(angle) * 140;
        let pz = Math.cos(angle) * 140;
        addWall(scene, px, pz, 10, 10, 0xFFD700, 80); // Tall golden/stone pillars
        
        // Add a warm glowing diya at the base of each pillar
        
        // Decorative glowing lamp
        const diyaGroup = new THREE.Group();
        diyaGroup.position.set(px * 0.9, 4, pz * 0.9);
        const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 16), new THREE.MeshStandardMaterial({color: 0x555555}));
        const diyaFlame = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshStandardMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.5}));
        diyaFlame.position.y = 3;
        const diyaLight = new THREE.PointLight(0xffaa00, 1, 50);
        diyaLight.position.y = 5;
        diyaGroup.add(diyaBase, diyaFlame, diyaLight);
        scene.add(diyaGroup);

    }
    
    // Warm central lighting to make the shrine feel cozy
    const shrineLight = new THREE.PointLight(0xffaa55, 1.5, 300);
    shrineLight.position.set(0, 40, 0);
    scene.add(shrineLight);

    // Knowledge Shrine (Moved slightly further out so it doesn't clip Ganapati)
    createInteractable(scene, 'knowledge_shrine', 'shrine', 60, -60, 0x9932cc, 'box');


    // ==========================================
    // NORTH: ANCIENT GROVE (0, -400)
    // ==========================================
    for(let i=0; i<60; i++) {
        let tx = (Math.random() - 0.5) * 600;
        let tz = -200 - Math.random() * 500;
        if (Math.abs(tx) < 40 && tz > -300) continue; // Keep main path clear
        createTree(scene, tx, tz);
    }
    
    // Grove Puzzle (Wisdom)
    // Spread symbols far apart
    createInteractable(scene, 'sym1', 'symbol', -150, -250, 0x4444ff, 'box');
    createInteractable(scene, 'sym2', 'symbol', 200, -350, 0x4444ff, 'box');
    createInteractable(scene, 'sym3', 'symbol', -50, -550, 0x4444ff, 'box');
    
    let b1 = createInteractable(scene, 'blessing_wisdom', 'blessing', 0, -400, 0x00ff00, 'octahedron');
    b1.mesh.visible = false; b1.visible = false;

    // ==========================================
    // EAST: FESTIVAL CITY (400, 0)
    // ==========================================
    // Scattered buildings
    for(let i=0; i<30; i++) {
        let bx = 200 + Math.random() * 500;
        let bz = (Math.random() - 0.5) * 500;
        let safe = true;
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 30 + Math.random()*20, 30 + Math.random()*20, 0xaa6644, 20 + Math.random()*30);
    }
    
    // City Puzzle (Prosperity)
    // 5 scattered offerings
    createInteractable(scene, 'offering0', 'offering', 350, -150, 0xffffff, 'sphere');
    createInteractable(scene, 'offering1', 'offering', 500, 50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering2', 'offering', 400, 200, 0xffffff, 'sphere');
    createInteractable(scene, 'offering3', 'offering', 650, -50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering4', 'offering', 250, 100, 0xffffff, 'sphere');
    
    // The Prosperity Shrine (Drop-off point)
    createInteractable(scene, 'prosperity_shrine', 'prosperity_shrine', 550, 0, 0xaa6644, 'box');
    
    let b2 = createInteractable(scene, 'blessing_prosperity', 'blessing', 550, -20, 0x00ff00, 'octahedron');
    b2.mesh.visible = false; b2.visible = false;

    // ==========================================
    // SOUTH: DESERT (0, 400)
    // ==========================================
    // Scattered ruins (Desert feel)
    for(let i=0; i<30; i++) {
        let bx = (Math.random() - 0.5) * 500;
        let bz = 200 + Math.random() * 500;
        let safe = true;
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 20 + Math.random()*20, 20 + Math.random()*20, 0xcc9966, 10 + Math.random()*15);
    }
    
    // Hidden Shrine
    createInteractable(scene, 'hidden_shrine', 'hidden_shrine', 0, 600, 0xddaa77, 'box');
    
    // Diyas (Unlit lamps)
    createInteractable(scene, 'diya1', 'diya', -150, 500, 0x555555, 'cylinder');
    createInteractable(scene, 'diya2', 'diya', 150, 550, 0x555555, 'cylinder');
    createInteractable(scene, 'diya3', 'diya', 0, 450, 0x555555, 'cylinder');
    
    let b3 = createInteractable(scene, 'blessing_devotion', 'blessing', 0, 600, 0x00ff00, 'octahedron');
    b3.mesh.visible = false; b3.visible = false;

    // ==========================================
    // WEST: MOUNTAIN (COURAGE) (-400, 0)
    // ==========================================
    // Giant Mountain Walls forming a canyon
    addWall(scene, -400, -100, 600, 20, 0x444444, 80);
    addWall(scene, -400, 100, 600, 20, 0x444444, 80);
    
    // The Shrine at the end of the canyon
    createInteractable(scene, 'mountain_shrine', 'mountain_shrine', -800, 0, 0x666666, 'box');
    
    let b4 = createInteractable(scene, 'blessing_courage', 'blessing', -800, 0, 0x00ff00, 'octahedron');
    b4.mesh.visible = false; b4.visible = false;
}

function checkCollision(newX, newZ, radius) {
    for (let wall of walls) {
        if (!wall.isActive) continue;
        if (newX > wall.minX - radius && newX < wall.maxX + radius &&
            newZ > wall.minZ - radius && newZ < wall.maxZ + radius) {
            return true;
        }
    }
    return false;
}

function buildMountainBridge(scene) {
    // Remove gap wall, add bridge
    for (let i=0; i<walls.length; i++) {
        if (walls[i].minX === -50 && walls[i].maxZ === 325) { // The gap wall
            walls[i].isActive = false;
            walls[i].mesh.visible = false;
        }
    }
    addWall(scene, 0, 300, 100, 50, 0x8b4513, 2); // Wooden bridge
}
