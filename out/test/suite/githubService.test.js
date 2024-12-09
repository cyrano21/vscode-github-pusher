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
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const githubService_1 = require("../../githubService");
describe('GitHubService', () => {
    const mockToken = 'mock_github_token';
    const mockUsername = 'testuser';
    let githubService;
    beforeEach(() => {
        githubService = new githubService_1.GitHubService({
            githubToken: mockToken,
            username: mockUsername
        });
    });
    describe('validateRepositoryName', () => {
        it('should validate repository names correctly', async () => {
            const validNames = ['my-repo', 'repo123', 'valid_repo'];
            const invalidNames = ['', 'repo with spaces', 'Repo!@#', 'a'.repeat(101)];
            for (const name of validNames) {
                assert.strictEqual(await githubService['validateRepositoryName'](name), true, `${name} should be valid`);
            }
            for (const name of invalidNames) {
                assert.strictEqual(await githubService['validateRepositoryName'](name), false, `${name} should be invalid`);
            }
        });
    });
    describe('checkRepositoryExists', () => {
        it('should check repository existence', async () => {
            const mockOctokit = {
                repos: {
                    get: sinon.stub()
                }
            };
            // Stub the Octokit method to simulate repository existence
            mockOctokit.repos.get.withArgs({
                owner: mockUsername,
                repo: 'existing-repo'
            }).resolves({});
            mockOctokit.repos.get.withArgs({
                owner: mockUsername,
                repo: 'non-existing-repo'
            }).throws({ status: 404 });
            // Replace the service's Octokit with the mock
            githubService.octokit = mockOctokit;
            const existingRepoResult = await githubService.checkRepositoryExists('existing-repo');
            const nonExistingRepoResult = await githubService.checkRepositoryExists('non-existing-repo');
            assert.strictEqual(existingRepoResult, true);
            assert.strictEqual(nonExistingRepoResult, false);
        });
    });
    describe('createRepository', () => {
        it('should create a repository successfully', async () => {
            const mockOctokit = {
                repos: {
                    get: sinon.stub().throws({ status: 404 }),
                    createForAuthenticatedUser: sinon.stub().resolves({
                        name: 'new-repo',
                        private: true
                    })
                }
            };
            // Replace the service's Octokit with the mock
            githubService.octokit = mockOctokit;
            const result = await githubService.createRepository('new-repo');
            assert.deepStrictEqual(result, {
                name: 'new-repo',
                private: true
            });
            // Verify that Octokit methods were called
            sinon.assert.calledWith(mockOctokit.repos.createForAuthenticatedUser, {
                name: 'new-repo',
                private: true,
                description: 'Repository new-repo created via GitHub Pusher'
            });
        });
        it('should throw error for invalid repository name', async () => {
            await assert.rejects(githubService.createRepository('invalid repo'), { message: 'Invalid repository name' });
        });
        it('should throw error for existing repository', async () => {
            const mockOctokit = {
                repos: {
                    get: sinon.stub().resolves({}),
                    createForAuthenticatedUser: sinon.stub()
                }
            };
            // Replace the service's Octokit with the mock
            githubService.octokit = mockOctokit;
            await assert.rejects(githubService.createRepository('existing-repo'), { message: 'Repository existing-repo already exists' });
        });
    });
});
//# sourceMappingURL=githubService.test.js.map