/**
 * Debug Console - Mobile `window.console` debugger
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

const DebugConsole = (() => {
    'use strict';

    // --------------------------------------------------
    // Activation
    // --------------------------------------------------

    const debugTag = document.head?.querySelector(
        'meta[name="DEBUG"]'
    );

    if (debugTag?.content.trim().toLowerCase() !== 'true') {
        return null;
    }

    // --------------------------------------------------
    // Storage
    // --------------------------------------------------

    const STORAGE_KEY = 'DEBUG_CONSOLE_LOGS';
    const logs = [];

    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);

        if (stored) {
            logs.push(...JSON.parse(stored));
        }
    } catch {
        // Storage unavailable or invalid data.
    }

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    const originalConsole = {};

    const stringify = (value) => {
        if (value instanceof Error) {
            return {
                type: 'error',
                name: value.name,
                message: value.message,
                stack: value.stack || null
            };
        }

        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'undefined') {
            return 'undefined';
        }

        try {
            return JSON.stringify(value, (key, item) => {
                if (item instanceof Error) {
                    return {
                        name: item.name,
                        message: item.message,
                        stack: item.stack
                    };
                }

                return item;
            }, 2);
        } catch {
            return String(value);
        }
    };

    const persist = () => {
        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(logs)
            );
        } catch {
            // Do not interrupt console operation if storage is full.
        }
    };

    // --------------------------------------------------
    // Shadow DOM interface
    // --------------------------------------------------

    const host = document.createElement('div');

    host.id = 'debug-console-host';

    const shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
        <style>
            :host {
                all: initial;
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                font-family: monospace;
                color: #eee;
                pointer-events: none;
            }

            * {
                box-sizing: border-box;
            }

          #fab {
    position: fixed;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    border-radius: 50%;
    background: grey;
    color: #fff;
    font-size: 27px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 2px 8px #0008;
    pointer-events: auto;
    margin: 0;
    padding: 0;
}

            #panel {
                position: fixed;
                inset: auto 0 0 0;
                height: 42vh;
                display: none;
                flex-direction: column;
                background: #171717;
                border-top: 2px solid #555;
                pointer-events: auto;
            }

            #toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px;
                background: #252525;
            }

            #toolbar strong {
                font-size: 13px;
            }

            button {
                border: 0;
                border-radius: 4px;
                padding: 6px 10px;
                margin-left: 5px;
                background: #444;
                color: white;
                font: inherit;
                font-size: 12px;
                cursor: pointer;
            }

            #output {
                flex: 1;
                overflow: auto;
                padding: 8px;
                font-size: 12px;
                overflow-wrap: anywhere;
            }

            .entry {
                padding: 6px 4px;
                border-bottom: 1px solid #333;
                white-space: pre-wrap;
            }

            .log { color: #ddd; }
            .info { color: #78c8ff; }
            .warn { color: #ffd166; }
            .error { color: #ff7373; }
            .debug { color: #b8a1ff; }

            .stack {
                color: #aaa;
                margin-top: 5px;
                white-space: pre-wrap;
            }
        </style>

        <button id="fab" type="button" aria-label="Open Debug Console">
            &#128030;
        </button>

        <section id="panel">
            <header id="toolbar">
                <strong>DEBUG CONSOLE</strong>

                <div>
                    <button id="clear" type="button">Clear</button>
                    <button id="copy" type="button">Copy</button>
                    <button id="close" type="button">Fechar</button>
                </div>
            </header>

            <div id="output"></div>
        </section>
    `;

    const fab = shadow.querySelector('#fab');
    const panel = shadow.querySelector('#panel');
    const output = shadow.querySelector('#output');

    // --------------------------------------------------
    // Interface state
    // --------------------------------------------------

    const setOpen = (open) => {
        panel.style.display = open ? 'flex' : 'none';
        fab.style.display = open ? 'none' : 'flex';

        if (open) {
            renderAll();
        }
    };

    // --------------------------------------------------
    // Rendering
    // --------------------------------------------------

    const renderEntry = (entry) => {
        const element = document.createElement('div');

        element.className = `entry ${entry.level}`;

        const time = new Date(entry.time)
            .toLocaleTimeString();

        const content = entry.args
            .map(stringify)
            .join(' ');

        element.textContent = `[${time}] ${content}`;

        if (entry.stack) {
            const stack = document.createElement('div');

            stack.className = 'stack';
            stack.textContent = entry.stack;

            element.appendChild(stack);
        }

        output.appendChild(element);
    };

    const renderAll = () => {
        output.replaceChildren();

        logs.forEach(renderEntry);

        output.scrollTop = output.scrollHeight;
    };

    // --------------------------------------------------
    // Recording
    // --------------------------------------------------

    const add = (level, args, stack = null) => {
        const entry = {
            level,
            args: Array.from(args),
            stack,
            time: Date.now()
        };

        logs.push(entry);

        persist();
        renderEntry(entry);

        output.scrollTop = output.scrollHeight;
    };

    // --------------------------------------------------
    // Console interception
    // --------------------------------------------------

    const methods = [
        'log',
        'info',
        'warn',
        'error',
        'debug',
        'trace',
        'table',
        'dir',
        'dirxml',
        'assert',
        'count',
        'countReset',
        'group',
        'groupCollapsed',
        'groupEnd',
        'time',
        'timeEnd',
        'timeLog',
        'clear'
    ];

    methods.forEach((method) => {
        const original = console[method];

        if (typeof original !== 'function') {
            return;
        }

        originalConsole[method] = original.bind(console);

        console[method] = function (...args) {
            const stack = new Error().stack;

            add(
                method === 'assert' && args[0]
                    ? 'log'
                    : method === 'assert'
                        ? 'error'
                        : method,
                method === 'assert' ? args.slice(1) : args,
                method === 'assert' && args[0]
                    ? null
                    : stack
            );

            return original.apply(console, args);
        };
    });

    // --------------------------------------------------
    // Global errors
    // --------------------------------------------------

    window.addEventListener('error', (event) => {
        if (event.error instanceof Error) {
            add('error', [event.error], event.error.stack);
        } else {
            add('error', [
                event.message,
                event.filename,
                event.lineno,
                event.colno
            ]);
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;

        add(
            'error',
            [reason],
            reason instanceof Error ? reason.stack : null
        );
    });

    // --------------------------------------------------
    // Interface controls
    // --------------------------------------------------

    fab.addEventListener('click', () => {
        setOpen(true);
    });

    shadow.querySelector('#close').addEventListener('click', () => {
        setOpen(false);
    });

    shadow.querySelector('#clear').addEventListener('click', () => {
        logs.length = 0;
        output.replaceChildren();

        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage errors.
        }
    });

    shadow.querySelector('#copy').addEventListener('click', async () => {
        const content = logs.map((entry) => {
            const time = new Date(entry.time).toLocaleTimeString();

            return [
                `[${time}] [${entry.level}]`,
                ...entry.args.map(stringify),
                entry.stack || ''
            ].join('\n');
        }).join('\n\n');

        try {
            await navigator.clipboard.writeText(content);
        } catch (error) {
            originalConsole.error(
                'Debug Console: unable to copy logs.',
                error
            );
        }
    });

    // --------------------------------------------------
    // Initialization
    // --------------------------------------------------

    const initialize = () => {
        if (!document.body.contains(host)) {
            document.body.appendChild(host);
        }

        setOpen(false);
    };

    if (document.body) {
        initialize();
    } else {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    }

    return {
        logs,
        host,
        shadow
    };

})();

export default DebugConsole;