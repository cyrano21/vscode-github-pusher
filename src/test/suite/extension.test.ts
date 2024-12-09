import * as assert from 'assert';
import * as sinon from 'sinon';
import { activate } from '../../extension';
import * as vscode from '../mocks/vscode';

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
        } as any;

        // Activate extension
        activate(mockContext);

        // Verify command registration
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(1);
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
            'githubPusher.pushRepository',
            expect.any(Function)
        );
    });

    it('should handle repository push workflow', async () => {
        const mockContext = {
            subscriptions: [],
            secrets: {
                store: sinon.stub()
            }
        } as any;

        // Mock workspace folder
        vscode.workspace.workspaceFolders = [{
            uri: {
                fsPath: '/mock/repo/path'
            }
        }];

        // Simulate user inputs
        vscode.window.showInputBox
            .mockResolvedValueOnce('mock_github_token')  // GitHub token
            .mockResolvedValueOnce('testuser')           // GitHub username
            .mockResolvedValueOnce('test-repo');         // Repository name

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
        activate(mockContext);

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
        } as any;

        // Mock no workspace folders
        vscode.workspace.workspaceFolders = [];

        // Activate extension
        activate(mockContext);

        // Trigger command
        const commandHandler = vscode.commands.registerCommand.mock.calls[0][1];
        await commandHandler();

        // Verify error message
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('No workspace folder is open.');
    });
});
