const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// 1. Fix the scale overrides in initGame() and apply localStorage
const oldInit = `    // Characters
    player = createMooshak();
    player.scale.set(1.5, 1.5, 1.5);
    scene.add(player);
    ganesha = createGanesha();
    ganesha.scale.set(1.5, 1.5, 1.5);
    scene.add(ganesha);`;

const newInit = `    // Characters
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
    scene.add(ganesha);`;

code = code.replace(oldInit, newInit);

// 2. Add localStorage saving to the keydown listener
const oldKeys = `    // Live Scale Tuning for Ganesha (Press + or -)
    if (e.key === '=' || e.key === '+') {
        if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
            modelCache['ganesha'].scale.multiplyScalar(1.2);
        }
    }
    if (e.key === '-' || e.key === '_') {
        if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
            modelCache['ganesha'].scale.multiplyScalar(0.8);
        }
    }
    
    // Live Scale Tuning for Mooshak (Press ] or [)
    if (e.key === ']') {
        player.scale.multiplyScalar(1.2);
    }
    if (e.key === '[') {
        player.scale.multiplyScalar(0.8);
    }`;

const newKeys = `    // Live Scale Tuning for Ganesha (Press + or -)
    if (e.key === '=' || e.key === '+') {
        if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
            modelCache['ganesha'].scale.multiplyScalar(1.2);
            localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x);
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
        localStorage.setItem('mooshakScale', player.scale.x);
    }
    if (e.key === '[') {
        player.scale.multiplyScalar(0.8);
        localStorage.setItem('mooshakScale', player.scale.x);
    }`;

code = code.replace(oldKeys, newKeys);

fs.writeFileSync('src/main.js', code);
