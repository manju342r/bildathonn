const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

// Just stub out startQuiz so it doesn't crash
const stub = `
function startQuiz() {
    console.log("Quiz not yet implemented");
}
`;

content = stub + '\n' + content;
fs.writeFileSync('src/main.js', content);
