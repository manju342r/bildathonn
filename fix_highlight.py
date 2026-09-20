import re

with open('src/world.js', 'r') as f:
    code = f.read()

# We'll inject a glowing indicator into the group at the end of createInteractable.
old_logic = """    // Cast shadows for all parts
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; } });
    scene.add(group);"""

new_logic = """    // Add a glowing interaction highlight marker above the object
    if (type !== 'shrine' && type !== 'hidden_shrine' && type !== 'prosperity_shrine') {
        const highlightGeo = new THREE.OctahedronGeometry(1.5);
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }); // Bright yellow wireframe
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.y = 20; // Float above
        highlight.name = "quest_highlight";
        group.add(highlight);
        
        // Add a gentle glow ring
        const ringGeo = new THREE.RingGeometry(3, 3.5, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1;
        ring.name = "quest_ring";
        group.add(ring);
    }
    
    // Cast shadows for all parts
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; } });
    scene.add(group);"""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('src/world.js', 'w') as f:
        f.write(code)
    print("Added highlight meshes")
else:
    print("Could not find end of createInteractable")
