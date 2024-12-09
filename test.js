const { execSync } = require('child_process');
const path = require('path');

function runTests() {
    try {
        // Use Jest to run tests
        execSync('jest', {
            cwd: __dirname,
            stdio: 'inherit'
        });
    } catch (error) {
        console.error('Tests failed:', error);
        process.exit(1);
    }
}

runTests();
