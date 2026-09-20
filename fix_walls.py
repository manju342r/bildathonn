import re

with open('src/world.js', 'r') as f:
    code = f.read()

# We need to find `addWall` calls inside random loops and ensure they don't clip interactables.
# Actually, the easiest way to prevent clipping is to check distance to all interactables in `addWall` itself.

old_addWall = """function addWall(scene, x, z, width, depth, color, height) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({color: color, roughness: 0.9});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    let wall = { minX: x - width/2, maxX: x + width/2, minZ: z - depth/2, maxZ: z + depth/2, isActive: true, mesh: mesh };
    walls.push(wall);
    return wall;
}"""

new_addWall = """function addWall(scene, x, z, width, depth, color, height, skipCollisionCheck = false) {
    // Prevent random walls from spawning on top of interactable quest items
    if (!skipCollisionCheck) {
        for (let obj of interactables) {
            let dist = Math.sqrt(Math.pow(x - obj.x, 2) + Math.pow(z - obj.z, 2));
            if (dist < Math.max(width, depth) + 15) {
                return null; // Skip creating this wall
            }
        }
    }

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({color: color, roughness: 0.9});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    let wall = { minX: x - width/2, maxX: x + width/2, minZ: z - depth/2, maxZ: z + depth/2, isActive: true, mesh: mesh };
    walls.push(wall);
    return wall;
}"""

if old_addWall in code:
    code = code.replace(old_addWall, new_addWall)
    with open('src/world.js', 'w') as f:
        f.write(code)
    print("Fixed addWall clipping")
else:
    print("Could not find addWall")
