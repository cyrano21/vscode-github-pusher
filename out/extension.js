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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const githubService_1 = require("./githubService");
function activate(context) {
    let disposable = vscode.commands.registerCommand('githubPusher.pushRepository', async () => {
        try {
            // Get the currently open workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder is open.');
                return;
            }
            const workspaceFolder = workspaceFolders[0];
            const repoPath = workspaceFolder.uri.fsPath;
            // Prompt for GitHub token
            const githubToken = await vscode.window.showInputBox({
                prompt: 'Enter your GitHub Personal Access Token',
                ignoreFocusOut: true,
                password: true
            });
            if (!githubToken) {
                vscode.window.showErrorMessage('GitHub token is required.');
                return;
            }
            // Prompt for GitHub username
            const githubUsername = await vscode.window.showInputBox({
                prompt: 'Enter your GitHub Username',
                ignoreFocusOut: true
            });
            if (!githubUsername) {
                vscode.window.showErrorMessage('GitHub username is required.');
                return;
            }
            // Prompt for repository name
            const repoName = await vscode.window.showInputBox({
                prompt: 'Enter the name for your new GitHub repository',
                ignoreFocusOut: true,
                validateInput: (value) => {
                    const validNameRegex = /^[a-z0-9_-]+$/i;
                    return !value || !validNameRegex.test(value)
                        ? 'Repository name must contain only alphanumeric characters, hyphens, and underscores'
                        : null;
                }
            });
            if (!repoName) {
                vscode.window.showErrorMessage('Repository name is required.');
                return;
            }
            // Prompt for repository visibility
            const isPrivate = await vscode.window.showQuickPick([
                { label: 'Private', value: true },
                { label: 'Public', value: false }
            ], {
                placeHolder: 'Select repository visibility',
                ignoreFocusOut: true
            });
            if (isPrivate === undefined) {
                vscode.window.showErrorMessage('Repository visibility must be selected.');
                return;
            }
            // Create GitHub service
            const githubService = new githubService_1.GitHubService({
                githubToken,
                username: githubUsername
            });
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Pushing Repository to GitHub',
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ increment: 25, message: 'Creating repository...' });
                    // Create repository
                    await githubService.createRepository(repoName, isPrivate.value);
                    progress.report({ increment: 25, message: 'Initializing local repository...' });
                    // Initialize and push repository
                    await githubService.pushRepository(repoPath, repoName, isPrivate.value);
                    progress.report({ increment: 50, message: 'Repository pushed successfully!' });
                    // Show success message with repository link
                    vscode.window.showInformationMessage(`Repository ${repoName} created and pushed successfully!`, 'Open on GitHub').then(selection => {
                        if (selection) {
                            vscode.env.openExternal(vscode.Uri.parse(`https://github.com/${githubUsername}/${repoName}`));
                        }
                    });
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to push repository: ${error.message}`);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`GitHub Pusher Error: ${error.message}`);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    // Cleanup logic if needed
}
//# sourceMappingURL=extension.js.map