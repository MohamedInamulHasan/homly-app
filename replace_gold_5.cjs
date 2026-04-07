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
    'src/pages/OrderDetails.jsx',
    'src/pages/Orders.jsx',
    'src/pages/ProductDetails.jsx'
];

targetFiles.forEach(file => {
    replaceFileContent(file, content => {
        let text = content;
        
        // This targets both raw text '>Gold<' and translation function '{t('Gold')}'
        text = text.replace(/>\\s*Gold\\s*</g, '>Free<');
        text = text.replace(/\{t\('Gold'\)\}/g, "{t('Free')}");
        
        return text;
    });
});

console.log('Done script 5');
