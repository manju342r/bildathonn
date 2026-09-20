import re

with open('src/main.js', 'r') as f:
    code = f.read()

# 1. Add isCinematic flag
code = code.replace("let isPlaying = false;", "let isPlaying = false;\nlet isCinematic = false;")

# 2. Update animate() to respect isCinematic
old_camera = """    // Camera follow
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 40;
    camera.position.y = 25;
    camera.lookAt(player.position);"""

new_camera = """    // Camera follow (only if not in a cinematic)
    if (!isCinematic) {
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 40;
        camera.position.y = 25;
        camera.lookAt(player.position);
    }"""
code = code.replace(old_camera, new_camera)

# 3. Add the cinematic functions at the bottom
cinematic_funcs = """
// ==========================================
// CINEMATICS
// ==========================================
function playOpeningCinematic() {
    isCinematic = true;
    isPlaying = false; // Lock controls
    
    // Start camera high up looking at the center
    camera.position.set(0, 100, 150);
    camera.lookAt(0, 0, 0);
    
    showToast("THE LOST BLESSINGS");
    
    setTimeout(() => {
        showToast("The Ananta Jyoti burns brightly...");
        // Move camera closer
        camera.position.set(50, 40, 50);
        camera.lookAt(0, 0, 0);
    }, 4000);
    
    setTimeout(() => {
        // Vighna event!
        scene.fog.color.setHex(0x220000);
        scene.background.setHex(0x220000);
        showToast("BOOM! VIGHNA HAS STRUCK!");
        // Shake screen effect hack
        let shakes = 0;
        let shaker = setInterval(() => {
            camera.position.x += (Math.random() - 0.5) * 5;
            camera.position.y += (Math.random() - 0.5) * 5;
            shakes++;
            if (shakes > 20) clearInterval(shaker);
        }, 50);
    }, 8000);
    
    setTimeout(() => {
        showToast("The Blessings have been scattered...");
    }, 11000);
    
    setTimeout(() => {
        showToast("Mooshak, you must save the festival!");
        // Return control to player
        isCinematic = false;
        isPlaying = true;
        scene.fog.color.setHex(0x87CEEB); // restore sky
        scene.background.setHex(0x87CEEB);
        gameState.stage = 'TALK_TO_GANESHA';
        setObjective("Speak to Ganapati at the Shrine");
    }, 15000);
}

function startFinalVighnaEvent() {
    gameState.stage = 'FINAL_VIGHNA';
    setObjective("Break through the final Vighna corruption!");
    showToast("VIGHNA RETURNS!");
    scene.fog.color.setHex(0x220000);
    scene.background.setHex(0x220000);
    
    // Spawn 4 corrupted points around the center
    createInteractable(scene, 'vighna1', 'corruption', 30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna2', 'corruption', -30, 30, 0xff0000, 'box');
    createInteractable(scene, 'vighna3', 'corruption', 30, -30, 0xff0000, 'box');
    createInteractable(scene, 'vighna4', 'corruption', -30, -30, 0xff0000, 'box');
    questData.corruptionsCleared = 0;
}

function playEndingCinematic() {
    isCinematic = true;
    isPlaying = false;
    
    camera.position.set(0, 50, 80);
    camera.lookAt(0, 0, 0);
    
    scene.fog.color.setHex(0xffffff);
    scene.background.setHex(0xffffff);
    
    showToast("THE ANANTA JYOTI IS RESTORED!");
    
    setTimeout(() => {
        showToast("The blessings were never meant to make the journey easy...");
    }, 4000);
    
    setTimeout(() => {
        showToast("They were meant to guide the journey.");
    }, 8000);
    
    setTimeout(() => {
        showToast("HAPPY GANESH CHATURTHI!");
        document.getElementById('hud-objective').innerHTML = "<b>THE FESTIVAL IS COMPLETE</b>";
    }, 12000);
}
"""
code += cinematic_funcs

# Add interaction logic for 'corruption'
new_int = """    else if (obj.type === 'corruption') {
        obj.visible = false; obj.mesh.visible = false;
        questData.corruptionsCleared = (questData.corruptionsCleared || 0) + 1;
        showToast("Corruption Cleared! " + questData.corruptionsCleared + "/4");
        if (questData.corruptionsCleared >= 4) {
            playEndingCinematic();
        }
    }
    else if (obj.type === 'blessing') {"""

code = code.replace("    else if (obj.type === 'blessing') {", new_int)

with open('src/main.js', 'w') as f:
    f.write(code)
