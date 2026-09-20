import re

with open('src/main.js', 'r') as f:
    code = f.read()

# Locate the animate() loop where we can inject the color lerping
old_animate = """    if (!isPlaying && cinematicIndex > 0) {
        camera.position.x = Math.sin(Date.now() * 0.0002) * 150;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 150;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);
    }
    
    if (isPlaying && !isPaused) {"""

new_animate = """    // --- Dynamic Time of Day / Sky System ---
    let targetSkyColor = new THREE.Color(0x87CEEB); // Default Day
    let targetSunIntensity = 1.0;
    
    if (gameState.stage === 'FINAL_VIGHNA' || (isCinematic && cinematicIndex > 4 && cinematicIndex < 10)) {
        targetSkyColor.setHex(0x220000); // Vighna Red
        targetSunIntensity = 0.2;
    } else if (gameState.stage === 'SOUTH_DEVOTION') {
        targetSkyColor.setHex(0xff7744); // Sunset for the Desert/Diyas
        targetSunIntensity = 0.8;
    } else if (gameState.stage === 'WEST_COURAGE' || gameState.stage === 'RETURN_CENTER') {
        targetSkyColor.setHex(0x0a0a2a); // Deep Night for the final challenge
        targetSunIntensity = 0.1;
    } else if (gameState.stage === 'GAME_COMPLETE' || (isCinematic && cinematicIndex > 20)) {
        targetSkyColor.setHex(0xaaddff); // Brilliant Dawn
        targetSunIntensity = 1.2;
    }
    
    // Smoothly interpolate sky, fog, and sun
    scene.background.lerp(targetSkyColor, 0.02);
    scene.fog.color.lerp(targetSkyColor, 0.02);
    if (typeof dirLight !== 'undefined') {
        dirLight.intensity += (targetSunIntensity - dirLight.intensity) * 0.02;
    }
    // ----------------------------------------

    if (!isPlaying && cinematicIndex > 0) {
        camera.position.x = Math.sin(Date.now() * 0.0002) * 150;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 150;
        camera.position.y = 100;
        camera.lookAt(0, 0, 0);
    }
    
    if (isPlaying && !isPaused) {"""

if old_animate in code:
    code = code.replace(old_animate, new_animate)
    with open('src/main.js', 'w') as f:
        f.write(code)
    print("Added dynamic sky system")
else:
    print("Could not find animate hook")

# Also need to remove the hardcoded sky changes from cinematics and Vighna to avoid sudden snapping
code = re.sub(r'scene\.fog\.color\.setHex\(0x220000\);\n\s*scene\.background\.setHex\(0x220000\);', '// Sky handled dynamically', code)
code = re.sub(r'scene\.fog\.color\.setHex\(0x87CEEB\);\s*// restore sky\n\s*scene\.background\.setHex\(0x87CEEB\);', '// Sky handled dynamically', code)
code = re.sub(r'scene\.fog\.color\.setHex\(0xffffff\);\n\s*scene\.background\.setHex\(0xffffff\);', 'gameState.stage = "GAME_COMPLETE"; // Triggers brilliant dawn', code)

with open('src/main.js', 'w') as f:
    f.write(code)

