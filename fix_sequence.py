import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_symbol = """    else if (obj.type === 'symbol') {
        if (gameState.stage !== 'NORTH_WISDOM') {
            showToast("The symbols are inactive right now.");
            return;
        }
        obj.visible = false; obj.mesh.visible = false;
        questData.symbolsHit = (questData.symbolsHit || 0) + 1;
        showToast("Symbol Activated! " + questData.symbolsHit + "/3");
        if (questData.symbolsHit >= 3) {
            showToast("An ancient mechanism clicks. The Wisdom Blessing appears!");
            let b1 = interactables.find(i => i.id === 'blessing_wisdom');
            if (b1) { b1.mesh.visible = true; b1.visible = true; }
            setObjective("Collect the Blessing of Wisdom.");
        }
    }"""

new_symbol = """    else if (obj.type === 'symbol') {
        if (gameState.stage !== 'NORTH_WISDOM') {
            showToast("The ancient symbols are dormant.");
            return;
        }
        
        // Sequence puzzle
        if (!questData.symbolSequence) questData.symbolSequence = [];
        
        if (obj.id === 'sym1' && questData.symbolSequence.length === 0) {
            questData.symbolSequence.push('sym1');
            obj.visible = false; obj.mesh.visible = false;
            showToast("Symbol 1 of 3 Activated.");
        } else if (obj.id === 'sym2' && questData.symbolSequence.length === 1) {
            questData.symbolSequence.push('sym2');
            obj.visible = false; obj.mesh.visible = false;
            showToast("Symbol 2 of 3 Activated.");
        } else if (obj.id === 'sym3' && questData.symbolSequence.length === 2) {
            questData.symbolSequence.push('sym3');
            obj.visible = false; obj.mesh.visible = false;
            showToast("The Ancient Gate hums with power... The Wisdom Blessing appears!");
            let b1 = interactables.find(i => i.id === 'blessing_wisdom');
            if (b1) { b1.mesh.visible = true; b1.visible = true; }
            setObjective("Collect the Blessing of Wisdom.");
        } else {
            // Wrong sequence
            showToast("Incorrect Sequence! The symbols reset.");
            questData.symbolSequence = [];
            let s1 = interactables.find(i => i.id === 'sym1'); if(s1) { s1.visible = true; s1.mesh.visible = true; }
            let s2 = interactables.find(i => i.id === 'sym2'); if(s2) { s2.visible = true; s2.mesh.visible = true; }
            let s3 = interactables.find(i => i.id === 'sym3'); if(s3) { s3.visible = true; s3.mesh.visible = true; }
        }
    }"""

if old_symbol in code:
    code = code.replace(old_symbol, new_symbol)
    with open('src/main.js', 'w') as f:
        f.write(code)
else:
    print("Could not find symbol block")
