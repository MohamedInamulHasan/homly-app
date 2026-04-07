const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated:', filePath);
    }
}

// 1. Replace "Gold Benefit" with "Free Delivery" in various files
const textReplacements = [
    'src/pages/Checkout.jsx',
    'src/pages/Cart.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/OrderDetails.jsx',
    'src/pages/ProductDetails.jsx'
];

textReplacements.forEach(file => {
    replaceFileContent(file, content => {
        return content
            .replace(/>Gold Benefit</g, '>Free Delivery<')
            .replace(/\{t\('Gold Benefit'\)\}/g, "{t('Free Delivery')}")
            .replace(/Gold Benefit/g, 'Free Delivery');
    });
});

// 2. Refactor ProductCard.jsx and SimpleProductCard.jsx
['src/components/ProductCard.jsx', 'src/components/SimpleProductCard.jsx'].forEach(file => {
    replaceFileContent(file, content => {
        
        let newContent = content.replace(/\$\{product\.isGold\s*\?\s*(['"`]).*?\1\s*:\s*(['"`])(.*?)\2\}/g, '$3');
        newContent = newContent.replace(/\(product\.isGold\s*\?\s*(['"`]).*?\1\s*:\s*(['"`])(.*?)\2\)/g, "'$3'");
        
        const tagHtml = `
                    {/* Free Delivery Tag */}
                    <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-[25] pointer-events-none">
                        {product.isGold && (
                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-br-lg shadow-md">
                                Free Delivery
                            </span>
                        )}
                    </div>`;
                    
        if (!newContent.includes('Free Delivery Tag')) {
            newContent = newContent.replace(/(<img\s*src=\{product\.image)/, tagHtml + '\n                    $1');
        }
        
        return newContent;
    });
});

console.log('Done!');
