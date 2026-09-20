import re

with open('src/main.js', 'r') as f:
    code = f.read()

# 1. Add Guide Arrow Initialization
old_init = "async function initGame() {"
new_init = """let guideArrow, arrowContainer;
let barrierEast, barrierSouth, barrierWest;

async function initGame() {"""
code = code.replace(old_init, new_init)

old_player = "player.position.set(0, 0, 10);"
new_player = """player.position.set(0, 0, 10);
    
    // Create Guide Arrow
    arrowContainer = new THREE.Group();
    const arrowGeo = new THREE.ConeGeometry(2, 6, 8);
    const arrowMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
    guideArrow = new THREE.Mesh(arrowGeo, arrowMat);
    guideArrow.rotation.x = Math.PI / 2;
    guideArrow.position.z = 6;
    arrowContainer.add(guideArrow);
    scene.add(arrowContainer);
    
    // Create Magical Barriers
    barrierEast = addWall(scene, 120, 0, 20, 800, 0xff5500, 60, true);
    if (barrierEast) { barrierEast.mesh.material.transparent = true; barrierEast.mesh.material.opacity = 0.4; }
    
    barrierSouth = addWall(scene, 0, 150, 800, 20, 0xff5500, 60, true);
    if (barrierSouth) { barrierSouth.mesh.material.transparent = true; barrierSouth.mesh.material.opacity = 0.4; }
    
    barrierWest = addWall(scene, -120, 0, 20, 800, 0xff5500, 60, true);
    if (barrierWest) { barrierWest.mesh.material.transparent = true; barrierWest.mesh.material.opacity = 0.4; }
"""
code = code.replace(old_player, new_player)

# 2. Add Guide Arrow & Barrier Logic to animate()
old_animate = """        // Smoothly step up/down
        player.position.y += (targetY - player.position.y) * 0.2;
        
        // GANAPATI IS STATIONARY. No companion follow logic."""

new_animate = """        // Smoothly step up/down
        player.position.y += (targetY - player.position.y) * 0.2;
        
        // === GUIDING ARROW LOGIC ===
        if (arrowContainer) {
            arrowContainer.position.copy(player.position);
            arrowContainer.position.y += 12 + Math.sin(Date.now() * 0.005) * 2; // Hover and bob
            
            let target = null;
            if (gameState.stage === 'TALK_TO_GANESHA') target = ganesha.position;
            else if (gameState.stage === 'NORTH_WISDOM') {
                let sHit = questData.symbolsHit || 0;
                if (sHit === 0) target = {x: -150, z: -250};
                else if (sHit === 1) target = {x: 200, z: -350};
                else if (sHit === 2) target = {x: -50, z: -550};
                else target = {x: 0, z: -400};
            }
            else if (gameState.stage === 'EAST_PROSPERITY') {
                if ((questData.offeringsFound || 0) < 5) {
                    // Point to the first uncollected offering
                    for (let i=0; i<5; i++) {
                        let off = interactables.find(obj => obj.id === 'offering'+i);
                        if (off && off.visible) { target = off; break; }
                    }
                } else {
                    target = {x: 550, z: 0}; // Prosperity Shrine
                }
            }
            else if (gameState.stage === 'SOUTH_DEVOTION') {
                if ((questData.diyasLit || 0) < 3) {
                    for (let i=1; i<=3; i++) {
                        let diya = interactables.find(obj => obj.id === 'diya'+i);
                        if (diya && diya.visible) { target = diya; break; }
                    }
                } else {
                    target = {x: 0, z: 600}; // Blessing of devotion
                }
            }
            else if (gameState.stage === 'WEST_COURAGE') {
                target = {x: -800, z: 0}; // End of the canyon
            }
            else if (gameState.stage === 'RETURN_CENTER' || gameState.stage === 'FINAL_VIGHNA') {
                target = {x: 0, z: 0};
            }
            
            if (target && isPlaying) {
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
        // ====================================

        // GANAPATI IS STATIONARY. No companion follow logic."""

code = code.replace(old_animate, new_animate)

with open('src/main.js', 'w') as f:
    f.write(code)
