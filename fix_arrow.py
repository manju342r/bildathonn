import re

with open('src/main.js', 'r') as f:
    code = f.read()

# 1. Redesign the arrow into a literal arrow (Box + Cone)
old_arrow_init = """    // Create Guide Arrow
    arrowContainer = new THREE.Group();
    const arrowGeo = new THREE.ConeGeometry(2, 6, 8);
    const arrowMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    guideArrow = new THREE.Mesh(arrowGeo, arrowMat);
    guideArrow.rotation.x = Math.PI / 2;
    guideArrow.position.z = 6;
    arrowContainer.add(guideArrow);
    scene.add(arrowContainer);"""

new_arrow_init = """    // Create Guide Arrow (Literal Arrow Shape)
    arrowContainer = new THREE.Group();
    const arrowMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    
    // The shaft (rectangular box)
    const shaftGeo = new THREE.BoxGeometry(1.5, 1.5, 6);
    const shaft = new THREE.Mesh(shaftGeo, arrowMat);
    shaft.position.z = -3; // Move shaft back
    
    // The head (triangle/cone)
    const headGeo = new THREE.ConeGeometry(3, 4, 4);
    const head = new THREE.Mesh(headGeo, arrowMat);
    head.rotation.x = Math.PI / 2; // Point forward along Z axis
    head.rotation.y = Math.PI / 4; // Make it look like a flat triangle
    head.position.z = 2; // Move head forward
    
    arrowContainer.add(shaft, head);
    scene.add(arrowContainer);"""

if old_arrow_init in code:
    code = code.replace(old_arrow_init, new_arrow_init)
    print("Replaced arrow geometry")
else:
    print("Could not find old arrow init")

# 2. Disable Magical Barriers (so they don't block the player)
old_barriers = """    // Create Magical Barriers
    barrierEast = addWall(scene, 120, 0, 20, 800, 0xff5500, 60, true);
    if (barrierEast) { barrierEast.mesh.material.transparent = true; barrierEast.mesh.material.opacity = 0.4; }
    
    barrierSouth = addWall(scene, 0, 150, 800, 20, 0xff5500, 60, true);
    if (barrierSouth) { barrierSouth.mesh.material.transparent = true; barrierSouth.mesh.material.opacity = 0.4; }
    
    barrierWest = addWall(scene, -120, 0, 20, 800, 0xff5500, 60, true);
    if (barrierWest) { barrierWest.mesh.material.transparent = true; barrierWest.mesh.material.opacity = 0.4; }"""

new_barriers = """    // Barriers removed per user request (Open World freedom)"""

code = code.replace(old_barriers, new_barriers)

# 3. Fix the Math.atan2 aiming logic and remove the toast notifications for barriers
old_arrow_aim = """            if (target && isPlaying) {
                arrowContainer.visible = true;
                let angle = Math.atan2(player.position.x - target.x, player.position.z - target.z);
                // Smooth rotation for the arrow
                let diff = angle - arrowContainer.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                arrowContainer.rotation.y += diff * 0.1;
            } else {
                arrowContainer.visible = false;
            }
        }
        
        // === MAGICAL BARRIER UNLOCK LOGIC ===
        if (gameState.stage !== 'START' && gameState.stage !== 'TALK_TO_GANESHA' && gameState.stage !== 'NORTH_WISDOM') {
            if (barrierEast && barrierEast.isActive) { barrierEast.isActive = false; barrierEast.mesh.visible = false; showToast("The Magical Barrier to the East has shattered!"); }
        }
        if (gameState.stage === 'SOUTH_DEVOTION' || gameState.stage === 'WEST_COURAGE' || gameState.stage === 'RETURN_CENTER' || gameState.stage === 'FINAL_VIGHNA') {
            if (barrierSouth && barrierSouth.isActive) { barrierSouth.isActive = false; barrierSouth.mesh.visible = false; showToast("The Magical Barrier to the South has shattered!"); }
        }
        if (gameState.stage === 'WEST_COURAGE' || gameState.stage === 'RETURN_CENTER' || gameState.stage === 'FINAL_VIGHNA') {
            if (barrierWest && barrierWest.isActive) { barrierWest.isActive = false; barrierWest.mesh.visible = false; showToast("The Magical Barrier to the West has shattered!"); }
        }
        // ===================================="""

new_arrow_aim = """            if (target && isPlaying) {
                arrowContainer.visible = true;
                
                // Correct Math: dx, dz from player TO target
                let dx = target.x - player.position.x;
                let dz = target.z - player.position.z;
                let angle = Math.atan2(dx, dz);
                
                // Apply rotation directly so it perfectly tracks the destination in world space
                arrowContainer.rotation.y = angle;
                
            } else {
                arrowContainer.visible = false;
            }
        }"""

code = code.replace(old_arrow_aim, new_arrow_aim)

with open('src/main.js', 'w') as f:
    f.write(code)

print("Fixed arrow math and removed barriers")
