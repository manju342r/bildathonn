// Global world arrays
const walls = [];
const interactables = [];
const hazards = [];
const platforms = [];
let gateVighna = null;

function addPlatform(scene, x, y, z, w, d, color = 0x88aa44) {
    const geo = new THREE.BoxGeometry(w, 5, d);
    const mat = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y - 2.5, z); // Top of the platform is exactly at 'y'
    scene.add(mesh);
    platforms.push({ x, y, z, width: w, depth: d });
    return mesh;
}

function addWall(scene, x, z, w, d, color = 0x5c3a21, h = 20) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshToonMaterial({ color: color, map: Textures.Stone, roughness: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    let wallObj = {
        minX: x - w/2, maxX: x + w/2,
        minZ: z - d/2, maxZ: z + d/2,
        height: h,
        mesh: mesh,
        isActive: true
    };
    walls.push(wallObj);
    return wallObj;
}



function createDesertHazard(scene, type, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    
    if (type === 'cactus') {
        const mat = new THREE.MeshToonMaterial({ color: 0x2e8b57 });
        
        // Saguaro Base
        const geo = new THREE.CylinderGeometry(3, 4, 25, 8);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 12.5;
        group.add(mesh);
        
        // Arm 1
        const arm1Geo = new THREE.CylinderGeometry(2, 2, 12, 8);
        const arm1 = new THREE.Mesh(arm1Geo, mat);
        arm1.position.set(4, 15, 0);
        arm1.rotation.z = Math.PI / 4;
        const arm1Up = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 8, 8), mat);
        arm1Up.position.set(8, 18, 0);
        group.add(arm1, arm1Up);
        
        // Arm 2
        const arm2 = new THREE.Mesh(arm1Geo, mat);
        arm2.position.set(-4, 10, 0);
        arm2.rotation.z = -Math.PI / 4;
        const arm2Up = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 6, 8), mat);
        arm2Up.position.set(-8, 12, 0);
        group.add(arm2, arm2Up);
        
        // Add needles
        const needleMat = new THREE.MeshBasicMaterial({color: 0xddccaa});
        const needleGeo = new THREE.ConeGeometry(0.2, 2, 4);
        for (let i=0; i<20; i++) {
            const needle = new THREE.Mesh(needleGeo, needleMat);
            needle.position.set((Math.random()-0.5)*8, Math.random()*20, (Math.random()-0.5)*8);
            needle.lookAt(new THREE.Vector3(x, 10, z)); // point outwards roughly
            group.add(needle);
        }
        
        scene.add(group);
        hazards.push({ mesh: group, type: 'cactus', x: x, z: z, radius: 8 });
        
    } else if (type === 'thorn') {
        const mat = new THREE.MeshToonMaterial({ color: 0x5c4033 });
        // Thorn Patch (Twisted Vines)
        for (let i=0; i<5; i++) {
            const geo = new THREE.ConeGeometry(2, 15, 5);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((Math.random()-0.5)*8, 5, (Math.random()-0.5)*8);
            mesh.rotation.x = (Math.random()-0.5)*Math.PI/2;
            mesh.rotation.z = (Math.random()-0.5)*Math.PI/2;
            group.add(mesh);
        }
        group.name = 'thornPatch';
        scene.add(group);
        hazards.push({ mesh: group, type: 'thorn', x: x, z: z, radius: 10 });
        
    } else if (type === 'thorn_pit') {
        // A visual hole using dark color
        const holeGeo = new THREE.CircleGeometry(15, 16);
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x110500 });
        const holeMesh = new THREE.Mesh(holeGeo, holeMat);
        holeMesh.rotation.x = -Math.PI / 2;
        holeMesh.position.y = 0.1;
        group.add(holeMesh);
        
        // Thorns inside (pointing up, ready to snap)
        const mat = new THREE.MeshToonMaterial({ color: 0x4a2e15 });
        const geo = new THREE.ConeGeometry(3, 12, 4);
        for(let i=0; i<15; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((Math.random()-0.5)*18, -3, (Math.random()-0.5)*18); // hidden slightly
            mesh.rotation.x = (Math.random()-0.5)*0.5;
            mesh.name = 'pitSpike';
            group.add(mesh);
        }
        
        scene.add(group);
        hazards.push({ mesh: group, type: 'thorn_pit', x: x, z: z, radius: 14 });
    }
}

