/**
 * GitHubAPI - Wrapper to upload binary files to GitHub repo
 * Uses the modified GitHub library under the hood and exposes it as `gh` property for get instance of all methods
 * @note:
 *   -- inspired at article: @see <https://medium.freecodecamp.org/pushing-a-list-of-files-to-the-github-with-javascript-b724c8c09b66>
 * @copyright Copyright (c) 2020 Lauro Moraes <https://github.com/subversivo58>
 * @license MIT License <https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE>
 */
import GitHub from '../vendor/GitHub.bundle.mjs';

const GitHubAPI = function(auth) {
    let repo,
        currentBranch = {},
        gh = new GitHub(auth)

    /**
     * Get current instance of GitHub library
     * @public
     * @return {Object}
     */
    this.GHInstance = gh

    /**
     * Sets the current repository to make push to
     * @public
     * @param {string} userName
     * @param {string} repoName
     * @return void
     */
    this.setRepo = (userName, repoName) => {
        repo = gh.getRepo(userName, repoName)
    }

    /**
     * Sets the current branch to make push to.
     * @public
     * @param {string} branchName
     * @param {string} [baseBranch]
     * @return {Promise}
     */
    this.setBranch = (branchName, baseBranch) => {
        if ( !repo ) {
            return Promise.reject(new Error('Repository is not initialized'))
        }

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

            const base = baseBranch
                ? Promise.resolve(baseBranch)
                : repo.getDetails().then(details => details.data.default_branch)

            return base.then(name => repo.createBranch(name, branchName)).then(() => {
                currentBranch.name = branchName
            })
        })
    }

    /**
     * Makes the push to the currently set branch.
     * All files are included in one commit.
     *
     * @public
     * @param {string} message
     * @param {object[]} files
     * @return {Promise}
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

        const branch = currentBranch.name,
              state = {
                  commitSHA: null,
                  treeSHA: null,
                  entries: []
              }

        return repo.getRef('heads/' + branch).then(ref => {
            state.commitSHA = ref.data.object.sha
            return repo.getCommit(state.commitSHA)
        }).then(commit => {
            state.treeSHA = commit.data.tree.sha

            return Promise.all(
                files.map(file => createEntry(file, state))
            )
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
     * Converts a Blob into Base64 without corrupting binary data.
     *
     * @private
     * @param {Blob} blob
     * @return {Promise<string>}
     */
    const blobToBase64 = blob => {
        return blob.arrayBuffer().then(buffer => {
            const bytes = new Uint8Array(buffer)
            const chunkSize = 0x8000
            let binary = ''

            for ( let i = 0; i < bytes.length; i += chunkSize ) {
                binary += String.fromCharCode(
                    ...bytes.subarray(i, i + chunkSize)
                )
            }

            return btoa(binary)
        })
    }

    /**
     * Adds one entry to the new tree.
     *
     * Supports:
     * - text files (string)
     * - binary files (Blob/File)
     * - file deletion
     *
     * @private
     * @param {object} fileInfo
     * @param {object} state
     * @return {Promise}
     */
    const createEntry = (fileInfo, state) => {

        if ( fileInfo.delete === true ) {
            state.entries.push({
                path: fileInfo.path,
                mode: '100644',
                type: 'blob',
                sha: null
            })

            return Promise.resolve()
        }

        let content = fileInfo.content

        if (
            typeof Blob !== 'undefined' &&
            content instanceof Blob
        ) {
            content = blobToBase64(content).then(base64 => ({
                content: base64,
                encoding: 'base64'
            }))
        }

        return Promise.resolve(content).then(data => {
            return repo.createBlob(data)
        }).then(blob => {
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