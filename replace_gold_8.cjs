const fs = require('fs');

const targetFiles = [
    'src/pages/Cart.jsx',
    'src/pages/Checkout.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/Orders.jsx'
];

targetFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, 'utf8');
    
    // Using RegExp object to avoid escape character issues in regex literals
    const regex = new RegExp('(<span[^>]*from-emerald-500[^>]*>)[\\\\s\\\\S]*?Gold[\\\\s\\\\S]*?(<\\\\/span>)', 'g');
    
    let newText = text.replace(regex, '$1\\n                                                        Free\\n                                                    $2');
    
    if (text !== newText) {
        fs.writeFileSync(file, newText, 'utf8');
        console.log('Updated Gold text:', file);
    }
});

console.log('Done script 8');
