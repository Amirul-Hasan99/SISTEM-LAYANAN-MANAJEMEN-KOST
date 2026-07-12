const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'frontend', 'src'));
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('${process.env.NEXT_PUBLIC_API_URL}')) {
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g, '');
        fs.writeFileSync(file, content);
        changed++;
        console.log('Fixed:', file);
    }
});

console.log('Total files changed:', changed);
