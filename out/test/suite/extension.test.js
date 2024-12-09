"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = __importStar(require("sinon"));
const extension_1 = require("../../extension");
const vscode = __importStar(require("../mocks/vscode"));
describe('GitHub Pusher Extension', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        Object.keys(vscode.commands).forEach(key => {
            if (typeof vscode.commands[key].mockReset === 'function') {
                vscode.commands[key].mockReset();
            }
        });
        Object.keys(vscode.window).forEach(key => {
            if (typeof vscode.window[key].mockReset === 'function') {
                vscode.window[key].mockReset();
            }
        });
        vscode.workspace.workspaceFolders = [];
        vscode.Uri.parse.mockReset();
        vscode.env.openExternal.mockReset();
    });
    it('should register GitHub Pusher command', () => {
        const mockContext = {
            subscriptions: [],
            secrets: {
                store: sinon.stub()
            }
        };
        // Activate extension
        (0, extension_1.activate)(mockContext);
        // Verify command registration
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(1);
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith('githubPusher.pushRepository', expect.any(Function));
    });
    it('should handle repository push workflow', async () => {
        const mockContext = {
            subscriptions: [],
            secrets: {
                store: sinon.stub()
            }
        };
        // Mock workspace folder
        vscode.workspace.workspaceFolders = [{
                uri: {
                    fsPath: '/mock/repo/path'
                }
            }];
        // Simulate user inputs
        vscode.window.showInputBox
            .mockResolvedValueOnce('mock_github_token') // GitHub token
            .mockResolvedValueOnce('testuser') // GitHub username
            .mockResolvedValueOnce('test-repo'); // Repository name
        // Simulate repository visibility selection
        vscode.window.showQuickPick.mockResolvedValueOnce({ label: 'Private', value: true });
        // Simulate progress window with expected arguments
        vscode.window.withProgress.mockImplementation(async (options, task) => {
            expect(options.location).toBe(vscode.ProgressLocation.Notification);
            expect(options.title).toBe('Pushing Repository to GitHub');
            expect(options.cancellable).toBe(false);
            return task({
                report: jest.fn()
            });
        });
        // Activate extension
        (0, extension_1.activate)(mockContext);
        // Trigger command
        const commandHandler = vscode.commands.registerCommand.mock.calls[0][1];
        await commandHandler();
        // Verify user interaction
        expect(vscode.window.showInputBox).toHaveBeenCalledTimes(3);
        expect(vscode.window.showQuickPick).toHaveBeenCalledTimes(1);
        expect(vscode.window.withProgress).toHaveBeenCalledTimes(1);
    });
    it('should handle no workspace folder scenario', async () => {
        const mockContext = {
            subscriptions: [],
            secrets: {
                store: sinon.stub()
            }
        };
        // Mock no workspace folders
        vscode.workspace.workspaceFolders = [];
        // Activate extension
        (0, extension_1.activate)(mockContext);
        // Trigger command
        const commandHandler = vscode.commands.registerCommand.mock.calls[0][1];
        await commandHandler();
        // Verify error message
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder is open.');
    });
});
//# sourceMappingURL=extension.test.js.map