const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const hudInsert = `
            <div id="hud-blessings">
                Blessings: <span id="val-blessings">0</span>/4
            </div>
            <div id="hud-objective" style="margin-top: 5px; font-size: 18px; color: #ffcc00; font-weight: bold; text-shadow: 1px 1px 2px black;">
                OBJECTIVE<br><span id="val-objective" style="color: #fff; font-size: 16px;">Speak to Ganapati</span>
            </div>
`;

code = code.replace(`
            <div id="hud-blessings">
                Blessings: <span id="val-blessings">0</span>/4
            </div>`, hudInsert);

fs.writeFileSync('index.html', code);
