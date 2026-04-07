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

// 1. Convert tags from yellow to green
const tagGradientOld = 'bg-gradient-to-r from-yellow-400 to-yellow-600';
const tagGradientNew = 'bg-gradient-to-r from-emerald-500 to-teal-600';

const filesWithTags = [
    'src/pages/Cart.jsx',
    'src/pages/Checkout.jsx',
    'src/pages/OrderConfirmation.jsx',
    'src/pages/OrderDetails.jsx',
    'src/components/ProductCard.jsx',
    'src/components/SimpleProductCard.jsx'
];

filesWithTags.forEach(file => {
    replaceFileContent(file, content => {
        return content.replace(/from-yellow-400 to-yellow-600/g, 'from-emerald-500 to-teal-500');
    });
});

// 2. Fix the missing tag in SimpleProductCard and ProductCard
['src/components/ProductCard.jsx', 'src/components/SimpleProductCard.jsx'].forEach(file => {
    replaceFileContent(file, content => {
        let text = content;
        
        // Remove ALL multi-line ternaries for isGold
        // ProductCard has:
        // className={`...  ${product.isGold \n ? 'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 dark:from-yellow-600 dark:via-yellow-400 dark:to-yellow-700 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] border border-yellow-400 dark:border-yellow-500 transform hover:-translate-y-1' \n : 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700'} ...
        
        text = text.replace(/\$\{product\.isGold\s*[\n\r]*\s*\?\s*'[^']*'\s*[\n\r]*\s*:\s*'([^']*)'\s*[\n\r]*\}/g, '$1');
        
        // Let's manually replace remaining interpolations in other formats:
        // ${product.isGold \n ? '...' : '...'}
        // For ProductCard line 45:
        text = text.replace(/\$\{product\.isGold[\s\S]*?\?'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 dark:from-yellow-600 dark:via-yellow-400 dark:to-yellow-700 shadow-\[0_0_15px_rgba\(250,204,21,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(250,204,21,0\.5\)\] border border-yellow-400 dark:border-yellow-500 transform hover:-translate-y-1'[\s\S]*?:'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700'[\s\S]*?\}/g, 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700');
        
        text = text.replace(/\$\{product\.isGold[\s\S]*?\?'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 dark:from-yellow-600 dark:via-yellow-400 dark:to-yellow-700 shadow-\[0_0_15px_rgba\(250,204,21,0\.3\)\] hover:shadow-\[0_0_25px_rgba\(250,204,21,0\.5\)\] border border-yellow-400 dark:border-yellow-500 transform hover:-translate-y-1'[\s\S]*?:'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'[\s\S]*?\}/g, 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700');
        
        // Also cleanup remaining `isGold` instances in className lines safely:
        text = text.replace(/\$\{product\.isGold\s*\n\s*\?\s*'[^']+'\s*\n\s*:\s*'([^']+)'\s*\n?\s*\}/g, '$1');
        
        // Insert the missing tag on any <img that is under <div className={`relative pb-[100%]
        // But do it via match so we inject exactly before the img tags inside pb-[100%] wrappers.
        const tagHtml = `
                    <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-[25] pointer-events-none">
                        {product.isGold && (
                            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-br-lg shadow-md">
                                Free Delivery
                            </span>
                        )}
                    </div>`;
                    
        // For ProductCard, the normal card img starts with <img\s*src={product.image 
        // We missed it because the first one was ProductCard.jsx (only one img). 
        // Oh wait, in ProductCard there's only ONE image because it doesn't handle groups inside the same component!
        // But wait, my script actually ran. Did it update ProductCard correctly? I will check.
        // Let's just do global replace for ANY `pb-[100%]` wrapper `div` that doesn't have the tag.
        text = text.replace(/(<div className=\{`relative pb-\[100%\] overflow-hidden [^>]+>)\s*(?![\s\S]*?Free Delivery Tag)(<img)/g, `$1\n${tagHtml}\n                    $2`);
        
        // Also for standard: <div className={`relative pb-[100%] overflow-hidden bg-white`}>
        text = text.replace(/(<div className=\{`relative pb-\[100%\] overflow-hidden bg-white`>)\s*(<img)/g, `$1\n${tagHtml}\n                    $2`);
        
        // Fix Cart Quantity Badges overlapping / keeping isGold ternaries
        text = text.replace(/\$\{product\.isGold[\n\s]*\?[\n\s]*'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'[\n\s]*:[\n\s]*'(bg-blue-600|bg-gradient-to-br from-blue-600 to-indigo-600)'[\n\s]*\}/g, '$1');
        
        // Fix Heart button
        text = text.replace(/\$\{product\.isGold[\n\s]*\?[\n\s]*'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600'[\n\s]*:[\n\s]*'(bg-white\/80 dark:bg-black\/40 hover:bg-white dark:hover:bg-black\/60)'[\n\s]*\}/g, '$1');

        text = text.replace(/\$\{product\.isGold \? 'text-slate-200' : 'text-white'\}/g, 'text-white');

        return text;
    });
});

console.log('Done script');