function createInteractable(scene, id, type, x, z, color, geoType, y = 0) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
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
        const stone = new THREE.MeshToonMaterial({map: Textures.Stone, roughness: 0.9, color: 0xaaaaaa});
        const base = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), stone);
        base.position.y = 1;
        const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 10, 4), new THREE.MeshToonMaterial({color: 0xcc4400}));
        roof.position.y = 14;
        roof.rotation.y = Math.PI/4;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p1.position.set(-6, 7, -6);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p2.position.set(6, 7, -6);
        const p3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p3.position.set(-6, 7, 6);
        const p4 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10), stone); p4.position.set(6, 7, 6);
        group.add(base, p1, p2, p3, p4, roof);
    } 
    else if (type === 'flag') {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 25), new THREE.MeshToonMaterial({map: Textures.Wood, color: 0x664422, roughness: 0.9}));
        pole.position.y = 12.5;
        const cloth = new THREE.Mesh(new THREE.ConeGeometry(4, 10, 3), new THREE.MeshToonMaterial({color: color, map: Textures.Cloth, roughness: 0.9}));
        cloth.rotation.z = -Math.PI / 2;
        cloth.position.set(5, 20, 0);
        group.add(pole, cloth);
    }
    else if (type === 'offering') {
        // Modak (Traditional Sweet) Shape
        const mat = new THREE.MeshToonMaterial({color: 0xfff0cc, roughness: 0.4});
        const body = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), mat);
        body.scale.set(1, 0.8, 1);
        body.position.y = 2.4;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4, 16), mat);
        tip.position.y = 4.5;
        group.add(body, tip);
    }
    else if (type === 'bridge_part') {
        if (id === 'part_rope') {
            const rope = new THREE.Mesh(new THREE.TorusGeometry(3, 1, 8, 16), new THREE.MeshToonMaterial({map: Textures.Wood, color: 0x8b4513, roughness: 0.9}));
            rope.rotation.x = Math.PI/2; rope.position.y = 1;
            group.add(rope);
        } else if (id === 'part_plank') {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 4), new THREE.MeshToonMaterial({map: Textures.Wood, color: 0x5c3a21, roughness: 0.9}));
            plank.position.y = 0.5;
            group.add(plank);
        } else if (id === 'part_emblem') {
            const emblem = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1, 16), new THREE.MeshToonMaterial({map: Textures.Gold, metalness: 0.9, roughness: 0.1, color: 0xffdd00}));
            emblem.rotation.x = Math.PI/2; emblem.position.y = 3;
            group.add(emblem);
        }
    }
    else if (type === 'symbol') {
        // Ancient Obelisk with glowing orb
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 10, 4), new THREE.MeshToonMaterial({map: Textures.Stone, color: 0x555555, roughness: 1.0}));
        base.position.y = 5;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(2), new THREE.MeshToonMaterial({color: color, emissive: color, emissiveIntensity: 0.8}));
        orb.position.y = 12.5;
        group.add(base, orb);
    }
    else if (type === 'blessing') {
        // Sacred glowing crystal with orbiting rings
        const mat = new THREE.MeshToonMaterial({color: color, emissive: color, emissiveIntensity: 0.5});
        const modakGeo = new THREE.ConeGeometry(3, 6, 16, 1, false, 0, Math.PI * 2);
        const modakBase = new THREE.SphereGeometry(3, 16, 16, 0, Math.PI * 2, Math.PI/2, Math.PI/2);
        
        const top = new THREE.Mesh(modakGeo, mat);
        top.position.y = 3;
        const bottom = new THREE.Mesh(modakBase, mat);
        
        const auraMat = new THREE.MeshBasicMaterial({color: color, transparent: true, opacity: 0.3, side: THREE.DoubleSide});
        const aura = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), auraMat);
        aura.position.y = 1.5;
        
        const innerGroup = new THREE.Group();
        innerGroup.add(top, bottom, aura);
        innerGroup.position.y = 10;
        group.add(innerGroup);
    }
    else if (type === 'prosperity_shrine') {
        const mat = new THREE.MeshToonMaterial({color: 0xaa6644, roughness: 0.8});
        const table = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 4, 8), mat);
        table.position.y = 2;
        const cloth = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 1, 8), new THREE.MeshToonMaterial({color: 0xff4400}));
        cloth.position.y = 4.2;
        group.add(table, cloth);
    }
    else if (type === 'diya') {
        const clayMat = new THREE.MeshToonMaterial({color: 0x8b4513, roughness: 0.9});
        const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 2, 1, 16), clayMat);
        base.position.y = 0.5;
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16, 0, Math.PI*2, 0, Math.PI/2), clayMat);
        bowl.rotation.x = Math.PI; // Flip half-sphere upside down to make a bowl
        bowl.position.y = 1.5;
        const flame = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), new THREE.MeshToonMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2}));
        flame.name = "diya_flame";
        flame.visible = false;
        flame.position.y = 2.5;
        const diyaLight = new THREE.PointLight(0xffaa00, 1, 30);
        diyaLight.name = "diya_light";
        diyaLight.visible = false;
        diyaLight.position.y = 3;
        group.add(base, bowl, flame, diyaLight);
    }
    else if (type === 'hidden_shrine' || type === 'mountain_shrine') {
        const stoneMat = new THREE.MeshToonMaterial({color: 0x777777, roughness: 1.0});
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
        const darkMat = new THREE.MeshToonMaterial({color: 0x110000, emissive: 0x330000, roughness: 0.1, metalness: 0.8});
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
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 15), new THREE.MeshToonMaterial({map: Textures.Wood, color: 0x664422, roughness: 0.9}));
    trunk.position.set(x, 7.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(10, 25, 8), new THREE.MeshToonMaterial({color: 0x2d4c1e}));
    leaves.position.set(x, 25, z);
    leaves.castShadow = true;
    scene.add(leaves);
    
    walls.push({ minX: x - 3, maxX: x + 3, minZ: z - 3, maxZ: z + 3, isActive: true });
}


