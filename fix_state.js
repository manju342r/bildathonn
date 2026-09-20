const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// 1. Add gameState stage and objective tracking
code = code.replace("let gameState = { health: 3, keys: 0, blessings: 0 };", 
"let gameState = { health: 3, keys: 0, blessings: 0, stage: 'START' };\n" + 
"function setObjective(text) { const el = document.getElementById('val-objective'); if(el) el.innerText = text; }");

// 2. We need an interaction for Ganesha to start the quest
// Let's add a global reference to ganesha interaction. Ganesha is at (10, 0, 0), player spawns at (0, 0, 0).
// In main.js, I'll add an interaction check specifically for Ganesha.
const checkIntOld = `function checkInteraction() {
    const pX = player.position.x;
    const pZ = player.position.z;
    for (let obj of interactables) {
        if (!obj.visible) continue;
        let dist = Math.sqrt(Math.pow(pX - obj.x, 2) + Math.pow(pZ - obj.z, 2));
        if (dist < 25) { handleObjInteraction(obj); break; }
    }
}`;

const checkIntNew = `function checkInteraction() {
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
        showToast("Ganapati: Mooshak, the Ananta Jyoti is shattered!");
        setTimeout(() => showToast("Vighna has scattered the 4 blessings."), 3000);
        setTimeout(() => {
            showToast("Find them. Start by heading NORTH to the Ancient Grove.");
            gameState.stage = 'NORTH_WISDOM';
            setObjective("Find the three Stone Symbols in the North.");
        }, 6000);
    } else if (gameState.stage === 'RETURN_CENTER') {
        startFinalVighnaEvent();
    } else {
        showToast("Ganapati: Restore the Ananta Jyoti, my friend.");
    }
}
`;
code = code.replace(checkIntOld, checkIntNew);

fs.writeFileSync('src/main.js', code);
