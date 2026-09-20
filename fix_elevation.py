import re

with open('src/main.js', 'r') as f:
    code = f.read()

old_logic = """            if (!checkCollision(newX, player.position.z, 6)) player.position.x = newX;
            if (!checkCollision(player.position.x, newZ, 6)) player.position.z = newZ;
            player.rotation.y = Math.atan2(dx, dz);
        }
        
        // GANAPATI IS STATIONARY. No companion follow logic."""

new_logic = """            if (!checkCollision(newX, player.position.z, 6)) player.position.x = newX;
            if (!checkCollision(player.position.x, newZ, 6)) player.position.z = newZ;
            player.rotation.y = Math.atan2(dx, dz);
        }
        
        // Dynamic Elevation for Central Shrine (Stairs effect)
        const distToCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
        let targetY = 0;
        if (distToCenter < 80) targetY = 7;
        else if (distToCenter < 150) targetY = 4;
        else if (distToCenter < 200) targetY = 2;
        
        // Smoothly step up/down
        player.position.y += (targetY - player.position.y) * 0.2;
        
        // GANAPATI IS STATIONARY. No companion follow logic."""

if old_logic in code:
    code = code.replace(old_logic, new_logic)
    with open('src/main.js', 'w') as f:
        f.write(code)
    print("Fixed elevation logic")
else:
    print("Could not find movement block")
