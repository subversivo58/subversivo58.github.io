/**
 * @file CodeCopy.mjs
 * @description Adds copy buttons to rendered code blocks.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
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