function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base grass color
    ctx.fillStyle = '#3a5a2a'; 
    ctx.fillRect(0,0,256,256);
    
    // Add soft painterly/stylized noise patches instead of checkerboard
    for(let i=0; i<300; i++) {
        let x = Math.random() * 256;
        let y = Math.random() * 256;
        let r = Math.random() * 15 + 5;
        
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 100, 40, 0.2)' : 'rgba(50, 75, 30, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        
        // Wrap around for seamless texture
        ctx.beginPath();
        ctx.arc(x > 128 ? x - 256 : x + 256, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y > 128 ? y - 256 : y + 256, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50); // Scale it nicely across the 3000x3000 floor
    return tex;
}


function createWorld(scene) {
    // Huge Open Floor
    const floorGeo = new THREE.PlaneGeometry(3000, 3000);
    const floorMat = new THREE.MeshToonMaterial({ map: createGroundTexture(), roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // North Desert Floor Overlay
    const sandCanvas = document.createElement('canvas');
    sandCanvas.width = 256; sandCanvas.height = 256;
    const sandCtx = sandCanvas.getContext('2d');
    sandCtx.fillStyle = '#e8c396'; // Sand base
    sandCtx.fillRect(0,0,256,256);
    for(let i=0; i<300; i++) {
        let x = Math.random() * 256; let y = Math.random() * 256; let r = Math.random() * 15 + 5;
        sandCtx.fillStyle = Math.random() > 0.5 ? 'rgba(210, 180, 140, 0.4)' : 'rgba(230, 200, 150, 0.4)';
        sandCtx.beginPath(); sandCtx.arc(x, y, r, 0, Math.PI * 2); sandCtx.fill();
        sandCtx.beginPath(); sandCtx.arc(x > 128 ? x - 256 : x + 256, y, r, 0, Math.PI * 2); sandCtx.fill();
        sandCtx.beginPath(); sandCtx.arc(x, y > 128 ? y - 256 : y + 256, r, 0, Math.PI * 2); sandCtx.fill();
    }
    const sandTex = new THREE.CanvasTexture(sandCanvas);
    sandTex.wrapS = THREE.RepeatWrapping; sandTex.wrapT = THREE.RepeatWrapping; sandTex.repeat.set(20, 15);
    const desertFloorGeo = new THREE.PlaneGeometry(1000, 750);
    const desertFloorMat = new THREE.MeshToonMaterial({ map: sandTex, roughness: 1.0 });
    const desertFloor = new THREE.Mesh(desertFloorGeo, desertFloorMat);
    desertFloor.rotation.x = -Math.PI / 2;
    desertFloor.position.set(0, 0.1, -500); // Overlay on North area
    desertFloor.receiveShadow = true;
    scene.add(desertFloor);
    
    // Some scattered rocks along the border to hide the seam (z = -125)
    for(let i=0; i<40; i++) {
        let rx = (Math.random() - 0.5) * 1000;
        let rGeo = new THREE.DodecahedronGeometry(2 + Math.random()*4);
        let rMat = new THREE.MeshToonMaterial({color: 0x887766});
        let rock = new THREE.Mesh(rGeo, rMat);
        rock.position.set(rx, 1, -125 + (Math.random()-0.5)*20);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(rock);
    }

    
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
    const baseMat1 = new THREE.MeshToonMaterial({color: 0x8B5A2B, roughness: 0.9}); // Warm sandstone
    const base1 = new THREE.Mesh(baseGeo1, baseMat1);
    base1.position.y = 1;
    base1.receiveShadow = true;
    scene.add(base1);
    
    // 2. Middle elevated tier
    const baseGeo2 = new THREE.CylinderGeometry(150, 150, 2, 64);
    const baseMat2 = new THREE.MeshToonMaterial({color: 0xA0522D, roughness: 0.8});
    const base2 = new THREE.Mesh(baseGeo2, baseMat2);
    base2.position.y = 3;
    base2.receiveShadow = true;
    scene.add(base2);
    
    // 3. Central seating platform specifically for Ganapati
    const baseGeo3 = new THREE.CylinderGeometry(80, 80, 4, 32);
    const baseMat3 = new THREE.MeshToonMaterial({color: 0xCD853F, roughness: 0.7});
    const base3 = new THREE.Mesh(baseGeo3, baseMat3);
    base3.position.y = 5;
    base3.receiveShadow = true;
    scene.add(base3);
    
    // 4. Rangoli / Decorative Carpet effect in front
    const carpetGeo = new THREE.CylinderGeometry(40, 40, 0.5, 32);
    const carpetMat = new THREE.MeshToonMaterial({color: 0xFF4500, roughness: 1.0}); // Bright Orange/Red
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
        const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 16), new THREE.MeshToonMaterial({color: 0x555555}));
        const diyaFlame = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshToonMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.5}));
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

    // Knowledge Shrine (Raised to sit on top of the middle platform tier)
    const knowledgeShrineObj = createInteractable(scene, 'knowledge_shrine', 'shrine', 60, -60, 0x9932cc, 'box');
    knowledgeShrineObj.mesh.position.y = 4;


    
    // ==========================================
    // NORTH: DESERT RUINS (0, -400)
    // ==========================================
    // Scattered ruins (Desert feel)
    for(let i=0; i<30; i++) {
        let bx = (Math.random() - 0.5) * 800;
        let bz = -150 - Math.random() * 600;
        let safe = true;
        if (Math.abs(bx) < 60 && bz > -350) safe = false; // Keep main path clear
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 20 + Math.random()*20, 20 + Math.random()*20, 0xcc9966, 10 + Math.random()*15);
    }
    
    // Hidden Shrine in North
    createInteractable(scene, 'hidden_shrine', 'hidden_shrine', 0, -600, 0xddaa77, 'box');
    
    // Diyas (Unlit lamps) scattered in North
    createInteractable(scene, 'diya1', 'diya', -150, -500, 0x555555, 'cylinder');
    createInteractable(scene, 'diya2', 'diya', 150, -550, 0x555555, 'cylinder');
    createInteractable(scene, 'diya3', 'diya', 0, -450, 0x555555, 'cylinder');
    
    let b3 = createInteractable(scene, 'blessing_devotion', 'blessing', 0, -560, 0x00ff00, 'octahedron');
    b3.mesh.visible = false; b3.visible = false;

    // Desert Hazards (Cacti, Thorns, Pits)
    for(let i=0; i<8; i++) {
        createDesertHazard(scene, 'cactus', (Math.random()-0.5)*400, -250 - Math.random()*300);
        createDesertHazard(scene, 'thorn', (Math.random()-0.5)*300, -250 - Math.random()*300);
        createDesertHazard(scene, 'thorn_pit', (Math.random()-0.5)*300, -250 - Math.random()*300);
    }

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
    
    // City Puzzle (Prosperity) - PARKOUR CHALLENGE
    addPlatform(scene, 250, 15, 0, 40, 40);
    addPlatform(scene, 320, 25, 0, 40, 40);
    addPlatform(scene, 320, 35, -70, 40, 40);
    addPlatform(scene, 390, 45, -70, 40, 40);
    addPlatform(scene, 460, 55, -70, 40, 40);
    addPlatform(scene, 460, 65, 0, 40, 40);
    addPlatform(scene, 550, 75, 0, 50, 50); // Final Platform
    
    // 5 Collectible offerings on the platforms
    createInteractable(scene, 'offering0', 'offering', 320, 0, 0xffffff, 'sphere', 28);
    createInteractable(scene, 'offering1', 'offering', 320, -70, 0xffffff, 'sphere', 38);
    createInteractable(scene, 'offering2', 'offering', 390, -70, 0xffffff, 'sphere', 48);
    createInteractable(scene, 'offering3', 'offering', 460, -70, 0xffffff, 'sphere', 58);
    createInteractable(scene, 'offering4', 'offering', 460, 0, 0xffffff, 'sphere', 68);
    
    // Traps on platforms (Removed because they covered the whole platform causing instant death)
    // createInteractable(scene, 'trap_p1', 'corruption_trap', 320, 0, 0xff0000, 'box', 25);
    // createInteractable(scene, 'trap_p2', 'corruption_trap', 390, -70, 0xff0000, 'box', 45);
    
    let b2 = createInteractable(scene, 'blessing_prosperity', 'blessing', 550, 0, 0x00ff00, 'octahedron', 85);
    b2.mesh.visible = false; b2.visible = false;

    
    // ==========================================
    // SOUTH: ANCIENT GROVE (0, 400)
    // ==========================================
    for(let i=0; i<60; i++) {
        let tx = (Math.random() - 0.5) * 600;
        let tz = 200 + Math.random() * 500;
        if (Math.abs(tx) < 40 && tz < 300) continue; // Keep main path clear
        createTree(scene, tx, tz);
    }
    
    // Grove Puzzle (Wisdom)
    // Spread symbols far apart
    createInteractable(scene, 'sym1', 'symbol', -150, 250, 0x4444ff, 'box');
    createInteractable(scene, 'sym2', 'symbol', 200, 350, 0x4444ff, 'box');
    createInteractable(scene, 'sym3', 'symbol', -50, 550, 0x4444ff, 'box');
    
    let b1 = createInteractable(scene, 'blessing_wisdom', 'blessing', 0, 400, 0x00ff00, 'octahedron');
    b1.mesh.visible = false; b1.visible = false;


    // --- CORRUPTION TRAPS ---
    // East traps
    createInteractable(scene, 'trap_e1', 'corruption_trap', 300, 50, 0xff0000, 'box');
    createInteractable(scene, 'trap_e2', 'corruption_trap', 450, -100, 0xff0000, 'box');
    createInteractable(scene, 'trap_e3', 'corruption_trap', 550, 150, 0xff0000, 'box');
    // South traps (Fast circular sweeping traps moved to Ancient Grove)
    createInteractable(scene, 'trap_s1', 'corruption_trap', -80, 350, 0xff0000, 'box');
    createInteractable(scene, 'trap_s2', 'corruption_trap', 120, 450, 0xff0000, 'box');
    createInteractable(scene, 'trap_s3', 'corruption_trap', 0, 520, 0xff0000, 'box');

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
    let py = (typeof player !== 'undefined') ? player.position.y : 0;
    for (let wall of walls) {
        if (!wall.isActive) continue;
        if (wall.height && py >= wall.height - 2) continue; // Player is standing on or above the wall
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
