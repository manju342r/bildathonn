const fs = require('fs');
let code = fs.readFileSync('src/world.js', 'utf8');

const injection = `
    // North Desert Floor Overlay
    const sandCanvas = document.createElement('canvas');
    sandCanvas.width = 256; sandCanvas.height = 256;
    const sandCtx = sandCanvas.getContext('2d');
    sandCtx.fillStyle = '#e8c396'; // Sand base
    sandCtx.fillRect(0,0,256,256);
    for(let i=0; i<300; i++) {
        let x = Math.random() * 256; let y = Math.random() * 256; let r = Math.random() * 15 + 5;
        sandCtx.fillStyle = Math.random() > 0.5 ? 'rgba(210, 180, 140, 0.4)' : 'rgba(230, 200, 150, 0.4)';
        sandCtx.beginPath(); sandCtx.arc(x, y, r, 0, Math.PI * 2); sandCtx.fill();
        sandCtx.beginPath(); sandCtx.arc(x > 128 ? x - 256 : x + 256, y, r, 0, Math.PI * 2); sandCtx.fill();
        sandCtx.beginPath(); sandCtx.arc(x, y > 128 ? y - 256 : y + 256, r, 0, Math.PI * 2); sandCtx.fill();
    }
    const sandTex = new THREE.CanvasTexture(sandCanvas);
    sandTex.wrapS = THREE.RepeatWrapping; sandTex.wrapT = THREE.RepeatWrapping; sandTex.repeat.set(20, 15);
    const desertFloorGeo = new THREE.PlaneGeometry(1000, 750);
    const desertFloorMat = new THREE.MeshToonMaterial({ map: sandTex, roughness: 1.0 });
    const desertFloor = new THREE.Mesh(desertFloorGeo, desertFloorMat);
    desertFloor.rotation.x = -Math.PI / 2;
    desertFloor.position.set(0, 0.1, -500); // Overlay on North area
    desertFloor.receiveShadow = true;
    scene.add(desertFloor);
    
    // Some scattered rocks along the border to hide the seam (z = -125)
    for(let i=0; i<40; i++) {
        let rx = (Math.random() - 0.5) * 1000;
        let rGeo = new THREE.DodecahedronGeometry(2 + Math.random()*4);
        let rMat = new THREE.MeshToonMaterial({color: 0x887766});
        let rock = new THREE.Mesh(rGeo, rMat);
        rock.position.set(rx, 1, -125 + (Math.random()-0.5)*20);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(rock);
    }
`;

code = code.replace("scene.add(floor);", "scene.add(floor);\n" + injection);
fs.writeFileSync('src/world.js', code);
