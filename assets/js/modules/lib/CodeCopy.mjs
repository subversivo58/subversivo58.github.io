/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2010-2026 Lauro Moraes
 *
 * CodeCopy.mjs
 * Adds copy buttons to rendered code blocks.
 *
 * Receives CSS selectors to locate the target container
 * and the HTML template used to create the copy buttons.
 */

export default function CodeCopy(containerSelector, templateSelector) {
    if (typeof containerSelector !== "string" || !containerSelector.trim()) {
        throw new TypeError(
            "[CodeCopy]: A valid container selector is required."
        );
    }

    if (typeof templateSelector !== "string" || !templateSelector.trim()) {
        throw new TypeError(
            "[CodeCopy]: A valid template selector is required."
        );
    }

    return function initialize() {
        const container = document.querySelector(containerSelector);
        const template = document.querySelector(templateSelector);

        const wrapperTemplate = template?.content?.firstElementChild;

        if (!container) {
            console.warn(
                `[CodeCopy]: Container not found: ${containerSelector}`
            );
            return;
        }

        if (!wrapperTemplate) {
            console.warn(
                `[CodeCopy]: Template not found or invalid: ${templateSelector}`
            );
            return;
        }

        for (const pre of container.querySelectorAll("pre")) {
            if (pre.parentElement?.classList.contains("code-container")) {
                continue;
            }

            const wrapper = wrapperTemplate.cloneNode(true);

            pre.before(wrapper);
            wrapper.append(pre);
        }
    };
}
