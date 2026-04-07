const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = replacer(content);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated:', filePath);
    }
}

// 1. Replace text-yellow-600 dark:text-yellow-400 with text-emerald-600 dark:text-emerald-400 EXACTLY where it is used for Free Delivery (which we already replaced text "Gold Benefit" to "Free Delivery", so we can just look for the elements containing Free Delivery and adjust their parent tags).
// Since Free Delivery is near ⚡, let's use a regex to find those paragraph lines.

const filesWithTextColor = [
    'src/pages/Cart.jsx',
    'src/pages/Checkout.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/OrderDetails.jsx'
];

filesWithTextColor.forEach(file => {
    replaceFileContent(file, content => {
        // Find: <p className="... text-yellow-600 dark:text-yellow-400 ..."> \s* <span>⚡</span> Free Delivery \s* </p>
        return content.replace(
            /(<p className="[^"]*)text-yellow-600 dark:text-yellow-400([^"]*">[\s\S]*?<span>⚡<\/span>\s*\{?t\('Free Delivery'\)\}?|\s*Free Delivery[\s\S]*?<\/p>)/g,
            '$1text-emerald-600 dark:text-emerald-400$2'
        );
    });
});

// 2. Also fix the background gradient for Orders.jsx and ProductDetails.jsx tags
const filesWithGradients = [
    'src/pages/Orders.jsx',
    'src/pages/ProductDetails.jsx'
];

filesWithGradients.forEach(file => {
    replaceFileContent(file, content => {
        let text = content.replace(/from-yellow-400 to-yellow-600/g, 'from-emerald-500 to-teal-500');
        // also replace Gold Benefit text with Free Delivery in Orders.jsx
        text = text.replace(/>Gold Benefit</g, '>Free Delivery<')
                   .replace(/\{t\('Gold Benefit'\)\}/g, "{t('Free Delivery')}")
                   .replace(/Gold Benefit/g, 'Free Delivery');
        return text;
    });
});

console.log('Done script 3');
