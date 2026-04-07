const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated Text Color:', filePath);
    }
}

const filesWithTextColor = [
    'src/pages/Cart.jsx',
    'src/pages/Checkout.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/OrderDetails.jsx'
];

filesWithTextColor.forEach(file => {
    replaceFileContent(file, content => {
        let lines = content.split('\\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('text-yellow-600') && lines[i].includes('font-bold')) {
                lines[i] = lines[i]
                    .replace('text-yellow-600', 'text-emerald-600')
                    .replace('text-yellow-400', 'text-emerald-500');
            }
        }
        return lines.join('\\n');
    });
});

const filesWithGradients = [
    'src/pages/Orders.jsx',
    'src/pages/ProductDetails.jsx'
];

filesWithGradients.forEach(file => {
    replaceFileContent(file, content => {
        let text = content.replace(/from-yellow-400 to-yellow-600/g, 'from-emerald-500 to-teal-500');
        text = text.replace(/>Gold Benefit</g, '>Free Delivery<')
                   .replace(/\\{t\\('Gold Benefit'\\)\\}/g, "{t('Free Delivery')}")
                   .replace(/Gold Benefit/g, 'Free Delivery');
        return text;
    });
});

console.log('Done script 3');
