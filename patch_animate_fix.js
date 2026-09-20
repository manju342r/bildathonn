const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

const oldLine = "let speed = Math.sqrt(velocityX*velocityX + velocityZ*velocityZ);";
const newLine = `
            let isRunning = (typeof dx !== 'undefined') ? (dx !== 0 || dz !== 0) : false;
            let velocityY = (typeof window.playerVelocityY !== 'undefined') ? window.playerVelocityY : 0;
            // The isGrounded check needs groundY
            let isGrounded = (typeof groundY !== 'undefined') ? (player.position.y <= groundY + 0.5) : true;
`;

content = content.replace(oldLine, newLine);
content = content.replace("if (speed > 5) { // Running", "if (isRunning) { // Running");

fs.writeFileSync('src/main.js', content);
