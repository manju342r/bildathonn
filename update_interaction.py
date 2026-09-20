import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_logic = re.search(r'function handleObjInteraction\(obj\) \{.*?\n\}\n\n// Quiz', code, re.DOTALL)

if not old_logic:
    print("Could not find handleObjInteraction")
    exit(1)

new_logic = """function handleObjInteraction(obj) {
    if (obj.type === 'shrine') {
        isPaused = true;
        uiHud.classList.remove('active');
        uiQuiz.classList.add('active');
        document.getElementById('quiz-story').innerText = QUIZ_DATA.intro;
        document.getElementById('quiz-result').style.display = 'none';
        document.getElementById('quiz-start-buttons').style.display = 'block';
        document.getElementById('quiz-question-container').style.display = 'none';
    } 
    else if (obj.type === 'symbol') {
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
    }
    else if (obj.type === 'offering') {
        if (gameState.stage !== 'EAST_PROSPERITY') {
            showToast("A festive offering. (Not needed yet)");
            return;
        }
        obj.visible = false; obj.mesh.visible = false;
        questData.offeringsFound = (questData.offeringsFound || 0) + 1;
        showToast("Offering Collected! " + questData.offeringsFound + "/5");
        if (questData.offeringsFound >= 5) {
            showToast("All offerings collected! Return to the Prosperity Shrine.");
            setObjective("Return to the Prosperity Shrine.");
        }
    }
    else if (obj.type === 'prosperity_shrine') {
        if (questData.offeringsFound >= 5 && !questData.prosperitySpawned) {
            questData.prosperitySpawned = true;
            showToast("The Shrine accepts the offerings. The Blessing appears!");
            let b2 = interactables.find(i => i.id === 'blessing_prosperity');
            if (b2) { b2.mesh.visible = true; b2.visible = true; }
            setObjective("Collect the Blessing of Prosperity.");
        } else if (questData.offeringsFound < 5) {
            showToast("The Shrine requires 5 scattered offerings.");
        }
    }
    else if (obj.type === 'diya') {
        if (gameState.stage !== 'SOUTH_DEVOTION') {
            showToast("An unlit Diya.");
            return;
        }
        obj.visible = false; obj.mesh.visible = false; // "Lit" visually later if we had material change
        questData.diyasLit = (questData.diyasLit || 0) + 1;
        showToast("Sacred Diya Lit! " + questData.diyasLit + "/3");
        if (questData.diyasLit >= 3) {
            showToast("The Desert Shrine illuminates. The Blessing appears!");
            let b3 = interactables.find(i => i.id === 'blessing_devotion');
            if (b3) { b3.mesh.visible = true; b3.visible = true; }
            setObjective("Collect the Blessing of Devotion.");
        }
    }
    else if (obj.type === 'hidden_shrine') {
        if (gameState.stage === 'SOUTH_DEVOTION' && !questData.diyasLit) {
            setObjective("Light the 3 Sacred Diyas in the desert.");
            showToast("The Shrine is dormant. Light the 3 nearby Diyas.");
        }
    }
    else if (obj.type === 'blessing') {
        obj.visible = false; obj.mesh.visible = false;
        gameState.blessings++;
        updateHUD();
        
        if (obj.id === 'blessing_wisdom') {
            showToast("BLESSING OF WISDOM OBTAINED\\nThe path to the East is open!");
            gameState.stage = 'EAST_PROSPERITY';
            setObjective("Find the 5 offerings in the Eastern Festival.");
        }
        else if (obj.id === 'blessing_prosperity') {
            showToast("BLESSING OF PROSPERITY OBTAINED\\nThe Southern winds clear the path!");
            gameState.stage = 'SOUTH_DEVOTION';
            setObjective("Find the Forgotten Shrine in the Southern Desert.");
        }
        else if (obj.id === 'blessing_devotion') {
            showToast("BLESSING OF DEVOTION OBTAINED\\nThe treacherous Western path reveals itself!");
            gameState.stage = 'WEST_COURAGE';
            setObjective("Navigate the Mountain canyon in the West.");
        }
        else if (obj.id === 'blessing_courage') {
            showToast("BLESSING OF COURAGE OBTAINED\\nALL FOUR BLESSINGS RECOVERED!");
            gameState.stage = 'RETURN_CENTER';
            setObjective("Return to Ganapati at the Central Shrine.");
        }
    }
}

// Quiz"""

code = code.replace(old_logic.group(0), new_logic)
with open('src/main.js', 'w') as f:
    f.write(code)
