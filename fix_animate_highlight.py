import re

with open('src/main.js', 'r') as f:
    code = f.read()

# I will find the animation loop for dynamic objects and add the highlight animation
old_logic = """            } else if (obj.type === 'symbol') {
                obj.mesh.children[1].rotation.y += delta;
                obj.mesh.children[1].position.y = 12.5 + Math.sin(Date.now()*0.003) * 0.5;
            }
        }"""

new_logic = """            } else if (obj.type === 'symbol') {
                obj.mesh.children[1].rotation.y += delta;
                obj.mesh.children[1].position.y = 12.5 + Math.sin(Date.now()*0.003) * 0.5;
            }
            
            // Animate highlights
            let highlight = obj.mesh.getObjectByName("quest_highlight");
            if (highlight) {
                highlight.rotation.y += delta * 2;
                highlight.position.y = 20 + Math.sin(Date.now() * 0.005) * 2;
            }
            let ring = obj.mesh.getObjectByName("quest_ring");
            if (ring) {
                ring.rotation.z += delta; // Ring rotates along its normal
            }
        }"""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('src/main.js', 'w') as f:
        f.write(code)
    print("Animated highlights")
else:
    print("Could not find animation loop")
