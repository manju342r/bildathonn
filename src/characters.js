function createMooshak() {
    if (typeof modelCache !== 'undefined' && modelCache['mooshak']) {
        const model = modelCache['mooshak'];
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    }
    const group = new THREE.Group();
    
    // High-Detail Procedural Mooshak (Rat)
    const furMat = new THREE.MeshToonMaterial({ color: 0x666666, roughness: 0.9 });
    const pinkMat = new THREE.MeshToonMaterial({ color: 0xffaaaa, roughness: 0.6 });
    const blackMat = new THREE.MeshToonMaterial({ color: 0x111111, roughness: 0.1 });
    
    // Body (Teardrop-ish)
    const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.y = 1.2;
    body.scale.set(1, 0.8, 1.2);
    
    // Head
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.5, 32), furMat);
    head.position.set(0, 1.5, 1.8);
    head.rotation.x = Math.PI / 2;
    
    // Ears
    const earGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16);
    const earL = new THREE.Mesh(earGeo, furMat);
    earL.position.set(-0.8, 2.2, 1.2);
    earL.rotation.set(Math.PI/2, Math.PI/4, 0);
    const earR = new THREE.Mesh(earGeo, furMat);
    earR.position.set(0.8, 2.2, 1.2);
    earR.rotation.set(Math.PI/2, -Math.PI/4, 0);
    
    // Inner Ears
    const innerEarL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16), pinkMat);
    innerEarL.position.set(-0.8, 2.2, 1.2);
    innerEarL.rotation.set(Math.PI/2, Math.PI/4, 0);
    const innerEarR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16), pinkMat);
    innerEarR.position.set(0.8, 2.2, 1.2);
    innerEarR.rotation.set(Math.PI/2, -Math.PI/4, 0);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeo, blackMat);
    eyeL.position.set(-0.4, 1.8, 2.2);
    const eyeR = new THREE.Mesh(eyeGeo, blackMat);
    eyeR.position.set(0.4, 1.8, 2.2);
    
    // Nose tip
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), pinkMat);
    nose.position.set(0, 1.5, 3.0);
    
    // Tail
    class TailCurve extends THREE.Curve {
        getPoint(t, opt) {
            return (opt || new THREE.Vector3()).set(Math.sin(t*Math.PI)*1, Math.sin(t*Math.PI*0.5)*2, -t*4);
        }
    }
    const tailGeo = new THREE.TubeGeometry(new TailCurve(), 20, 0.12, 8, false);
    const tail = new THREE.Mesh(tailGeo, pinkMat);
    tail.position.set(0, 0.8, -1.2);
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.15, 1, 16);
    const legFR = new THREE.Mesh(legGeo, furMat); legFR.position.set(0.8, 0.5, 1);
    const legFL = new THREE.Mesh(legGeo, furMat); legFL.position.set(-0.8, 0.5, 1);
    const legBR = new THREE.Mesh(legGeo, furMat); legBR.position.set(0.8, 0.5, -1);
    const legBL = new THREE.Mesh(legGeo, furMat); legBL.position.set(-0.8, 0.5, -1);

    
    head.name = 'head';
    tail.name = 'tail';
    nose.name = 'nose';
    earL.name = 'earL';
    earR.name = 'earR';
    body.name = 'body';
    
    group.add(body, head, earL, earR, innerEarL, innerEarR, eyeL, eyeR, nose, tail);

    
    legFR.name = 'legFR';
    legFL.name = 'legFL';
    legBR.name = 'legBR';
    legBL.name = 'legBL';
    group.add(legFR, legFL, legBR, legBL);

    
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return group;
}

