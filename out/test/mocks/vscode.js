"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.Uri = exports.workspace = exports.window = exports.ProgressLocation = exports.commands = void 0;
// Mock VSCode module for testing
exports.commands = {
    registerCommand: jest.fn()
};
exports.ProgressLocation = {
    Notification: 'NOTIFICATION'
};
exports.window = {
    showInputBox: jest.fn(),
    showQuickPick: jest.fn(),
    showErrorMessage: jest.fn(),
    withProgress: jest.fn().mockImplementation((options, task) => {
        return task({
            report: jest.fn()
        });
    })
};
exports.workspace = {
    workspaceFolders: []
};
exports.Uri = {
    parse: jest.fn()
};
exports.env = {
    openExternal: jest.fn()
};
//# sourceMappingURL=vscode.js.map