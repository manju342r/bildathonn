const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const oldEnding = `function playEndingCinematic() {
    isCinematic = true;
    cinematicIndex = 10;
    
    // Zoom out
    camera.position.set(0, 200, 300);
    camera.lookAt(0, 0, 0);
    
    showToast("The Lost Blessings are restored!");
    
    setTimeout(() => {
        showToast("The Ananta Jyoti shines again.");
    }, 4000);
    
    setTimeout(() => {
        showToast("Ganapati Bappa Morya! Happy Ganesh Chaturthi!");
        setObjective("Thank you for playing!");
    }, 8000);
}`;

const newEnding = `function playEndingCinematic() {
    isCinematic = true;
    cinematicIndex = 10;
    
    // Position camera dynamically at the shrine
    camera.position.set(0, 60, 150);
    camera.lookAt(0, 30, 0);
    
    showToast("The four blessings and the Sacred Diya awaken the Ananta Jyoti...");
    
    // Banasura arrives!
    setTimeout(() => {
        if (banasuraMesh) {
            banasuraMesh.visible = true;
            banasuraMesh.position.set(0, 40, 80);
            banasuraMesh.lookAt(0, 30, 0);
        }
        showToast("Banasura: 'Fools! I will extinguish it myself!'");
    }, 4000);
    
    // Ganapati Confronts
    setTimeout(() => {
        showToast("Ganapati Ji awakens!");
        // Stylized Tusk Strike (Animate Ganesha model rotating/tilting slightly)
        if (modelCache['ganesha']) {
            let strike = setInterval(() => {
                modelCache['ganesha'].rotation.x += 0.1;
                if (modelCache['ganesha'].rotation.x > 0.5) clearInterval(strike);
            }, 50);
            
            setTimeout(() => {
                let recover = setInterval(() => {
                    modelCache['ganesha'].rotation.x -= 0.05;
                    if (modelCache['ganesha'].rotation.x <= 0) clearInterval(recover);
                }, 50);
            }, 500);
        }
    }, 8000);
    
    // Banasura Defeated
    setTimeout(() => {
        showToast("Banasura is struck by divine power!");
        if (banasuraMesh) {
            createSmokePuff(banasuraMesh.position);
            createSmokePuff(banasuraMesh.position);
            banasuraMesh.visible = false;
        }
    }, 9000);
    
    // Restoration
    setTimeout(() => {
        showToast("The corruption vanishes. The sacred light spreads across the world...");
        gameState.stage = 'RESTORED'; // Changes skybox to beautiful blue
        // Re-light the scene dramatically
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    }, 12000);
    
    setTimeout(() => {
        showToast("THE SACRED LIGHT HAS RETURNED");
        document.getElementById('title-screen').style.display = 'flex';
        document.getElementById('title-screen').innerHTML = '<h1>THE LOST BLESSINGS</h1><p>HAPPY GANESH CHATURTHI</p>';
        setObjective("Thank you for playing!");
    }, 16000);
}`;

code = code.replace(oldEnding, newEnding);

// Also add the RESTORED stage sky color
const skyLogic = `} else if (gameState.stage === 'RETURN_CENTER') {`;
const newSkyLogic = `} else if (gameState.stage === 'RESTORED') {
        targetSkyColor.setHex(0x87ceeb); // Beautiful clear sky
        targetSunIntensity = 1.2;
    } else if (gameState.stage === 'RETURN_CENTER') {`;
code = code.replace(skyLogic, newSkyLogic);

fs.writeFileSync('src/main.js', code);
