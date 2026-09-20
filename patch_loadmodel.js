const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const targetSizeLogic = `const targetSize = name === 'ganesha' ? 60 : 5;`;
const newTargetSizeLogic = `const targetSize = name === 'ganesha' ? 60 : (name === 'banasura' ? 45 : 5);`;
code = code.replace(targetSizeLogic, newTargetSizeLogic);

const promiseList = `        loadModel('ganesha', 'assets/ganesha.glb'),
        loadModel('mooshak', 'assets/mooshak.glb'),
        loadModel('modak', 'assets/modak.glb'),
        loadModel('flag', 'assets/flag.glb')`;
const newPromiseList = `        loadModel('ganesha', 'assets/ganesha.glb'),
        loadModel('mooshak', 'assets/mooshak.glb'),
        loadModel('modak', 'assets/modak.glb'),
        loadModel('flag', 'assets/flag.glb'),
        loadModel('banasura', 'assets/banasura.glb')`;
code = code.replace(promiseList, newPromiseList);

fs.writeFileSync('src/main.js', code);
