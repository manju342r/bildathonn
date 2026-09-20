const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

// Replace standard item collection
const removeStr = `obj.visible = false; obj.mesh.visible = false;
        scene.remove(obj.mesh);
        let idx = interactables.indexOf(obj);
        if (idx > -1) interactables.splice(idx, 1);`;

content = content.replace("obj.visible = false; obj.mesh.visible = false;\n        questData.symbolsHit", removeStr + "\n        questData.symbolsHit");
content = content.replace("obj.visible = false; obj.mesh.visible = false;\n        questData.offeringsFound", removeStr + "\n        questData.offeringsFound");
content = content.replace("obj.visible = false; obj.mesh.visible = false;\n        gameState.blessings++;", removeStr + "\n        gameState.blessings++;");
content = content.replace("obj.visible = false; obj.mesh.visible = false;\n        questData.corruptionsCleared", removeStr + "\n        questData.corruptionsCleared");

// Handle Diya lighting specifically
const oldDiya = `obj.visible = false; obj.mesh.visible = false; // "Lit" visually later if we had material change`;
const newDiya = `// Don't remove the Diya, just light it!
        let flame = obj.mesh.getObjectByName("diya_flame");
        let light = obj.mesh.getObjectByName("diya_light");
        if (flame) flame.visible = true;
        if (light) light.visible = true;
        obj.interacted = true;`;

content = content.replace(oldDiya, newDiya);

// In checkInteraction, skip interacted diyas
content = content.replace("if (!obj.visible) continue;", "if (!obj.visible || obj.interacted) continue;");

fs.writeFileSync('src/main.js', content);
