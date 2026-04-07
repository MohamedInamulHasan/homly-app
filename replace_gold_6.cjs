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
        
        // Use a broader regex that matches anything looking like the span tag block containing Gold
        text = text.replace(/(<span className="bg-gradient-to-r from-[^"]+"[^>]*>)[\\s\\S]*?Gold[\\s\\S]*?(<\\/span>)/g, '$1\\n                                                        Free\\n                                                    $2');
        
        return text;
    });
});

console.log('Done script 6');
