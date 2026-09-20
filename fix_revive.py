import re

with open('src/main.js', 'r') as f:
    code = f.read()

code = code.replace("    ganesha.position.set(gameState.checkpoint.x - 10, 3, gameState.checkpoint.z);", "")

with open('src/main.js', 'w') as f:
    f.write(code)
