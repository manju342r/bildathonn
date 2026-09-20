import re

with open('src/main.js', 'r') as f:
    code = f.read()

code = code.replace("scene.add(ganesha);", "scene.add(ganesha);\n    ganesha.position.set(0, 7, -20);")

with open('src/main.js', 'w') as f:
    f.write(code)
