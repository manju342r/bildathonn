import re

with open('src/world.js', 'r') as f:
    code = f.read()

# Make the highlight larger and solid instead of wireframe so it's highly visible
code = code.replace("const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });", "const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Solid bright yellow")
code = code.replace("const highlightGeo = new THREE.OctahedronGeometry(1.5);", "const highlightGeo = new THREE.OctahedronGeometry(3.0); // Twice as large")

with open('src/world.js', 'w') as f:
    f.write(code)
