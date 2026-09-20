import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_logic = re.search(r'function startCinematic\(\) \{.*?\n\}\n\nfunction nextCinematicText\(\) \{.*?\n\}\n\nfunction endCinematic\(\) \{.*?\n\}', code, re.DOTALL)

new_logic = """function startCinematic() {
    uiMainMenu.classList.remove('active');
    uiCinematic.classList.add('active');
    cinematicIndex = 0;
    
    // Position Characters for Intro
    player.position.set(0, 0, 10);
    if (typeof ganesha !== 'undefined') ganesha.position.set(0, 0, -20);
    
    isCinematic = true;
    isPlaying = false; // Lock controls
    
    // Start camera high up looking at the center
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);
    
    nextCinematicText();
}

function nextCinematicText() {
    if (cinematicIndex < STORY_TEXTS.intro.length) {
        cinematicText.innerText = STORY_TEXTS.intro[cinematicIndex];
        
        // 3D Camera & Effects synced with text index
        if (cinematicIndex === 2) {
            // Camera zooms in slightly
            camera.position.set(40, 40, 60);
            camera.lookAt(0, 0, -20);
        }
        else if (cinematicIndex === 4) {
            // BOOM - Vighna hits
            scene.fog.color.setHex(0x220000);
            scene.background.setHex(0x220000);
            let shakes = 0;
            let shaker = setInterval(() => {
                camera.position.x += (Math.random() - 0.5) * 5;
                camera.position.y += (Math.random() - 0.5) * 5;
                shakes++;
                if (shakes > 15) clearInterval(shaker);
            }, 50);
        }
        
        cinematicIndex++;
        cinematicTimeout = setTimeout(nextCinematicText, 4000);
    } else {
        endCinematic();
    }
}

function endCinematic() {
    if (cinematicTimeout) clearTimeout(cinematicTimeout);
    uiCinematic.classList.remove('active');
    uiHud.classList.add('active');
    
    isCinematic = false;
    isPlaying = true;
    scene.fog.color.setHex(0x87CEEB); // restore sky
    scene.background.setHex(0x87CEEB);
    
    gameState.stage = 'TALK_TO_GANESHA';
    setObjective("Speak to Ganapati at the Shrine");
    showToast("Press WASD/Arrows to move, E to interact");
}"""

if old_logic:
    code = code.replace(old_logic.group(0), new_logic)
    with open('src/main.js', 'w') as f:
        f.write(code)
else:
    print("Could not find startCinematic block")
