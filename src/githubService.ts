import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import * as path from 'path';
import * as fs from 'fs';

export interface GitHubServiceConfig {
    githubToken: string;
    username?: string;
    defaultBranch?: string;
}

export class GitHubService {
    private octokit: Octokit;
    private config: GitHubServiceConfig;

    constructor(config: GitHubServiceConfig) {
        this.config = config;
        this.octokit = new Octokit({
            auth: config.githubToken
        });
    }

    async validateRepositoryName(repoName: string): Promise<boolean> {
        // Basic repository name validation
        const repoNameRegex = /^[a-zA-Z0-9_-]+$/;
        return repoNameRegex.test(repoName) && repoName.length > 0 && repoName.length <= 100;
    }

    async checkRepositoryExists(repoName: string, username?: string): Promise<boolean> {
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
        } catch (error: any) {
            if (error.status === 404) {
                return false;
            }
            throw error;
        }
    }

    async createRepository(repoName: string, isPrivate: boolean = true, description?: string): Promise<any> {
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

    async initializeLocalRepository(localPath: string): Promise<void> {
        const git = simpleGit(localPath);
        
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

    async pushToRemote(localPath: string, repoName: string, branch: string = 'main'): Promise<void> {
        const username = this.config.username;
        if (!username) {
            throw new Error('GitHub username not configured');
        }

        const git = simpleGit(localPath);

        // Add remote if not exists
        try {
            await git.addRemote('origin', `https://github.com/${username}/${repoName}.git`);
        } catch (error: any) {
            // If remote already exists, ignore the error
            if (!error.message.includes('remote origin already exists')) {
                throw error;
            }
        }

        // Push to remote
        await git.push('origin', branch);
    }

    async pushRepository(localPath: string, repoName: string, isPrivate: boolean = true): Promise<void> {
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
