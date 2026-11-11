/**
 * Notifications - Wraper to `Notificatios API`
 * @see  The Holy Grail of Notifications      - [https://web-push-book.gauntface.com]
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

import Emitter from './Emitter.mjs';

/**
 * Browser execution context.
 */
const IsWebBrowserContext =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined';

/**
 * Prevent duplicate permission monitoring and welcome notifications.
 */
const watchedPermissions = new WeakSet();
const welcomedPermissions = new WeakSet();

/**
 * Queue [FIFO - First in, first out].
 */
const Queue = function() {
    this.q = [];

    this.__proto__.push = item => {
        this.q.push(item);
    };

    this.__proto__.shift = () => {
        return this.q.shift();
    };

    this.__proto__.size = () => {
        return this.q.length;
    };
};

/**
 * Observe DOM mutations.
 */
const SpyDOM = (node, callback, options) => {
    let observer = new MutationObserver(callback);

    observer.observe(node, options);

    return function(mutations) {
        for (let mutation of mutations) {
            for (let addedNode of [...mutation.addedNodes]) {
                if (
                    Object.prototype.toString
                        .call(addedNode)
                        .replace(/^\[object (.+)\]$/, '$1')
                        .toLowerCase()
                ) {
                    return addedNode;
                }
            }
        }
    };
};

/**
 * Validate URL.
 */
const ValidURL = (uri, secure = false) => {
    let url;

    try {
        url = new URL(uri);
    } catch (ex) {
        return false;
    }

    return secure
        ? url.protocol === 'https:'
        : true;
};

/**
 * Test if a string is an emoji.
 */
const EmojiTest = emoji => {
    try {
        return /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/.test(emoji);
    } catch(e) {
        return false;
    }
};

/**
 * Generate UUID v4.
 */
const uuidv4 = function(shortVersion = false) {
    return shortVersion
        ? Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
        : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
            /[018]/g,
            c => (
                c ^ crypto.getRandomValues(new Uint8Array(1))[0] &
                15 >> c / 4
            ).toString(16)
        );
};

const isVisible = function(element) {
    return !!(
        element.offsetWidth ||
        element.offsetHeight ||
        element.getClientRects().length
    );
};

const noop = () => {};

/**
 * Detect mobile devices.
 */
const isMobile = (
    /android|iphone|ipad|ipod|mobile|windows phone/i.test(
        navigator.userAgent || ''
    ) ||
    (
        window.matchMedia &&
        window.matchMedia('(pointer: coarse)').matches
    )
);

/**
 * Check support for additional Notification properties.
 */
const NotifyExtraPropertiesSupport = list => {
    if (
        typeof Notification === 'undefined' ||
        !Notification.prototype
    ) {
        return { extra: {} };
    }

    return {
        extra: list
            .filter(item => item in Notification.prototype)
            .reduce((o, key) => ({
                ...o,
                [key]: true
            }), {})
    };
};

/**
 * Page visibility.
 */
let isVisiblePage = (
    document.visibilityState === 'visible'
);

document.addEventListener('visibilitychange', () => {
    isVisiblePage = (
        document.visibilityState === 'visible'
    );
});

/**
 * Notification collapse icons.
 */
const collapse = {
    up: '🔺',
    down: '🔻'
};

/**
 * Time ago (UNIX).
 */
const TimeAgo = time => {
    let round = Math.round;
    let now = Date.now();
    let t;

    let format = (n, unit) => {
        let a = 'hora' == unit ? 'ha' : '1';

        unit = 1 == n
            ? unit
            : (unit !== 'mês' ? unit + 's' : unit);

        return (1 == n ? a : n) + ' ' + unit;
    };

    let diff = (time > now)
        ? (time - now)
        : (now - time);

    if (1e3 > diff) return 'agora';

    if (60 > (t = round(diff / 1e3))) {
        return format(t, 'segundo');
    }

    if (60 > (t = round(diff / 6e4))) {
        return format(t, 'minuto');
    }

    if (24 > (t = round(diff / 3.6e+6))) {
        return format(t, 'hora');
    }

    if (7 > (t = round(diff / 8.64e+7))) {
        return format(t, 'dia');
    }

    if (4.34812 > (t = diff / 6.048e+8)) {
        return format(round(t), 'semana');
    }

    if (12 > (t = round(diff / 2.63e+9))) {
        return format(t, 'mês');
    }

    if (10 > (t = round(diff / 3.156e+10))) {
        return format(t, 'ano');
    }

    return format(round(diff / 3.156e+11), 'década');
};

