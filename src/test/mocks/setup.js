// Setup file for Jest mocks
global.jest = require('jest-mock');
global.expect = require('expect');

// Stub out VSCode module
const mockVscode = require('./vscode');
jest.mock('vscode', () => mockVscode);
