import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_runner = re.search(r'// Runner Mode check.*?boulders.splice\(i, 1\);\n\s*\}\n\s*\}', code, re.DOTALL)

new_runner = """        // West Region (Courage) - Falling Rocks
        if (player.position.x < -300 && player.position.x > -800 && Math.abs(player.position.z) < 100) {
            inRunnerMode = true;
            camOffset.set(60, 40, 0); // Camera behind player looking West
            
            if (Math.random() < 0.05) {
                const geo = new THREE.DodecahedronGeometry(8);
                const mat = new THREE.MeshStandardMaterial({ color: 0x555555 });
                const rock = new THREE.Mesh(geo, mat);
                // Drop from above, rolling towards +X (East)
                rock.position.set(player.position.x - 200, 100, Math.random() * 80 - 40);
                scene.add(rock);
                boulders.push({ mesh: rock, speed: 60 + Math.random() * 40 });
            }
            
            for (let i = boulders.length - 1; i >= 0; i--) {
                let b = boulders[i];
                b.mesh.position.x += b.speed * delta; // Roll East
                b.mesh.position.y -= 50 * delta; // Fall down
                if (b.mesh.position.y < 8) b.mesh.position.y = 8;
                b.mesh.rotation.z -= b.speed * delta * 0.1;
                
                // Collision
                let dist = Math.sqrt(Math.pow(player.position.x - b.mesh.position.x, 2) + Math.pow(player.position.z - b.mesh.position.z, 2));
                if (dist < 12) {
                    // Hit!
                    scene.remove(b.mesh);
                    boulders.splice(i, 1);
                    gameState.health--;
                    updateHUD();
                    showToast("HIT BY A ROCK! Health: " + gameState.health);
                    if (gameState.health <= 0) {
                        showToast("YOU FELL! Restarting...");
                        setTimeout(revivePlayer, 2000);
                    }
                    continue;
                }
                
                if (b.mesh.position.x > -200) {
                    scene.remove(b.mesh);
                    boulders.splice(i, 1);
                }
            }
        }"""

if old_runner:
    code = code.replace(old_runner.group(0), new_runner)
    with open('src/main.js', 'w') as f:
        f.write(code)
else:
    print("Could not find runner block")
