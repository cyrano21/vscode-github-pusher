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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
const simple_git_1 = __importDefault(require("simple-git"));
const fs = __importStar(require("fs"));
class GitHubService {
    constructor(config) {
        this.config = config;
        this.octokit = new rest_1.Octokit({
            auth: config.githubToken
        });
    }
    async validateRepositoryName(repoName) {
        // Basic repository name validation
        const repoNameRegex = /^[a-zA-Z0-9_-]+$/;
        return repoNameRegex.test(repoName) && repoName.length > 0 && repoName.length <= 100;
    }
    async checkRepositoryExists(repoName, username) {
        const owner = username || this.config.username;
        if (!owner) {
            throw new Error('GitHub username not provided');
        }
        try {
            await this.octokit.repos.get({
                owner,
                repo: repoName
            });
            return true;
        }
        catch (error) {
            if (error.status === 404) {
                return false;
            }
            throw error;
        }
    }
    async createRepository(repoName, isPrivate = true, description) {
        if (!await this.validateRepositoryName(repoName)) {
            throw new Error('Invalid repository name');
        }
        if (await this.checkRepositoryExists(repoName)) {
            throw new Error(`Repository ${repoName} already exists`);
        }
        const username = this.config.username;
        if (!username) {
            throw new Error('GitHub username not configured');
        }
        return this.octokit.repos.createForAuthenticatedUser({
            name: repoName,
            private: isPrivate,
            description: description || `Repository ${repoName} created via GitHub Pusher`
        });
    }
    async initializeLocalRepository(localPath) {
        const git = (0, simple_git_1.default)(localPath);
        // Check if it's already a git repository
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            await git.init();
        }
        // Add all files
        await git.add('.');
        // Commit with a default message
        await git.commit('Initial commit');
    }
    async pushToRemote(localPath, repoName, branch = 'main') {
        const username = this.config.username;
        if (!username) {
            throw new Error('GitHub username not configured');
        }
        const git = (0, simple_git_1.default)(localPath);
        // Add remote if not exists
        try {
            await git.addRemote('origin', `https://github.com/${username}/${repoName}.git`);
        }
        catch (error) {
            // If remote already exists, ignore the error
            if (!error.message.includes('remote origin already exists')) {
                throw error;
            }
        }
        // Push to remote
        await git.push('origin', branch);
    }
    async pushRepository(localPath, repoName, isPrivate = true) {
        // Validate local path
        if (!fs.existsSync(localPath)) {
            throw new Error('Local repository path does not exist');
        }
        // Create repository
        await this.createRepository(repoName, isPrivate);
        // Initialize local repository
        await this.initializeLocalRepository(localPath);
        // Push to remote
        await this.pushToRemote(localPath, repoName);
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=githubService.js.map