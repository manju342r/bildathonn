import re

with open('src/world.js', 'r') as f:
    code = f.read()

# East City Swap
city_old = """    // Scattered buildings
    for(let i=0; i<30; i++) {
        let bx = 200 + Math.random() * 500;
        let bz = (Math.random() - 0.5) * 500;
        addWall(scene, bx, bz, 30 + Math.random()*20, 30 + Math.random()*20, 0xaa6644, 20 + Math.random()*30);
    }
    
    // City Puzzle (Prosperity)
    // 5 scattered offerings
    createInteractable(scene, 'offering0', 'offering', 350, -150, 0xffffff, 'sphere');"""

city_new = """    // City Puzzle (Prosperity)
    // 5 scattered offerings
    createInteractable(scene, 'offering0', 'offering', 350, -150, 0xffffff, 'sphere');
    createInteractable(scene, 'offering1', 'offering', 500, 50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering2', 'offering', 400, 200, 0xffffff, 'sphere');
    createInteractable(scene, 'offering3', 'offering', 650, -50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering4', 'offering', 250, 100, 0xffffff, 'sphere');
    
    // The Prosperity Shrine (Drop-off point)
    createInteractable(scene, 'prosperity_shrine', 'prosperity_shrine', 550, 0, 0xaa6644, 'box');
    
    let b2 = createInteractable(scene, 'blessing_prosperity', 'blessing', 550, -20, 0x00ff00, 'octahedron');
    b2.mesh.visible = false; b2.visible = false;
    
    // Scattered buildings
    for(let i=0; i<30; i++) {
        let bx = 200 + Math.random() * 500;
        let bz = (Math.random() - 0.5) * 500;
        
        let safe = true;
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 30 + Math.random()*20, 30 + Math.random()*20, 0xaa6644, 20 + Math.random()*30);
    }
    
    // TEMPORARY HACK TO REMOVE OLD INTERACTABLES THAT WERE SWAPPED
    // We replaced the first offering, so we have to trim the rest of the old string"""

# Instead of raw string replacement for large chunks, let's use a smarter approach.
# For EAST:
code = re.sub(
    r'(    // Scattered buildings\n.*?\}\n\n)(    // City Puzzle \(Prosperity\)\n.*?)(\n\n    // ==========================================)',
    r'\2\n\n\1',
    code,
    flags=re.DOTALL
)

# For SOUTH:
code = re.sub(
    r'(    // Scattered ruins \(Desert feel\)\n.*?\}\n\n)(    // Hidden Shrine\n.*?)(\n\n    // ==========================================)',
    r'\2\n\n\1',
    code,
    flags=re.DOTALL
)

# For WEST (Vighna):
code = re.sub(
    r'(    // Vighna labyrinth / obstacles\n.*?\}\n\n)(    let b4 = createInteractable\(scene, \'blessing_devotion\'.*?\n)',
    r'\2\n\n\1',
    code,
    flags=re.DOTALL
)


# Now update the `addWall` inside those loops to have a safety check
code = code.replace("""    // Scattered buildings
    for(let i=0; i<30; i++) {
        let bx = 200 + Math.random() * 500;
        let bz = (Math.random() - 0.5) * 500;
        addWall(scene, bx, bz, 30 + Math.random()*20, 30 + Math.random()*20, 0xaa6644, 20 + Math.random()*30);
    }""", """    // Scattered buildings
    for(let i=0; i<30; i++) {
        let bx = 200 + Math.random() * 500;
        let bz = (Math.random() - 0.5) * 500;
        let safe = true;
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 30 + Math.random()*20, 30 + Math.random()*20, 0xaa6644, 20 + Math.random()*30);
    }""")

code = code.replace("""    // Scattered ruins (Desert feel)
    for(let i=0; i<30; i++) {
        let bx = (Math.random() - 0.5) * 500;
        let bz = 200 + Math.random() * 500;
        addWall(scene, bx, bz, 20 + Math.random()*20, 20 + Math.random()*20, 0xcc9966, 10 + Math.random()*15);
    }""", """    // Scattered ruins (Desert feel)
    for(let i=0; i<30; i++) {
        let bx = (Math.random() - 0.5) * 500;
        let bz = 200 + Math.random() * 500;
        let safe = true;
        for (let obj of interactables) {
            if (Math.abs(bx - obj.x) < 40 && Math.abs(bz - obj.z) < 40) { safe = false; break; }
        }
        if (safe) addWall(scene, bx, bz, 20 + Math.random()*20, 20 + Math.random()*20, 0xcc9966, 10 + Math.random()*15);
    }""")

with open('src/world.js', 'w') as f:
    f.write(code)
