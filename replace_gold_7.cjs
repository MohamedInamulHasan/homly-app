const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated Gold text:', filePath);
    }
}

const targetFiles = [
    'src/pages/Cart.jsx',
    'src/pages/Checkout.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/Orders.jsx'
];

targetFiles.forEach(file => {
    replaceFileContent(file, content => {
        let text = content;
        
        // Match the gold tag element and safely replace its interior with 'Free'
        text = text.replace(/(<span[^>]*bg-gradient-to-r from-emerald-500[^>]*>)[\\s\\S]*?Gold[\\s\\S]*?(<\\/span>)/g, '$1\\n                                                        Free\\n                                                    $2');
        
        return text;
    });
});

console.log('Done script 7');
