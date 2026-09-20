import re

with open('src/main.js', 'r') as f:
    code = f.read()

# 1. Remove the first initGame and init3D definitions that were erroneously added
code = re.sub(r'// Initialize the 3D Engine & Assets.*?// Three\.js Core', '// Three.js Core', code, flags=re.DOTALL)

# 2. Add global let for player and ganesha
code = code.replace('let boulders = [];', 'let boulders = [];\nlet player, ganesha;\n')

# 3. We want to defer the execution of everything starting from `// Build World` until `loadAllModels()` finishes.
# Let's wrap the initialization logic in `initGame()`
init_code = """
async function initGame() {
    document.getElementById('loading-text').innerText = "Loading 3D Models (Checking assets/ folder)...";
    
    // Attempt to load external realistic models
    await Promise.all([
        loadModel('ganesha', 'assets/ganesha.glb'),
        loadModel('mooshak', 'assets/mooshak.glb'),
        loadModel('modak', 'assets/modak.glb'),
        loadModel('flag', 'assets/flag.glb')
    ]);
    
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
    
    // Build World
    createWorld(scene);

    // Characters
    player = createMooshak();
    player.scale.set(1.5, 1.5, 1.5);
    scene.add(player);
    ganesha = createGanesha();
    ganesha.scale.set(1.5, 1.5, 1.5);
    scene.add(ganesha);
    
    animate();
}
initGame();
"""

code = code.replace('const player = createMooshak();', '')
code = code.replace('player.scale.set(1.5, 1.5, 1.5);', '')
code = code.replace('scene.add(player);', '')
code = code.replace('const ganesha = createGanesha();', '')
code = code.replace('ganesha.scale.set(1.5, 1.5, 1.5);', '')
code = code.replace('scene.add(ganesha);', '')
code = code.replace('// Build World\ncreateWorld(scene);\n', '')
code = code.replace('animate();', '')

code += init_code

with open('src/main.js', 'w') as f:
    f.write(code)

