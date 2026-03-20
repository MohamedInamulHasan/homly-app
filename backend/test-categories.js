

const testFetchCategories = async () => {
    try {
        console.log('Testing category fetch...');
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Success:', data.success);
        console.log('Count:', data.count);
        console.log('Data:', JSON.stringify(data.data, null, 2));
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

testFetchCategories();
