/**
 * GitHubAPI - Wraper to upload binary files to GitHub repo
 * Uses the modified GitHub library under the hood and exposes it as `gh` property for get instance of all methods
 * @note:
 *   -- inspired at article: @see <https://medium.freecodecamp.org/pushing-a-list-of-files-to-the-github-with-javascript-b724c8c09b66>
 *   -- issue (not yet resolved): @see issue <https://github.com/github-tools/github/issues/417>
 * @copyright Copyright (c) 2020 Lauro Moraes <https://github.com/subversivo58>
 * @license MIT License <https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE>
 */
import GitHub from '../vendor/GitHub.bundle.mjs';

const GitHubAPI = function(auth) {
    let repo,
        currentBranch = {},
        gh = new GitHub(auth)

    /**
     * Get current instance of GitHub library (very suggestive method name)
     * @public
     * @return {Object} instanceof GitHub
     */
    this.GHInstance = gh

    /**
     * Sets the current repository to make push to
     * @public
     * @param {string} userName Name of the user who owns the repository
     * @param {string} repoName Name of the repository
     * @return void
     */
    this.setRepo = (userName, repoName) => {
        repo = gh.getRepo(userName, repoName)
    }

    /**
     * Sets the current branch to make push to. If the branch doesn't exist yet,
     * it will be created first (from `baseBranch`, or from the repository default branch)
     * @public
     * @param {string} branchName The name of the branch
     * @param {string} [baseBranch] Branch used as the starting point when creating a new one
     * @return {Promise}
     */
    this.setBranch = (branchName, baseBranch) => {
        if ( !repo ) {
            return Promise.reject(new Error('Repository is not initialized'))
        }
        // the branch exists? (404 means "no")
        return repo.getRef('heads/' + branchName).then(() => true, error => {
            if ( error && error.response && error.response.status === 404 ) {
                return false
            }
            throw error
        }).then(exists => {
            if ( exists ) {
                currentBranch.name = branchName
                return
            }
            // "main" or "master" ... whatever the repository uses
            const base = baseBranch
                ? Promise.resolve(baseBranch)
                : repo.getDetails().then(details => details.data.default_branch)
            return base.then(name => repo.createBranch(name, branchName)).then(() => {
                currentBranch.name = branchName
            })
        })
    }

    /**
     * Makes the push to the currently set branch (one commit for all files)
     * @public
     * @param  {string}   message Message of the commit
     * @param  {object[]} files   Array of objects, containing data to push:
     *                            - create/update a file: {path, content}
     *                            - delete a file:        {path, delete: true}
     * @return {Promise}          Rejects if any step fails (the error is also logged)
     */
    this.pushFiles = (message, files) => {
        if ( !repo ) {
            return Promise.reject(new Error('Repository is not initialized'))
        }
        if ( !currentBranch.hasOwnProperty('name') ) {
            return Promise.reject(new Error('Branch is not set'))
        }
        if ( !Array.isArray(files) || files.length === 0 ) {
            return Promise.reject(new Error('"files" must be a non-empty Array'))
        }
        // state of THIS push (never shared between calls)
        const branch = currentBranch.name,
              state  = { commitSHA: null, treeSHA: null, entries: [] }

        return repo.getRef('heads/' + branch).then(ref => {
            state.commitSHA = ref.data.object.sha
            return repo.getCommit(state.commitSHA)
        }).then(commit => {
            state.treeSHA = commit.data.tree.sha
            return Promise.all(files.map(file => createEntry(file, state)))
        }).then(() => {
            return repo.createTree(state.entries, state.treeSHA)
        }).then(tree => {
            return repo.commit(state.commitSHA, tree.data.sha, message)
        }).then(commit => {
            return repo.updateHead('heads/' + branch, commit.data.sha)
        }).catch(error => {
            console.error(error)
            throw error
        })
    }

    /**
     * Adds one entry to the new tree: a blob (create/update) or a deletion
     * @private
     * @param  {object} fileInfo {path, content} or {path, delete: true}
     * @param  {object} state    state of the current push
     * @return {Promise}
     */
    const createEntry = (fileInfo, state) => {
        if ( fileInfo.delete === true ) {
            // `sha: null` removes the file from the tree
            state.entries.push({
                path: fileInfo.path,
                mode: '100644',
                type: 'blob',
                sha: null
            })
            return Promise.resolve()
        }
        return repo.createBlob(fileInfo.content).then(blob => {
            state.entries.push({
                sha: blob.data.sha,
                path: fileInfo.path,
                mode: '100644',
                type: 'blob'
            })
        })
    }
}

export default GitHubAPI;
