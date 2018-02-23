/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2017 Lauro Moraes [https://github.com/subversivo58]
 */
 ;(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(['exports'], factory);
    } else if ( typeof exports !== 'undefined' ) {
        factory(exports);
    } else {
        factory((root.CorePlugin = {}));
    }
}(this, function (exports) {
    // check jQuery [essential]
    if ( typeof this.jQuery === 'undefined' ) {
        throw new Error('Failed load jQuery library! Repport this bug: ...');
    }
    'use strict';
    /**
     * Global scope variables
     */
    try {
        // do stuff...
    } catch(ex) {
        /**
         * redirect to error page [unsupported]
         */
    }
    /**
     * Plugin... [prototype this]
     */
    const Plugin = function() {};
    // do stuff...

    /**
     * Exports
     */
    exports.Plugin = Plugin;
}));