function createGanesha() {
    if (typeof modelCache !== 'undefined' && modelCache['ganesha']) {
        const model = modelCache['ganesha'];
        model.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
        return model;
    }
    const group = new THREE.Group();
    
    // High-Detail Procedural Ganesha
    const skinMat = new THREE.MeshToonMaterial({ color: 0xffa07a, roughness: 0.4 });
    const goldMat = new THREE.MeshToonMaterial({ map: Textures.Gold, metalness: 0.8, roughness: 0.2, color: 0xffcc00 });
    const clothMat = new THREE.MeshToonMaterial({ map: Textures.Cloth, color: 0xcc2222, roughness: 0.9 });
    const whiteMat = new THREE.MeshToonMaterial({ color: 0xffffff, roughness: 0.8 });
    
    // Belly / Body
    const belly = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), skinMat);
    belly.position.y = 3;
    belly.scale.set(1, 0.9, 1);
    
    // Dhoti (Lower garment)
    const dhoti = new THREE.Mesh(new THREE.SphereGeometry(3.1, 32, 16, 0, Math.PI*2, 0, Math.PI/2), clothMat);
    dhoti.position.y = 3;
    dhoti.rotation.x = Math.PI;
    
    // Chest
    const chest = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), skinMat);
    chest.position.y = 5.5;
    chest.scale.set(1, 0.8, 0.8);
    
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), skinMat);
    head.position.y = 8;
    
    // Trunk (Using a curve)
    class TrunkCurve extends THREE.Curve {
        getPoint(t, opt) {
            const tx = Math.sin(t * Math.PI) * 1.5;
            const ty = Math.cos(t * Math.PI * 0.5) * -4;
            const tz = Math.sin(t * Math.PI * 0.5) * 2;
            return (opt || new THREE.Vector3()).set(tx, ty, tz);
        }
    }
    const trunkGeo = new THREE.TubeGeometry(new TrunkCurve(), 20, 0.6, 8, false);
    const trunk = new THREE.Mesh(trunkGeo, skinMat);
    trunk.position.set(0, 8, 1.5);
    
    // Ears
    const earGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 32);
    const earL = new THREE.Mesh(earGeo, skinMat);
    earL.position.set(-2.5, 8.5, 0);
    earL.rotation.set(Math.PI/2, Math.PI/6, 0);
    const earR = new THREE.Mesh(earGeo, skinMat);
    earR.position.set(2.5, 8.5, 0);
    earR.rotation.set(Math.PI/2, -Math.PI/6, 0);
    
    // Crown (Mukut)
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.5, 32), goldMat);
    crownBase.position.y = 9.8;
    const crownMid = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.0, 1.5, 32), goldMat);
    crownMid.position.y = 10.8;
    const crownTop = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 32), goldMat);
    crownTop.position.y = 12.8;
    
    // Arms (4 Arms)
    const armGeo = new THREE.CylinderGeometry(0.5, 0.4, 3.5, 16);
    
    // Upper Right (Holding Modak)
    const armUR = new THREE.Mesh(armGeo, skinMat);
    armUR.position.set(-3.2, 6.5, 0);
    armUR.rotation.z = Math.PI/3;
    const modak = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 16), whiteMat);
    modak.position.set(-4.5, 7.5, 0);
    
    // Upper Left (Holding Lotus)
    const armUL = new THREE.Mesh(armGeo, skinMat);
    armUL.position.set(3.2, 6.5, 0);
    armUL.rotation.z = -Math.PI/3;
    const lotus = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), new THREE.MeshToonMaterial({color: 0xff66bb}));
    lotus.position.set(4.5, 7.5, 0);
    
    // Lower Right (Blessing posture)
    const armLR = new THREE.Mesh(armGeo, skinMat);
    armLR.position.set(-2.8, 4.5, 1);
    armLR.rotation.x = Math.PI/3;
    armLR.rotation.z = Math.PI/6;
    
    // Lower Left (Resting)
    const armLL = new THREE.Mesh(armGeo, skinMat);
    armLL.position.set(2.8, 4.5, 1);
    armLL.rotation.x = Math.PI/3;
    armLL.rotation.z = -Math.PI/6;
    
    // Tusks (One Broken)
    const tuskGeo = new THREE.ConeGeometry(0.15, 1, 16);
    const tuskL = new THREE.Mesh(tuskGeo, whiteMat); // Intact
    tuskL.position.set(-0.8, 7.5, 2);
    tuskL.rotation.set(Math.PI/2, 0, Math.PI/6);
    
    const tuskR = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 16), whiteMat); // Broken
    tuskR.position.set(0.8, 7.5, 2);
    tuskR.rotation.set(Math.PI/2, 0, -Math.PI/6);

    group.add(belly, dhoti, chest, head, trunk, earL, earR, crownBase, crownMid, crownTop);
    group.add(armUR, modak, armUL, lotus, armLR, armLL, tuskL, tuskR);
    
    group.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    return group;
}
