import re

with open('src/world.js', 'r') as f:
    code = f.read()

code = code.replace("createInteractable(scene, `hub_diya_${i}`, 'decorative_diya', px * 0.9, pz * 0.9, 0xffa500, 'cylinder');", 
"""
        // Decorative glowing lamp
        const diyaGroup = new THREE.Group();
        diyaGroup.position.set(px * 0.9, 4, pz * 0.9);
        const diyaBase = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 16), new THREE.MeshStandardMaterial({color: 0x555555}));
        const diyaFlame = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshStandardMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 1.5}));
        diyaFlame.position.y = 3;
        const diyaLight = new THREE.PointLight(0xffaa00, 1, 50);
        diyaLight.position.y = 5;
        diyaGroup.add(diyaBase, diyaFlame, diyaLight);
        scene.add(diyaGroup);
""")

with open('src/world.js', 'w') as f:
    f.write(code)
