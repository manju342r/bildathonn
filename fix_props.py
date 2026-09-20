import re

with open('src/world.js', 'r') as f:
    code = f.read()

# We need to insert these new else-if blocks before line 111 (the closing bracket of if(!hasRealModel))
old_block = """        ring2.rotation.y = Math.PI/2; ring2.position.y = 10;
        group.add(core, ring1, ring2);
    }
    
    }"""

new_block = """        ring2.rotation.y = Math.PI/2; ring2.position.y = 10;
        group.add(core, ring1, ring2);
    }
    else if (type === 'prosperity_shrine') {
        const mat = new THREE.MeshStandardMaterial({color: 0xaa6644, roughness: 0.8});
        const table = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 4, 8), mat);
        table.position.y = 2;
        const cloth = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 1, 8), new THREE.MeshStandardMaterial({color: 0xff4400}));
        cloth.position.y = 4.2;
        group.add(table, cloth);
    }
    else if (type === 'diya') {
        const clayMat = new THREE.MeshStandardMaterial({color: 0x8b4513, roughness: 0.9});
        const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 2, 1, 16), clayMat);
        base.position.y = 0.5;
        const bowl = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16, 0, Math.PI*2, 0, Math.PI/2), clayMat);
        bowl.rotation.x = Math.PI; // Flip half-sphere upside down to make a bowl
        bowl.position.y = 1.5;
        const flame = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 8), new THREE.MeshStandardMaterial({color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 2}));
        flame.position.y = 2.5;
        const diyaLight = new THREE.PointLight(0xffaa00, 1, 30);
        diyaLight.position.y = 3;
        group.add(base, bowl, flame, diyaLight);
    }
    else if (type === 'hidden_shrine' || type === 'mountain_shrine') {
        const stoneMat = new THREE.MeshStandardMaterial({color: 0x777777, roughness: 1.0});
        const platform = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 20), stoneMat);
        platform.position.y = 1;
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p1.position.set(-8, 8.5, -8);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p2.position.set(8, 8.5, -8);
        const p3 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p3.position.set(-8, 8.5, 8);
        const p4 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 15, 8), stoneMat); p4.position.set(8, 8.5, 8);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(22, 2, 22), stoneMat);
        roof.position.y = 17;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16, 0, Math.PI*2, 0, Math.PI/2), stoneMat);
        dome.position.y = 18;
        group.add(platform, p1, p2, p3, p4, roof, dome);
    }
    else if (type === 'corruption') {
        const darkMat = new THREE.MeshStandardMaterial({color: 0x110000, emissive: 0x330000, roughness: 0.1, metalness: 0.8});
        const spike = new THREE.Mesh(new THREE.ConeGeometry(4, 20, 5), darkMat);
        spike.position.y = 10;
        const floatSpike1 = new THREE.Mesh(new THREE.ConeGeometry(2, 10, 4), darkMat);
        floatSpike1.position.set(6, 12, 0); floatSpike1.rotation.z = Math.PI/6;
        const floatSpike2 = new THREE.Mesh(new THREE.ConeGeometry(2, 10, 4), darkMat);
        floatSpike2.position.set(-6, 15, 4); floatSpike2.rotation.z = -Math.PI/6;
        group.add(spike, floatSpike1, floatSpike2);
    }
    
    }"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open('src/world.js', 'w') as f:
        f.write(code)
    print("Added procedural props for the new interaction types.")
else:
    print("Could not find insertion point.")
