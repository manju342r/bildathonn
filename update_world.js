const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

// 1. Central Shrine Redesign
// Colors: Warm sandstone, ivory, gold, copper
code = code.replace("0xaa8855", "0xd4a373"); // Sandstone floor base
code = code.replace("0xFFD700", "0xfaedcd"); // Ivory Pillars instead of flat gold
code = code.replace("0x555555", "0xb87333"); // Copper Diya base at pillars instead of grey

// 2. North Desert fixes
// Remove the corruption traps I added earlier
const trapNToRemove = `    // Add "health eliminating lights" (Sweeping Corruption Traps) to the North
    createInteractable(scene, 'trap_n1', 'corruption_trap', 0, -200, 0xff0000, 'box');
    createInteractable(scene, 'trap_n2', 'corruption_trap', -200, -380, 0xff0000, 'box');
    createInteractable(scene, 'trap_n3', 'corruption_trap', 250, -480, 0xff0000, 'box');
    createInteractable(scene, 'trap_n4', 'corruption_trap', -100, -680, 0xff0000, 'box');
    createInteractable(scene, 'trap_n5', 'corruption_trap', 150, -780, 0xff0000, 'box');`;
code = code.replace(trapNToRemove, "");

// 3. South Grove traps
// Change trap_s to circular sweeping logic in main.js later, but here we just rename/reposition them
const oldSouthTraps = `    // South traps (Fast circular sweeping traps moved to Ancient Grove)
    createInteractable(scene, 'trap_s1', 'corruption_trap', -80, 350, 0xff0000, 'box');
    createInteractable(scene, 'trap_s2', 'corruption_trap', 120, 450, 0xff0000, 'box');
    createInteractable(scene, 'trap_s3', 'corruption_trap', 0, 520, 0xff0000, 'box');`;
const newSouthTraps = `    // South traps - Fast circular sweeping traps
    createInteractable(scene, 'trap_s_circle1', 'corruption_trap', -100, 300, 0xff0000, 'box');
    createInteractable(scene, 'trap_s_circle2', 'corruption_trap', 150, 400, 0xff0000, 'box');
    createInteractable(scene, 'trap_s_circle3', 'corruption_trap', 0, 500, 0xff0000, 'box');`;
code = code.replace(oldSouthTraps, newSouthTraps);

// 4. West Mountain redesign
const oldWest = `// ==========================================
    // WEST: MOUNTAIN (COURAGE) (-400, 0)
    // ==========================================
    // Giant Mountain Walls forming a canyon
    addWall(scene, -400, -100, 600, 20, 0x444444, 80);
    addWall(scene, -400, 100, 600, 20, 0x444444, 80);
    
    // The Shrine at the end of the canyon
    createInteractable(scene, 'mountain_shrine', 'mountain_shrine', -800, 0, 0x666666, 'box');
    
    let b4 = createInteractable(scene, 'blessing_courage', 'blessing', -800, 0, 0x00ff00, 'octahedron');
    b4.mesh.visible = false; b4.visible = false;`;

const newWest = `// ==========================================
    // WEST: MOUNTAIN (COURAGE) (-400, 0)
    // ==========================================
    // Giant Mountain Walls forming a canyon
    addWall(scene, -400, -100, 600, 20, 0x5c5346, 80);
    addWall(scene, -400, 100, 600, 20, 0x5c5346, 80);
    
    // Massive Explorable Summit behind the canyon
    // A huge ramp leading up
    addPlatform(scene, -850, 15, 0, 100, 200);
    addPlatform(scene, -950, 35, 0, 100, 200);
    addPlatform(scene, -1150, 55, 0, 300, 300); // The main summit area
    
    // The Shrine at the summit
    let mountainShrine = createInteractable(scene, 'mountain_shrine', 'mountain_shrine', -1150, 0, 0x666666, 'box');
    mountainShrine.mesh.position.y = 55; // Sit on the summit

    let b4 = createInteractable(scene, 'blessing_courage', 'blessing', -1100, 0, 0x00ff00, 'octahedron', 65);
    b4.mesh.visible = false; b4.visible = false;
    
    // Banasura Placeholder / The antagonist standing at the top causing the rock slide
    let banasuraBase = addWall(scene, -1250, 0, 40, 40, 0x221111, 20);
    banasuraBase.position.y = 55; // Placeholder base for Banasura's actual model
    
    // The Sacred Diya - the final required object
    let sacredDiya = createInteractable(scene, 'sacred_diya', 'sacred_diya', -1200, 0, 0xffd700, 'cylinder');
    sacredDiya.mesh.position.y = 60; 
    sacredDiya.mesh.scale.set(1.5, 1.5, 1.5);
    // Add a majestic golden light to it
    const sacredLight = new THREE.PointLight(0xffdd44, 2.5, 100);
    sacredLight.position.y = 5;
    sacredDiya.mesh.add(sacredLight);
    `;
    
code = code.replace(oldWest, newWest);

fs.writeFileSync('src/world.js', code);
