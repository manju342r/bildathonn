const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

const injection = `
function setObjective(text) { 
    const elDesc = document.getElementById('quest-desc'); 
    const elTitle = document.getElementById('quest-title');
    if(elTitle) elTitle.innerText = "CURRENT OBJECTIVE";
    if(elDesc) elDesc.innerText = text; 
}
`;

content = injection + '\n' + content;
fs.writeFileSync('src/main.js', content);
