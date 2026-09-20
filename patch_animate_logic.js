const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

const anchor = "let canInteract = false;";
const injection = `
        // Check static hazards (Cacti, Thorns, Pits)
        if (typeof hazards !== 'undefined') {
            for (let hazard of hazards) {
                let hDist = Math.sqrt(Math.pow(player.position.x - hazard.x, 2) + Math.pow(player.position.z - hazard.z, 2));
                
                // Idle sway
                if (hazard.type === 'cactus' || hazard.type === 'thorn') {
                    hazard.mesh.rotation.z = Math.sin(Date.now() * 0.002 + hazard.x) * 0.05;
                }
                
                // Pits snap spikes up if player is near
                if (hazard.type === 'thorn_pit') {
                    let spikes = hazard.mesh.children[1]; // the spikes group
                    if (spikes) {
                        if (hDist < 30) {
                            spikes.position.y = THREE.MathUtils.lerp(spikes.position.y, 2, 0.2);
                        } else {
                            spikes.position.y = THREE.MathUtils.lerp(spikes.position.y, -4, 0.1);
                        }
                    }
                }
                
                let hyDist = Math.abs(player.position.y - hazard.mesh.position.y);
                if (hDist < hazard.radius && hyDist < 20) { // Hit hazard
                    if (!hazard.cooldown || Date.now() - hazard.cooldown > 1000) {
                        hazard.cooldown = Date.now();
                        gameState.health--;
                        updateHUD();
                        let msg = "Pricked by Thorns!";
                        if (hazard.type === 'cactus') msg = "Spiked by a Cactus!";
                        if (hazard.type === 'thorn_pit') msg = "Fell into a Thorn Pit!";
                        showToast("Ouch! " + msg + " Health: " + gameState.health);
                        
                        // Bounce back slightly
                        player.position.x += (player.position.x - hazard.x) * 1.0;
                        player.position.z += (player.position.z - hazard.z) * 1.0;
                        
                        if (gameState.health <= 0) {
                            showToast("YOU WERE DEFEATED! Restarting...");
                            setTimeout(revivePlayer, 2000);
                        }
                    }
                }
            }
        }
        
        // --- Player Animation ---
        if (typeof player !== 'undefined') {
            let legFR = player.getObjectByName('legFR');
            let legFL = player.getObjectByName('legFL');
            let legBR = player.getObjectByName('legBR');
            let legBL = player.getObjectByName('legBL');
            let body = player.getObjectByName('body');
            let tail = player.getObjectByName('tail');
            let head = player.getObjectByName('head');
            let earL = player.getObjectByName('earL');
            let earR = player.getObjectByName('earR');

            let speed = Math.sqrt(velocityX*velocityX + velocityZ*velocityZ);
            let time = Date.now() * 0.015;
            
            if (speed > 5) { // Running
                if (legFR) legFR.rotation.x = Math.sin(time) * 0.8;
                if (legFL) legFL.rotation.x = Math.sin(time + Math.PI) * 0.8;
                if (legBR) legBR.rotation.x = Math.sin(time + Math.PI) * 0.8;
                if (legBL) legBL.rotation.x = Math.sin(time) * 0.8;
                
                if (body) body.rotation.z = Math.sin(time) * 0.1; // Body sway
                if (tail) tail.rotation.y = Math.sin(time) * 0.4;
            } else { // Idle
                if (legFR) legFR.rotation.x = 0;
                if (legFL) legFL.rotation.x = 0;
                if (legBR) legBR.rotation.x = 0;
                if (legBL) legBL.rotation.x = 0;
                
                if (body) body.rotation.z = 0;
                if (tail) tail.rotation.y = Math.sin(time * 0.2) * 0.2;
                
                // Random idle sniffs
                if (head) {
                    if (Math.random() < 0.01) head.rotation.x = -0.2;
                    else head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0, 0.1);
                }
                // Random ear twitches
                if (earL) earL.rotation.z = (Math.random() < 0.02) ? -0.5 : 0;
                if (earR) earR.rotation.z = (Math.random() < 0.02) ? 0.5 : 0;
            }
            
            // Jump tilt
            if (!isGrounded && body) {
                body.rotation.x = velocityY > 0 ? -0.3 : 0.3; // Pitch up when jumping, down when falling
            } else if (body) {
                body.rotation.x = THREE.MathUtils.lerp(body.rotation.x, 0, 0.2);
            }
        }
`;

content = content.replace(anchor, injection + "\n        " + anchor);
fs.writeFileSync('src/main.js', content);
