// Mock VSCode module for testing
export const commands = {
    registerCommand: jest.fn()
};

export const ProgressLocation = {
    Notification: 'NOTIFICATION'
};

export const window = {
    showInputBox: jest.fn(),
    showQuickPick: jest.fn(),
    showErrorMessage: jest.fn(),
    withProgress: jest.fn().mockImplementation((options, task) => {
        return task({
            report: jest.fn()
        });
    })
};

export const workspace = {
    workspaceFolders: []
};

export const Uri = {
    parse: jest.fn()
};

export const env = {
    openExternal: jest.fn()
};
