module.exports = {
    extension: ['ts'],
    spec: 'src/test/suite/**/*.test.ts',
    require: [
        'ts-node/register'
    ],
    timeout: 10000,
    ui: 'bdd',
    reporter: 'spec'
};
