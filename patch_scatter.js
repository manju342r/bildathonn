const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

// 1. Scatter the Diyas wildly
code = code.replace("createInteractable(scene, 'diya1', 'diya', -150, -500, 0x555555, 'cylinder');", "createInteractable(scene, 'diya1', 'diya', -350, -350, 0x555555, 'cylinder');");
code = code.replace("createInteractable(scene, 'diya2', 'diya', 150, -550, 0x555555, 'cylinder');", "createInteractable(scene, 'diya2', 'diya', 380, -650, 0x555555, 'cylinder');");
code = code.replace("createInteractable(scene, 'diya3', 'diya', 0, -450, 0x555555, 'cylinder');", "createInteractable(scene, 'diya3', 'diya', -250, -800, 0x555555, 'cylinder');");

// 2. Increase and spread Desert Hazards
// Replace the old hazard loop with a new massive one
const oldHazards = `for(let i=0; i<15; i++) {
        createDesertHazard(scene, 'cactus', (Math.random()-0.5)*400, -250 - Math.random()*300);
        createDesertHazard(scene, 'thorn', (Math.random()-0.5)*300, -250 - Math.random()*300);
        createDesertHazard(scene, 'thorn_pit', (Math.random()-0.5)*300, -250 - Math.random()*300);
    }`;

const newHazards = `for(let i=0; i<40; i++) {
        createDesertHazard(scene, 'cactus', (Math.random()-0.5)*900, -150 - Math.random()*700);
        createDesertHazard(scene, 'thorn', (Math.random()-0.5)*850, -150 - Math.random()*700);
        createDesertHazard(scene, 'thorn_pit', (Math.random()-0.5)*850, -150 - Math.random()*700);
    }
    
    // Add "health eliminating lights" (Sweeping Corruption Traps) to the North
    createInteractable(scene, 'trap_n1', 'corruption_trap', 0, -200, 0xff0000, 'box');
    createInteractable(scene, 'trap_n2', 'corruption_trap', -200, -380, 0xff0000, 'box');
    createInteractable(scene, 'trap_n3', 'corruption_trap', 250, -480, 0xff0000, 'box');
    createInteractable(scene, 'trap_n4', 'corruption_trap', -100, -680, 0xff0000, 'box');
    createInteractable(scene, 'trap_n5', 'corruption_trap', 150, -780, 0xff0000, 'box');
    `;

code = code.replace(oldHazards, newHazards);

fs.writeFileSync('src/world.js', code);
