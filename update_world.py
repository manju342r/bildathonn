import re

with open('src/world.js', 'r') as f:
    code = f.read()

# Replace NORTH puzzle
north_old = """    // Grove Puzzle
    createInteractable(scene, 'sym1', 'symbol', -100, -350, 0x4444ff, 'box');
    createInteractable(scene, 'sym2', 'symbol', 100, -450, 0x4444ff, 'box');
    createInteractable(scene, 'sym3', 'symbol', 0, -600, 0x4444ff, 'box');
    
    let b1 = createInteractable(scene, 'blessing_wisdom', 'blessing', 0, -500, 0x00ff00, 'octahedron');
    b1.mesh.visible = false; b1.visible = false; // Requires symbols"""

north_new = """    // Grove Puzzle (Wisdom)
    // Spread symbols far apart
    createInteractable(scene, 'sym1', 'symbol', -150, -250, 0x4444ff, 'box');
    createInteractable(scene, 'sym2', 'symbol', 200, -350, 0x4444ff, 'box');
    createInteractable(scene, 'sym3', 'symbol', -50, -550, 0x4444ff, 'box');
    
    let b1 = createInteractable(scene, 'blessing_wisdom', 'blessing', 0, -400, 0x00ff00, 'octahedron');
    b1.mesh.visible = false; b1.visible = false;"""

code = code.replace(north_old, north_new)

# Replace EAST puzzle
east_old = """    // City Puzzle
    createInteractable(scene, 'flag1', 'flag', 300, -150, 0x00ffff, 'cylinder');
    createInteractable(scene, 'flag2', 'flag', 500, 0, 0x00ffff, 'cylinder');
    createInteractable(scene, 'flag3', 'flag', 400, 200, 0x00ffff, 'cylinder');
    
    // Offerings
    for(let i=0; i<5; i++) {
        createInteractable(scene, `offering${i}`, 'offering', 350 + Math.random()*200, -100 + Math.random()*200, 0xffffff, 'sphere');
    }
    
    let b2 = createInteractable(scene, 'blessing_prosperity', 'blessing', 600, 0, 0x00ff00, 'octahedron');
    b2.mesh.visible = false; b2.visible = false; // Requires flags + offerings"""

east_new = """    // City Puzzle (Prosperity)
    // 5 scattered offerings
    createInteractable(scene, 'offering0', 'offering', 350, -150, 0xffffff, 'sphere');
    createInteractable(scene, 'offering1', 'offering', 500, 50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering2', 'offering', 400, 200, 0xffffff, 'sphere');
    createInteractable(scene, 'offering3', 'offering', 650, -50, 0xffffff, 'sphere');
    createInteractable(scene, 'offering4', 'offering', 250, 100, 0xffffff, 'sphere');
    
    // The Prosperity Shrine (Drop-off point)
    createInteractable(scene, 'prosperity_shrine', 'prosperity_shrine', 550, 0, 0xaa6644, 'box');
    
    let b2 = createInteractable(scene, 'blessing_prosperity', 'blessing', 550, -20, 0x00ff00, 'octahedron');
    b2.mesh.visible = false; b2.visible = false;"""

code = code.replace(east_old, east_new)

# Replace SOUTH puzzle (Make it Desert/Devotion instead of Mountain)
south_old = """    // ==========================================
    // SOUTH: MOUNTAIN PATH (0, 400)
    // ==========================================
    // Giant Mountain Wall blocking South
    addWall(scene, -300, 300, 250, 50, 0x444444, 80);
    addWall(scene, 300, 300, 250, 50, 0x444444, 80);
    // Bridge Gap
    let bridgeGap = addWall(scene, 0, 300, 100, 50, 0x222222, 10);
    
    // Bridge Parts scattered before the gap
    createInteractable(scene, 'part_rope', 'bridge_part', -150, 200, 0x8b4513, 'box');
    createInteractable(scene, 'part_plank', 'bridge_part', 150, 250, 0x8b4513, 'box');
    createInteractable(scene, 'part_emblem', 'bridge_part', 0, 150, 0x8b4513, 'box');
    
    // Runner section walls (narrow canyon)
    addWall(scene, -60, 600, 20, 600, 0x444444, 80);
    addWall(scene, 60, 600, 20, 600, 0x444444, 80);
    addWall(scene, 0, 900, 100, 20, 0x444444, 80); // End of runner
    
    let b3 = createInteractable(scene, 'blessing_courage', 'blessing', 0, 850, 0x00ff00, 'octahedron');"""

south_new = """    // ==========================================
    // SOUTH: DESERT (0, 400)
    // ==========================================
    // Scattered ruins (Desert feel)
    for(let i=0; i<30; i++) {
        let bx = (Math.random() - 0.5) * 500;
        let bz = 200 + Math.random() * 500;
        addWall(scene, bx, bz, 20 + Math.random()*20, 20 + Math.random()*20, 0xcc9966, 10 + Math.random()*15);
    }
    
    // Hidden Shrine
    createInteractable(scene, 'hidden_shrine', 'hidden_shrine', 0, 600, 0xddaa77, 'box');
    
    // Diyas (Unlit lamps)
    createInteractable(scene, 'diya1', 'diya', -150, 500, 0x555555, 'cylinder');
    createInteractable(scene, 'diya2', 'diya', 150, 550, 0x555555, 'cylinder');
    createInteractable(scene, 'diya3', 'diya', 0, 450, 0x555555, 'cylinder');
    
    let b3 = createInteractable(scene, 'blessing_devotion', 'blessing', 0, 600, 0x00ff00, 'octahedron');
    b3.mesh.visible = false; b3.visible = false;"""

code = code.replace(south_old, south_new)

# Replace WEST puzzle (Make it Mountain/Courage)
west_old = """    // ==========================================
    // WEST: VIGHNA ZONE (-400, 0)
    // ==========================================
    // Blocked by magic gate initially
    gateVighna = addWall(scene, -200, 0, 20, 400, 0xff0000, 60);
    
    // Vighna labyrinth / obstacles
    for(let i=0; i<40; i++) {
        let vx = -300 - Math.random() * 500;
        let vz = (Math.random() - 0.5) * 400;
        addWall(scene, vx, vz, 20, 20, 0x220000, 50);
    }
    
    let b4 = createInteractable(scene, 'blessing_devotion', 'blessing', -800, 0, 0x00ff00, 'octahedron');"""

west_new = """    // ==========================================
    // WEST: MOUNTAIN (COURAGE) (-400, 0)
    // ==========================================
    // Giant Mountain Walls forming a canyon
    addWall(scene, -400, -100, 600, 20, 0x444444, 80);
    addWall(scene, -400, 100, 600, 20, 0x444444, 80);
    
    // The Shrine at the end of the canyon
    createInteractable(scene, 'mountain_shrine', 'mountain_shrine', -800, 0, 0x666666, 'box');
    
    let b4 = createInteractable(scene, 'blessing_courage', 'blessing', -800, 0, 0x00ff00, 'octahedron');
    b4.mesh.visible = false; b4.visible = false;"""

code = code.replace(west_old, west_new)

with open('src/world.js', 'w') as f:
    f.write(code)
