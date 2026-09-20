const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const oldBlessing = `        gameState.blessings++;
        
        if (gameState.blessings === 1) {
            showToast("You acquired the first blessing! Find the rest.");`;
            
const newBlessing = `        gameState.blessings++;
        
        // Trigger cinematic taunt
        triggerBanasuraTaunt(gameState.blessings);
        
        if (gameState.blessings === 1) {
            showToast("You acquired the first blessing! Find the rest.");`;

code = code.replace(oldBlessing, newBlessing);
fs.writeFileSync('src/main.js', code);
