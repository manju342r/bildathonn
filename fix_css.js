const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

// Replace the buggy loading screen CSS
css = css.replace(/#loading-screen \{\n    background: rgba\(20, 10, 0, 0\.95\);\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n\}/g, 
`#loading-screen {
    background: rgba(20, 10, 0, 0.95);
    flex-direction: column;
    justify-content: center;
    align-items: center;
}`);

fs.writeFileSync('css/style.css', css);
