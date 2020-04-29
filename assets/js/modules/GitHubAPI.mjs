/**
 * GitHubAPI - Wraper to upload binary files to GitHub repo
 * Uses the modified GitHub library under the hood and exposes it as `gh` property for get instance of all methods
 * @note:
 *   -- inspired at article: @see <https://medium.freecodecamp.org/pushing-a-list-of-files-to-the-github-with-javascript-b724c8c09b66>
 *   -- issue (not yet resolved): @see issue <https://github.com/github-tools/github/issues/417>
 * @copyright Copyright (c) 2020 Lauro Moraes <https://github.com/subversivo58>
 * @license MIT License <https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE>
 */
import GitHub from './GitHub.bundle.mjs';
const GitHubAPI = function(auth) {
    let repo,
        filesToCommit = [],
        currentBranch = {},
        newCommit = {},
        //the underlying library for making requests
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
     * it will be created first
     * @public
     * @param {string} branchName The name of the branch
     * @return {Promise}
     */
    this.setBranch = branchName => {
        if ( !repo ) {
            throw 'Repository is not initialized'
        }
        return repo.listBranches().then(branches => {
            let branchExists = branches.data.find( branch => branch.name === branchName )
            if ( !branchExists ) {
                return repo.createBranch('master', branchName).then(() => {
                    currentBranch.name = branchName
                })
            } else {
                currentBranch.name = branchName
            }
        })
    }

    /**
     * Makes the push to the currently set branch
     * @public
     * @param  {string}   message Message of the commit
     * @param  {object[]} files   Array of objects (with keys 'content' and 'path'),
     *                            containing data to push
     * @return {Promise}
     */
    this.pushFiles = (message, files) => {
        if ( !repo ) {
            throw 'Repository is not initialized'
        }
        if ( !currentBranch.hasOwnProperty('name') ) {
            throw 'Branch is not set'
        }
        return getCurrentCommitSHA()
        .then(getCurrentTreeSHA)
        .then( () => createFiles(files) )
        .then(createTree)
        .then( () => createCommit(message) )
        .then(updateHead)
        .catch(e => {
            console.error(e)
        })
    }

    /**
     * Sets the current commit's SHA
     * @private
     * @return {Promise}
     */
    const getCurrentCommitSHA = () => {
        return repo.getRef('heads/' + currentBranch.name).then(ref => {
            currentBranch.commitSHA = ref.data.object.sha
        })
    }

    /**
     * Sets the current commit tree's SHA
     * @private
     * @return {Promise}
     */
    const getCurrentTreeSHA = () => {
        return repo.getCommit(currentBranch.commitSHA).then(commit => {
            currentBranch.treeSHA = commit.data.tree.sha
        })
    }

    /**
     * Creates blobs for all passed files
     * @private
     * @param  {object[]} filesInfo Array of objects (with keys 'content' and 'path'),
     *                              containing data to push
     * @return {Promise}
     */
    const createFiles = filesInfo => {
        let promises = [],
            length = filesInfo.length
        for (let i = 0; i < length; i++) {
             promises.push(createFile(filesInfo[i]))
        }
        return Promise.all(promises)
    }

    /**
     * Creates a blob for a single file
     * @private
     * @param  {object} fileInfo Array of objects (with keys 'content' and 'path'),
     *                           containing data to push
     * @return {Promise}
     */
    const createFile = fileInfo => {
        return repo.createBlob(fileInfo.content).then(blob => {
            filesToCommit.push({
                sha: blob.data.sha,
                path: fileInfo.path,
                mode: '100644',
                type: 'blob'
            })
        })
    }

    /**
     * Creates a new tree
     * @private
     * @return {Promise}
     */
    const createTree = () => {
        return repo.createTree(filesToCommit, currentBranch.treeSHA).then(tree => {
            newCommit.treeSHA = tree.data.sha
        })
    }

    /**
     * Creates a new commit
     * @private
     * @param  {string} message A message for the commit
     * @return {Promise}
     */
    const createCommit = message => {
        return repo.commit(currentBranch.commitSHA, newCommit.treeSHA, message).then(commit => {
            newCommit.sha = commit.data.sha
        })
    }

    /**
     * Updates the pointer of the current branch to point the newly created commit
     * @private
     * @return {Promise}
     */
    const updateHead = () => {
        return repo.updateHead('heads/' + currentBranch.name, newCommit.sha)
    }
}

export default GitHubAPI;