/**
 * Nice time for humans readable.
 */
const TimeLength = (milliseconds, locale = false) => {
    const lang = ((testLang) => {
        if (testLang) {
            try {
                new Date(Date.now()).toLocaleString(testLang);
                return testLang;
            } catch(e) {
                return navigator.languages
                    ? navigator.languages[0]
                    : (navigator.language || 'en-US');
            }
        }
    })(locale);

    return new Date(milliseconds).toLocaleString(lang, {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * Synchronous timeout helper.
 */
function setTimeoutSync(callback, ms) {
    const start = Date.now();
    let now = start;

    while (now - start < ms) {
        now = Date.now();
    }

    if (typeof callback === 'function') {
        callback();
    }
}

/**
 * Frame interval.
 */
const frameInterval = (callback, delay) => {
    let dateNow = Date.now;
    let requestAnimation = requestAnimationFrame;
    let start = dateNow();
    let stop;

    let intervalFunc = function() {
        dateNow() - start < delay ||
            (start += delay, callback());

        stop || requestAnimation(intervalFunc);
    };

    requestAnimation(intervalFunc);

    return {
        clear() {
            stop = 1;
        }
    };
};

/**
 * Slide notification element.
 */
function slideIt(element, direction, slideDuration, callback) {
    let i = 0;
    let distance = element.getBoundingClientRect().width;
    let step = distance / (slideDuration * 2);

    let stepper = setInterval(function() {
        i = Math.min(distance, i + step);
        element.style[direction] = i + 'px';

        if (i === distance) {
            clearInterval(stepper);
            callback();
        }
    }, 50);
}

/**
 * NotifyJS
 */
class NotifyJS extends Emitter {
    constructor(settings = {}) {
        super();

        // Shared Permissions instance.
        this.permissions = settings.permissions || null;

        // Current notification permission.
        this.permission = (
            this.permissions?.status?.notifications &&
            this.permissions.status.notifications !== 'checking'
        )
            ? this.permissions.status.notifications
            : (
                typeof Notification !== 'undefined'
                    ? Notification.permission
                    : 'unsupported'
            );

        this.log = (
            'logger' in settings &&
            typeof settings.logger === 'function'
        ) ? settings.logger : noop;

        this.player = (
            'player' in settings &&
            typeof settings.player === 'function'
        ) ? settings.player : noop;

        this.FIFO = new Queue();

        this.container = false;

        this.default = {
            body: '',
            data: null,
            dir: 'auto',
            icon: '',
            lang: 'en-US',
            tag: uuidv4(),

            title: document.title,

            bootstrap: {
                timing: 3000,
                target: '_blank',
                link: '#',
                type: 'ligth',
                close: true,
                sound: false
            },

            extra: {}
        };

        // Detect additional Notification properties.
        this.default.extra = NotifyExtraPropertiesSupport([
            'actions',
            'badage',
            'image',
            'renotify',
            'requireInteraction',
            'silent',
            'timestamp',
            'vibrate',
            'sound'
        ]).extra;

        // Bootstrap notification options.
        if (this.permission !== 'granted') {
            if (isMobile) {
                this.default.vibrate = true;
            }

            this.default.actions = true;
            this.default.image = true;
            
        }

        // Maximum supported native notification actions.
        this.default.maxActions = (
            typeof Notification !== 'undefined' &&
            'actions' in this.default.extra
        ) ? Notification.maxActions : 0;

        // Store notifications.
        this.notifications = {};

        // Store last.
        this.store = [];

        // Start monitoring only when explicitly requested.
        if (
            settings.watchPermissions === true &&
            this.permissions
        ) {
            this.ready = this.watchNotificationsPermission();
        }

        this.log('NotifyJS initialized');
    }
      /**
     * Monitor notification permission changes.
     */
    async watchNotificationsPermission() {
        const permissions = this.permissions;

        if (
            !permissions ||
            typeof navigator === 'undefined' ||
            !navigator.permissions ||
            typeof navigator.permissions.query !== 'function'
        ) {
            return false;
        }

        // Only one instance monitors each Permissions object.
        if (watchedPermissions.has(permissions)) {
            return false;
        }

        watchedPermissions.add(permissions);

        try {
            // Wait for the initial permission checks.
            if (permissions.ready) {
                await permissions.ready;
            }

            const previousState =
                permissions.status.notifications;

            // Obtain PermissionStatus to listen for changes.
            const permissionStatus =
                await navigator.permissions.query({
                    name: 'notifications'
                });

            this.permission = permissionStatus.state;

            // Detect a transition during initialization.
            if (
                permissionStatus.state === 'granted' &&
                (
                    previousState === 'prompt' ||
                    previousState === 'denied'
                )
            ) {
                this.notifyPermissionGranted();
            }

            // Listen for subsequent permission changes.
            const handleChange = () => {
                const previous = this.permission;
                const current = permissionStatus.state;

                this.permission = current;

                // Synchronize the shared Permissions instance.
                permissions.status.notifications = current;

                if (
                    current === 'granted' &&
                    (
                        previous === 'prompt' ||
                        previous === 'denied'
                    )
                ) {
                    this.notifyPermissionGranted();
                }
            };

            if (
                typeof permissionStatus.addEventListener === 'function'
            ) {
                permissionStatus.addEventListener(
                    'change',
                    handleChange
                );
            } else {
                permissionStatus.onchange = handleChange;
            }

            return true;

        } catch (error) {
            this.log(
                'Unable to monitor notification permission:',
                error
            );

            return false;
        }
    }
    /**
     * Show welcome notification after permission is granted.
     */
    notifyPermissionGranted() {
        const permissions = this.permissions;

        if (
            !permissions ||
            welcomedPermissions.has(permissions) ||
            typeof Notification === 'undefined' ||
            Notification.permission !== 'granted'
        ) {
            return false;
        }

        // Prevent duplicate welcome notifications.
        welcomedPermissions.add(permissions);

        try {
            // Use the same rendering pipeline as every notification:
            // native first, HTML fallback if native construction fails.
            const notification = this.create({
                title: 'Notificações ativadas',
                body: 'Obrigado por permitir o envio de notificações!',
                icon: this.default.icon || '',
                tag: 'notifyjs-permission-granted'
            });

            const result = notification.show();

            this.emit('permission:granted', result || notification);

            return result || notification;

        } catch (error) {
            this.emit('error', error);

            return false;
        }
    }

    set disableUserSettings(Boolean) {
        this.log('> disability user configuration: ', Boolean);
    }

    onshow(Event) {
        this.emit('show', Event.target);
    }

    onclick(Event) {
        this.emit('click', Event);

        if ('close' in Event.target) {
            Event.target.close();
        }
    }

    onclose(Event, id) {
        this.emit('close', Event.target);

        // Clear list.
        if (id && this.notifications[id]) {
            delete this.notifications[id];
        }

        // Direct render.
        if (isVisiblePage && this.store.length > 0) {
            this.show();
        }
    }

    onerror(Event) {
        console.error(Event);
        this.emit('error', Event.target);
    }

    /**
     * Create notification.
     */
    create(options = {}) {

        // Check tag and last tag.
        'tag' in options
            ? null
            : this.default.tag = uuidv4();

        // Merge default options.
        options = Object.assign({}, this.default, options);

        if ('bootstrap' in options) {
            options.bootstrap = Object.assign(
                {},
                this.default.bootstrap,
                options.bootstrap
            );

            this.default.bootstrap = options.bootstrap;
        }

        // Normalize title and body.
        options.title = String(options.title || '');

        options.body = String(options.body || '');

        // Title max length 30 chars.
        options.title = (
            options.title.length > 30
        ) ? options.title.substr(0, 30) : options.title;

        // Message max length 120 chars.
        options.body = (
            options.body.length > 120
        ) ? options.body.substr(0, 120) : options.body;

        // Non-standard ID.
        let id = uuidv4();

        // Basic message.
        let data = {
            body: options.body,
            icon: options.icon,
            tag: options.tag
        };

        // Extend data.
        Object.assign(
            data,
            Object.keys(options).reduce(
                (o, key) => ({
                    ...o,
                    [key]: options[key]
                }),
                {}
            )
        );

        // Save notification.
        this.notifications[id] = data;

        return {
            show: () => {
                return this.show(this.notifications[id], id);
            },

            data: object => {
                if (this.notifications[id]) {
                    if (!('data' in this.notifications[id].data)) {
                        this.notifications[id].data = {};
                    }

                    Object.assign(
                        this.notifications[id].data,
                        object
                    );

                } else {
                    throw new Error(
                        'Failed `set data` Notification {Object} not found or already dispatched!'
                    );
                }
            }
        };
    }
      /**
     * Show notification.
     */
    show(schema, id) {

        // Keep the local state synchronized with the shared Permissions
        // instance before selecting the notification rendering method.
        const currentPermission =
            this.permissions?.status?.notifications;

        if (
            currentPermission &&
            currentPermission !== 'checking'
        ) {
            this.permission = currentPermission;
        }

        let BootstrapBox = document.getElementById(
            'notifications-container'
        );

        let REWORK = false;

        // Process stored notifications.
        if (BootstrapBox && (!schema && !id)) {
            if (BootstrapBox.childElementCount < 3) {
                let fifo = this.store.shift();

                if (fifo) {
                    schema = fifo.schema;
                    id = fifo.id;
                    REWORK = true;
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        /**
         * Bootstrap notification template.
         */
        const BootstrapNotification = () => {

            let timestamp = (
                'timestamp' in this.notifications[id]
            )
                ? this.notifications[id].timestamp
                : Date.now();

            /**
             * Notification options:
             * renotify, silent and timestamp are not applicable
             * to the Bootstrap template.
             */
            let bootcfg = this.default.bootstrap;
// Automatic display duration based on message length.
const bodyLength = schema.body.length;

const notificationTiming = (
    bodyLength <= 50
) ? 7000 : (
    bodyLength <= 100
) ? 10000 : 15000;
            let maxViewHeight = Math.floor(
                window.innerHeight - (3.5 / 0.06) - 65
            );

            // Define visualization mode.
            let modeView = isMobile
                ? (() => {
                    let StyleSheet = document.styleSheets[1];

                    if (StyleSheet) {
                        StyleSheet.insertRule(
                            ':root {--bootstraped-notification-container-top-mobile: 3.5rem;}'
                        );
                    }

                    return 'mobile';
                })()
                : 'desktop';

            // Insert position.
            let verticalDirection = (
                modeView === 'mobile'
            ) ? 'beforeend' : 'afterbegin';

            // Link pointer.
            let pointer = (
                bootcfg.link !== '#'
            ) ? 'cp' : '';

            // Background.
            let bgbox = (
                bootcfg.type === 'ligth'
            ) ? 'bg-white' : '';

            // Close button ID.
            let currentClose = uuidv4();

            // Close button.
            let close_this = (
                !!bootcfg.close && !bootcfg.pinned
            )
                ? '<small data-target="' + schema.tag + '" id="' + currentClose + '" class="fr cp">✖️</small>'
                : '<small title="pinned" data-target="' + schema.tag + '" id="' + currentClose + '" class="fr">📌</small>';

            // Image template.
            let imageTemplate = (
                'image' in schema &&
                typeof schema.image === 'string' &&
                schema.image !== ''
            )
                ? '    <div id="bootstraped-notification-image-' + schema.tag + '" class="col-12 p-0 pt-2">' +
                  '        <picture>' +
                  '            <img alt="notification image" src="' + schema.image + '" class="mw-100 img-fluid border">' +
                  '        </picture>' +
                  '    </div>'
                : '';

            // Message template.
            let messageTemplate = (
                'body' in schema &&
                schema.body !== ''
            )
                ? '        <div id="bootstraped-notification-message" class="col px-0 ' + pointer + '">' +
                  '            <p class="mb-0 contrast">' + schema.body + '</p>' +
                  '        </div>'
                : '';

            // Collapse template.
            let colapse_this = (
                imageTemplate !== '' ||
                (
                    messageTemplate !== '' &&
                    schema.body.length > 95
                ) &&
                !bootcfg.pinned
            )
                ? `<div id="collapser-${uuidv4(true)}" class="col px-0 cp" data-toggle="collapse" data-target="#message-bodybox-${schema.tag}">
                     <small class="mr-3 fr">${collapse.up}</small>
                     <small class="fr">${TimeLength(timestamp)}</small>
                   </div>`
                : `<div class="col px-0 cp">
                     <small class="mr-2 fr">${TimeLength(timestamp)}</small>
                   </div>`;

            // Badge template.
            let badageTemplate = (
                'badage' in schema &&
                schema.badage !== ''
            )
                ? '            <img alt="notification badage" src="' + schema.badage + '" class="monochrome" width="20px" height="20px">'
                : '';

            // Actions template.
            let actionsTemplate = (
                'actions' in schema &&
                Array.isArray(schema.actions) &&
                schema.actions.length > 0
            )
                ? (() => {
                    let tpl = '';

                    if (schema.actions.length > 1) {
                        tpl += '    <div class="col p-0 pt-2">';

                        for (let k of schema.actions) {
                            let icon;

                            if (k.icon && ValidURL(k.icon)) {
                                icon = `<img src="${k.icon}" width="10px" height="10px"> `;
                            } else {
                                icon = (
                                    k.icon &&
                                    k.icon.trim() !== '' &&
                                    EmojiTest(k.icon)
                                ) ? k.icon + ' ' : '';
                            }

                            tpl +=
                                '        <button id="notification-action-' + schema.tag + '" data-action="' + k.action + '" type="button" class="btn btn-outline-secondary btn-sm rounded-0 py-0">' +
                                icon + k.title +
                                '</button>';
                        }

                        tpl += '    </div>';

                    } else {
                        let action = schema.actions[0];
                        let icon;

                        if (action.icon && ValidURL(action.icon)) {
                            icon = `<img src="${action.icon}" width="10px" height="10px"> `;
                        } else {
                            icon = (
                                action.icon &&
                                action.icon.trim() !== '' &&
                                EmojiTest(action.icon)
                            ) ? action.icon + ' ' : '';
                        }

                        tpl +=
                            '    <div class="col p-0 pt-2">' +
                            '        <button id="notification-action-' + schema.tag + '" data-action="' + action.action + '" type="button" class="btn btn-outline-secondary btn-sm rounded-0 py-0">' +
                            icon + action.title +
                            '</button>' +
                            '    </div>';
                    }

                    return tpl;
                })()
                : '';

            // Icon template.
            let iconTemplate = (
                imageTemplate === '' &&
                'icon' in schema &&
                schema.icon !== ''
            )
                ? '    <div class="col-2 text-center p-0 py-2">' +
                  '        <picture>' +
                  '            <img alt="notification avatar" src="' + schema.icon + '" class="mw-100 img-fluid" width="50px" height="50px">' +
                  '        </picture>' +
                  '    </div>'
                : '';

            /**
             * Notification event handlers.
             */
            let EventsHandler = () => {

                // Play sound.
                if (
                    'sound' in schema &&
                    schema.sound !== ''
                ) {
                    this.player(schema.sound);
                }

                // Close button.
                let target = BootstrapBox.querySelector(
                    '[id^="' + currentClose + '"]'
                );

                if (target && isVisible(target)) {

                    // Notification container.
                    let element = BootstrapBox.querySelector(
                        '[id^="' + target.dataset.target + '"]'
                    );

                    if (!element) {
                        return;
                    }

                    // Collapse element.
                    let collapser = element.querySelector(
                        '[id^="collapser-"]'
                    );

                    // Timer.
                    let TimmerToClose;

                    // Mouse over timer.
                    const TimerOfMouseOver = (callback, ms) => {
                        return TimmerToClose = setTimeout(
                            callback,
                            ms
                        );
                    };

                    // Automatic close.
                    if (
                        !('requireInteraction' in schema) &&
                        !('actions' in schema)
                    ) {
                        TimmerToClose = setTimeout(() => {
                            slideIt(element, 'left', 4, () => {
                                clearTimeout(TimmerToClose);

                                if (element.parentNode) {
                                    element.parentNode.removeChild(element);
                                }

                                this.onclose(
                                    { target: this.notifications[id] },
                                    id
                                );
                            });
                        }, notificationTiming);

                        if (collapser) {
                            collapser.addEventListener('click', () => {
                                clearTimeout(TimmerToClose);
                            }, {
                                once: true
                            });
                        }

                        element.addEventListener('mouseover', () => {
                            clearTimeout(TimmerToClose);

                            TimerOfMouseOver(() => {
                                if (element.parentNode) {
                                    element.parentNode.removeChild(element);
                                }

                                this.onclose(
                                    { target: this.notifications[id] },
                                    id
                                );
                            }, notificationTiming * 2);
                        });

                    } else {
                        if (BootstrapBox) {
                            [
                                ...BootstrapBox.querySelectorAll(
                                    '[id^="notification-action-"]'
                                )
                            ].forEach(action => {
                                action.addEventListener('click', evt => {
                                    this.onclick({
                                        target: this.notifications[id],
                                        action: evt.target.dataset.action
                                    });

                                    if (element && element.parentNode) {
                                        element.parentNode.removeChild(element);

                                        this.onclose(
                                            { target: this.notifications[id] },
                                            id
                                        );
                                    }
                                });
                            });
                        }
                    }

                    // Close notification manually.
                    if (!bootcfg.pinned) {
                        target.addEventListener('click', evt => {
                            evt.preventDefault();

                            slideIt(element, 'left', 4, () => {
                                clearTimeout(TimmerToClose);

                                if (element.parentNode) {
                                    element.parentNode.removeChild(element);
                                }

                                this.onclose(
                                    { target: this.notifications[id] },
                                    id
                                );
                            });
                        });
                    }
                }
            };
                      /**
             * Adjust notification container.
             */
            const AdjustContainer = () => {
                let childs = BootstrapBox.children;
                let lastChildIndex = childs.length - 1;

                let collapser = BootstrapBox.firstElementChild
                    ? BootstrapBox.firstElementChild.querySelector(
                        '[id^="collapser-"]'
                    )
                    : null;

                if (BootstrapBox.childElementCount > 1) {

                    let previous =
                        BootstrapBox.firstElementChild.nextElementSibling;

                    if (BootstrapBox.offsetHeight > maxViewHeight) {
                        BootstrapBox.lastElementChild.classList.add(
                            'bg-red'
                        );
                    }

                    if (previous) {
                        let tc = previous.querySelector(
                            '[id^="collapser-"]'
                        );

                        if (tc && tc.dataset.target) {
                            let tgt = previous.querySelector(
                                '[id^="' + tc.dataset.target.slice(1) + '"]'
                            );

                            tc.children[0].textContent = collapse.down;

                            if (tgt) {
                                tgt.classList.remove('show');
                            }
                        }
                    }
                }

                if (collapser && collapser.dataset.target) {
                    let target = BootstrapBox.querySelector(
                        '[id^="' + collapser.dataset.target.slice(1) + '"]'
                    );

                    if (target) {
                        target.addEventListener(
                            'show.bs.collapse',
                            function() {
                                collapser.children[0].textContent =
                                    collapse.up;
                            },
                            false
                        );

                        target.addEventListener(
                            'hide.bs.collapse',
                            function() {
                                collapser.children[0].textContent =
                                    collapse.down;
                            },
                            false
                        );

                        if (
                            isVisiblePage &&
                            BootstrapBox.offsetHeight > maxViewHeight
                        ) {
                            collapser.children[0].textContent =
                                collapse.down;

                            target.classList.remove('show');
                        }
                    }
                }
            };

            /**
             * Render notification.
             */
            if (
                BootstrapBox &&
                isVisible(BootstrapBox)
            ) {
                let template =
                    '<div id="' + schema.tag + '" class="row animation alert alert-' + bootcfg.type + ' ' + bgbox + ' px-0 py-0 m-0 my-2 rounded-0 bsb-block">' +
                    iconTemplate +
                    '    <div class="col p-2">' +
                    '        <div class="col px-0">' +
                    '            ' + close_this +
                    '            ' + colapse_this +
                    '            <strong class="h6">' + schema.title + '</strong>' +
                    '        </div>' +
                    '        <div id="message-bodybox-' + schema.tag + '" class="col collapse show px-0">' +
                    messageTemplate +
                    imageTemplate +
                    '        </div>' +
                    '        <div class="col px-0 mt-1">' +
                    badageTemplate +
                    '            <small class="col px-0 contrast">' + location.origin + '</small>' +
                    '            <small class="fr pt-1 cp" data-triger="hover" data-toggle="popover" data-content="settings">⚙️</small>' +
                    '        </div>' +
                    actionsTemplate +
                    '    </div>' +
                    '</div>';

                // Check if already displayed.
                if (
                    !BootstrapBox.querySelector(
                        'div[id="' + schema.tag + '"]'
                    )
                ) {
                    let childsLength = BootstrapBox.childElementCount;

                    if (isVisiblePage) {

                        if (
                            childsLength < 3 &&
                            this.store.length === 0
                        ) {
                            this.log('> show: ', schema.title);

                            BootstrapBox.insertAdjacentHTML(
                                verticalDirection,
                                template
                            );

                            AdjustContainer();
                            EventsHandler();

                        } else if (REWORK) {

                            this.log('> show: ', schema.title);

                            BootstrapBox.insertAdjacentHTML(
                                verticalDirection,
                                template
                            );

                            AdjustContainer();
                            EventsHandler();

                            REWORK = false;

                        } else {

                            this.log(
                                '> store: ',
                                schema.title,
                                ', as id: ',
                                id
                            );

                            this.store.push({
                                schema: schema,
                                id: id
                            });

                            this.notifications[id].timestamp =
                                Date.now();
                        }
                    }
                }

            } else {

                // First notification template.
                let template =
                    '<div id="bootstraped-notific-container" class="px-2 ' + modeView + '">' +
                    '    <div id="notifications-container" class="container-fluid p-0">' +
                    '        <div id="' + schema.tag + '" class="row alert alert-' + bootcfg.type + ' ' + bgbox + ' px-0 py-0 m-0 my-2 rounded-0 bsb-block">' +
                    iconTemplate +
                    '            <div class="col p-2">' +
                    '                <div class="col px-0">' +
                    '                    ' + close_this +
                    '                    ' + colapse_this +
                    '                    <strong class="h6">' + schema.title + '</strong>' +
                    '                </div>' +
                    '                <div id="message-bodybox-' + schema.tag + '" class="col collapse show px-0">' +
                    messageTemplate +
                    imageTemplate +
                    '                </div>' +
                    '                <div class="col px-0 mt-1">' +
                    badageTemplate +
                    '                    <small class="contrast">' + location.origin + '</small>' +
                    '                    <small class="fr pt-1 cp" data-triger="hover" data-toggle="popover" data-content="settings">⚙️</small>' +
                    '                </div>' +
                    actionsTemplate +
                    '            </div>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';

                // Initialize MutationObserver.
                let spy = SpyDOM(
                    document.body,
                    (mutations, observer) => {
                        let nodeTarget = spy(mutations);

                        if (
                            nodeTarget &&
                            nodeTarget.id === 'bootstraped-notific-container'
                        ) {
                            observer.disconnect();

                            BootstrapBox = nodeTarget.children[0];

                            AdjustContainer();
                            EventsHandler();
                        }
                    },
                    { childList: true }
                );

                // Insert first notification.
                document.body.insertAdjacentHTML(
                    'beforeend',
                    template
                );
            }
        };

        /**
         * Select notification API according to permission.
         */
        switch (true) {

            case (this.permission === 'granted'): {

                // Some notifications (such as the permission welcome
                // message) must stay inside the page.
                if (schema.forceHTML === true) {
                    return BootstrapNotification();
                }

                // Native API unavailable.
                if (typeof Notification === 'undefined') {
                    return BootstrapNotification();
                }

                // Pinned notifications use Bootstrap.
                if (this.default.bootstrap.pinned) {
                    return BootstrapNotification();
                }

                let notify;

                try {
                    // Work with a copy of the schema.
                    let nativeSchema = Object.assign({}, schema);

                    // Remove unsupported browser properties.
                    if (!isMobile) {
                        for (let k of [
                            'actions',
                            'badage',
                            'renotify',
                            'silent',
                            'vibrate',
                            'sound'
                        ]) {
                            delete nativeSchema[k];
                        }
                    }

                    notify = new Notification(
                        nativeSchema.title,
                        nativeSchema
                    );

                    notify.onshow = evt => this.onshow(evt);
                    notify.onclick = evt => this.onclick(evt);
                    notify.onclose = evt => this.onclose(evt);
                    notify.onerror = evt => this.onerror(evt);

                } catch(e) {
                    // Fall back to the HTML notification when the browser
                    // exposes Notification but does not allow its constructor.
                    this.log(
                        'Native notification unavailable; using HTML fallback:',
                        e
                    );

                    // Native Notification construction can fail even
                    // when the API exists and permission is granted.
                    // Preserve the error event and render HTML instead.
                    this.emit('error', e);

                    return BootstrapNotification();
                }

                // Close native notification when page is visible.
                if (
                    document.visibilityState === 'visible' &&
                    notify instanceof Notification
                ) {
                    setTimeout(() => {
                        notify.close();
                    }, this.default.bootstrap.timing);
                }

                break;
            }

            case (
                this.permission === 'denied' ||
                this.permission === 'default' ||
                this.permission === 'prompt'
            ):

            default: {
                // Fallback to Bootstrap template.
                BootstrapNotification();
                break;
            }
        }
    }
}

export default NotifyJS;