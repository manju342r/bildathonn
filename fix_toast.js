const fs = require('fs');
let code = fs.readFileSync('src/main.js', 'utf8');

const toastFunc = `
function showToast(text) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'absolute';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(0,0,0,0.8)';
        toast.style.color = '#ffcc00';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.fontSize = '24px';
        toast.style.fontWeight = 'bold';
        document.body.appendChild(toast);
    }
    toast.innerText = text;
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    toast.style.display = 'block';
}
`;

code = code.replace('// Audio context', toastFunc + '\n// Audio context');

code = code.replace("localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x);", "localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x); showToast('Ganesha Scale: ' + modelCache['ganesha'].scale.x.toFixed(3));");
code = code.replace("localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x);", "localStorage.setItem('ganeshaScale', modelCache['ganesha'].scale.x); showToast('Ganesha Scale: ' + modelCache['ganesha'].scale.x.toFixed(3));");

code = code.replace("localStorage.setItem('mooshakScale', player.scale.x);", "localStorage.setItem('mooshakScale', player.scale.x); showToast('Mooshak Scale: ' + player.scale.x.toFixed(3));");
code = code.replace("localStorage.setItem('mooshakScale', player.scale.x);", "localStorage.setItem('mooshakScale', player.scale.x); showToast('Mooshak Scale: ' + player.scale.x.toFixed(3));");

fs.writeFileSync('src/main.js', code);
