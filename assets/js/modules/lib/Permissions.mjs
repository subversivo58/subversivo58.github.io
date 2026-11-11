
/**
 * Permissions - utilities for `Permissions API`
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

const precheck = async function(instance) {
    if (
        typeof navigator === 'undefined' ||
        !navigator.permissions ||
        typeof navigator.permissions.query !== 'function'
    ) {
        instance.permission.forEach(permission => {
            instance.status[permission] = 'unsupported';
        });

        return instance.status;
    }

    const results = await Promise.allSettled(
        instance.permission.map(permission =>
            navigator.permissions.query({
                name: permission
            })
        )
    );

    results.forEach((result, index) => {
        const permission = instance.permission[index];

        if (result.status === 'fulfilled') {
            const permissionStatus = result.value;

            instance.status[permission] = permissionStatus.state;

            permissionStatus.addEventListener('change', () => {
                instance.status[permission] = permissionStatus.state;
            });

            return;
        }

        const error = result.reason;

        if (
            error instanceof TypeError ||
            error?.name === 'NotSupportedError'
        ) {
            instance.status[permission] = 'unsupported';
        } else {
            instance.status[permission] = 'error';
        }
    });

    return instance.status;
};

class Permissions {
    constructor() {
        this.permission = [
            'geolocation',
            'notifications',
            'push',
            'camera',
            'microphone',
            'persistent-storage'
        ];

        this.status = Object.fromEntries(
            this.permission.map(permission => [
                permission,
                'checking'
            ])
        );

        this.ready = precheck(this);
    }
}

export default Permissions;
