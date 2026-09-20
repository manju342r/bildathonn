import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_logic = """        const distToMooshak = Math.sqrt(Math.pow(player.position.x - ganesha.position.x, 2) + Math.pow(player.position.z - ganesha.position.z, 2));
        if (distToMooshak > GAME_CONFIG.companionFollowDistance) {
            const angle = Math.atan2(player.position.x - ganesha.position.x, player.position.z - ganesha.position.z);
            const moveSpd = GAME_CONFIG.companionSpeed * delta;
            ganesha.position.x += Math.sin(angle) * moveSpd;
            ganesha.position.z += Math.cos(angle) * moveSpd;
            ganesha.rotation.y = angle;
        }"""

new_logic = """        // GANAPATI IS STATIONARY. No companion follow logic."""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('src/main.js', 'w') as f:
        f.write(code)
    print("Fixed follow logic")
else:
    print("Could not find follow logic")
