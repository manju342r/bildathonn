const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

// 1. Navigation Arrow Redesign
const oldArrow = `    const arrowGeo = new THREE.ConeGeometry(5, 15, 8);
    const arrowMat = new THREE.MeshToonMaterial({color: 0xffff00});
    arrowContainer = new THREE.Mesh(arrowGeo, arrowMat);`;
const newArrow = `    // Sleek, glowing, floating directional indicator
    const arrowGeo = new THREE.OctahedronGeometry(4, 0); // Diamond shape
    const arrowMat = new THREE.MeshToonMaterial({
        color: 0x00ffff, 
        emissive: 0x0088ff, 
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
    });
    arrowContainer = new THREE.Mesh(arrowGeo, arrowMat);
    // Add a trailing ring for elegance
    const ringGeo = new THREE.TorusGeometry(6, 0.5, 8, 24);
    const ringMat = new THREE.MeshToonMaterial({color: 0x00ffff, emissive: 0x0088ff, emissiveIntensity: 0.5});
    const arrowRing = new THREE.Mesh(ringGeo, ringMat);
    arrowRing.rotation.x = Math.PI/2;
    arrowContainer.add(arrowRing);`;
code = code.replace(oldArrow, newArrow);

// Arrow animation update (pulse and bob)
const oldArrowAnim = `arrowContainer.position.y += 25 + Math.sin(Date.now() * 0.005) * 3; // Hover much higher above player`;
const newArrowAnim = `arrowContainer.position.y += 25 + Math.sin(Date.now() * 0.003) * 4; // Hover and bob smoothly
            arrowContainer.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.15); // Subtle pulse
            arrowContainer.children[0].rotation.z += 0.05; // Spin the ring`;
code = code.replace(oldArrowAnim, newArrowAnim);

// 2. South Traps circular motion
const oldTrapLogic = `            if (obj.id.startsWith('trap_n')) {
                // North traps sweep side to side
                obj.mesh.position.x = obj.x + Math.sin(timeNow + obj.z) * 80;
            } else if (obj.id.startsWith('trap_p')) {`;
const newTrapLogic = `            if (obj.id.startsWith('trap_s_circle')) {
                // South traps move in fast sweeping circles
                obj.mesh.position.x = obj.x + Math.cos(timeNow * 2 + obj.z) * 60;
                obj.mesh.position.z = obj.z + Math.sin(timeNow * 2 + obj.z) * 60;
            } else if (obj.id.startsWith('trap_p')) {`;
code = code.replace(oldTrapLogic, newTrapLogic);

// 3. Sacred Diya interaction
const diyaInteraction = `    else if (obj.type === 'blessing') {
        if (!obj.visible || obj.interacted) return;`;
const newDiyaInteraction = `    else if (obj.type === 'sacred_diya') {
        if (!obj.visible || obj.interacted) return;
        
        // Final object collected!
        scene.remove(obj.mesh);
        let idx = interactables.indexOf(obj);
        if (idx > -1) interactables.splice(idx, 1);
        gameState.sacredDiya = true;
        
        showToast("You have acquired the SACRED DIYA!");
        if (gameState.blessings >= 4) {
            gameState.stage = 'RETURN_CENTER';
            setObjective("Return to Ganapati Ji at the Central Shrine.");
            showToast("Banasura: 'This changes nothing. The temple will fall.'");
        }
    }
    else if (obj.type === 'blessing') {
        if (!obj.visible || obj.interacted) return;`;
code = code.replace(diyaInteraction, newDiyaInteraction);

// Update Central Shrine cinematic requirement
const oldReturn = `    } else if (gameState.stage === 'RETURN_CENTER') {
        showToast("The four blessings resonate, emitting a blinding light from the statue!");`;
const newReturn = `    } else if (gameState.stage === 'RETURN_CENTER' && gameState.sacredDiya) {
        showToast("The four blessings and the Sacred Diya resonate, emitting a blinding light from the shrine!");`;
code = code.replace(oldReturn, newReturn);

// Update objective check
const oldObjCheck = `            if (gameState.blessings === 4) {
                gameState.stage = 'RETURN_CENTER';
                setObjective("Return to Ganapati Ji at the Central Shrine.");
            }`;
const newObjCheck = `            if (gameState.blessings === 4 && gameState.sacredDiya) {
                gameState.stage = 'RETURN_CENTER';
                setObjective("Return to Ganapati Ji at the Central Shrine.");
            } else if (gameState.blessings === 4) {
                setObjective("Acquire the Sacred Diya from the Mountain Summit.");
            }`;
code = code.replace(oldObjCheck, newObjCheck);

fs.writeFileSync('src/main.js', code);
