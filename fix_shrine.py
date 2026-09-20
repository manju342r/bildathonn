import re

with open('src/world.js', 'r') as f:
    code = f.read()

old_shrine = """    // Large Temple Base
    const baseGeo = new THREE.CylinderGeometry(60, 60, 2, 32);
    const baseMat = new THREE.MeshStandardMaterial({color: 0x888888});
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 1;
    base.receiveShadow = true;
    scene.add(base);
    
    // Knowledge Shrine
    createInteractable(scene, 'knowledge_shrine', 'shrine', 0, -20, 0x9932cc, 'box');
    
    // Decorative Pillars around Hub
    for(let i=0; i<8; i++) {
        let angle = (i / 8) * Math.PI * 2;
        let px = Math.sin(angle) * 50;
        let pz = Math.cos(angle) * 50;
        addWall(scene, px, pz, 6, 6, 0xdddddd, 40);
    }"""

new_shrine = """    // ==========================================
    // MASSIVE SACRED SHRINE (FOR GANAPATI)
    // ==========================================
    // 1. Lower wide base
    const baseGeo1 = new THREE.CylinderGeometry(200, 200, 2, 64);
    const baseMat1 = new THREE.MeshStandardMaterial({color: 0x8B5A2B, roughness: 0.9}); // Warm sandstone
    const base1 = new THREE.Mesh(baseGeo1, baseMat1);
    base1.position.y = 1;
    base1.receiveShadow = true;
    scene.add(base1);
    
    // 2. Middle elevated tier
    const baseGeo2 = new THREE.CylinderGeometry(150, 150, 2, 64);
    const baseMat2 = new THREE.MeshStandardMaterial({color: 0xA0522D, roughness: 0.8});
    const base2 = new THREE.Mesh(baseGeo2, baseMat2);
    base2.position.y = 3;
    base2.receiveShadow = true;
    scene.add(base2);
    
    // 3. Central seating platform specifically for Ganapati
    const baseGeo3 = new THREE.CylinderGeometry(80, 80, 4, 32);
    const baseMat3 = new THREE.MeshStandardMaterial({color: 0xCD853F, roughness: 0.7});
    const base3 = new THREE.Mesh(baseGeo3, baseMat3);
    base3.position.y = 5;
    base3.receiveShadow = true;
    scene.add(base3);
    
    // 4. Rangoli / Decorative Carpet effect in front
    const carpetGeo = new THREE.CylinderGeometry(40, 40, 0.5, 32);
    const carpetMat = new THREE.MeshStandardMaterial({color: 0xFF4500, roughness: 1.0}); // Bright Orange/Red
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(0, 6, 60);
    carpet.receiveShadow = true;
    scene.add(carpet);
    
    // 5. Sacred Pillars forming a canopy perimeter
    for(let i=0; i<12; i++) {
        let angle = (i / 12) * Math.PI * 2;
        let px = Math.sin(angle) * 140;
        let pz = Math.cos(angle) * 140;
        addWall(scene, px, pz, 10, 10, 0xFFD700, 80); // Tall golden/stone pillars
        
        // Add a warm glowing diya at the base of each pillar
        createInteractable(scene, `hub_diya_${i}`, 'decorative_diya', px * 0.9, pz * 0.9, 0xffa500, 'cylinder');
    }
    
    // Warm central lighting to make the shrine feel cozy
    const shrineLight = new THREE.PointLight(0xffaa55, 1.5, 300);
    shrineLight.position.set(0, 40, 0);
    scene.add(shrineLight);

    // Knowledge Shrine (Moved slightly further out so it doesn't clip Ganapati)
    createInteractable(scene, 'knowledge_shrine', 'shrine', 60, -60, 0x9932cc, 'box');
"""

if old_shrine in code:
    code = code.replace(old_shrine, new_shrine)
    with open('src/world.js', 'w') as f:
        f.write(code)
    print("Redesigned shrine")
else:
    print("Could not find old shrine block")
