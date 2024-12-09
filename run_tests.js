const Mocha = require('mocha');
const path = require('path');
const glob = require('glob');

function run() {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, 'out/test/suite');

    return new Promise((resolve, reject) => {
        // Use synchronous glob
        const testFiles = glob.sync('**/*.test.js', { cwd: testsRoot });
        
        // Add files to the test suite
        testFiles.forEach(f => {
            console.log(`Adding test file: ${f}`);
            mocha.addFile(path.resolve(testsRoot, f));
        });

        try {
            // Run the mocha test
            mocha.run(failures => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error('Test execution error:', err);
            reject(err);
        }
    });
}

run().catch(console.error);
