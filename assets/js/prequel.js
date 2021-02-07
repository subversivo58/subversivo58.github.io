/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
;(function(wd, dc) {
    'use strict';
    // Mozilla Documentation Web API's reference
    var MozillaDocs = "https://developer.mozilla.org/en-US/docs/Web/";
     // for get current protocol
    var uri = wd.location.protocol;
    // root (domain)
    var BaseRoot = uri + '//' + wd.location.host + '/';

    /**
     * Is mobile?
     * @see original referrer {@link http://mobiledetect.com} (site down)
     * @return { Boolean }
     */
    var isMobile = (function(dc, wd) {
        // get browser "User-Agent" or vendor ... see "opera" property in `window`
        var wua = (wd.navigator.userAgent || wd.navigator.vendor || wd.opera || '');
        try {
            /**
             * Creating a touch event ... in modern browsers with touch screens or emulators (but not mobile) does not cause errors.
             * Otherwise, it will create a `DOMException` instance
             */
            dc.createEvent("TouchEvent");

            // check touchStart event
            (('ontouchstart' in wd) || ('ontouchstart' in dc.documentElement) || wd.DocumentTouch && wd.document instanceof DocumentTouch || wd.navigator.maxTouchPoints || wd.navigator.msMaxTouchPoints) ? void(0) : new Error('failed check "ontouchstart" event');

            // check `mediaQueryList` ... pass as modern browsers
            var mQ = wd.matchMedia && matchMedia("(pointer: coarse)");
            // if no have, throw error to use "User-Agent" sniffing test
            if ( !mQ || mQ.media !== "(pointer: coarse)" || !mQ.matches ) {
                throw new Error('failed test `mediaQueryList`');
            }

            // if there are no failures the possibility of the device being mobile is great (but not guaranteed)
            return true;
        } catch(ex) {
            // fall back to User-Agent sniffing
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(wua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(wua.substr(0,4));
        }
    })(document, window);

    // custom `Error`
    function PrequelCustomError(message, code) {
       this.message = message || '';
       this.code = code;
    };
    // prototype
    PrequelCustomError.prototype = Error.prototype;

    // redirect page
    function redirect2Page(page) {
        var target = !!page ? (BaseRoot + page) : BaseRoot;
        if ( wd.location.search !== '' ) {
            target += wd.location.search
        }
        wd.location.replace(target);
    };

    // run-time pre check cookies arent enabled
    ;(function cookieAvailabilityWatcher() {
        if ( !wd.navigator.cookieEnabled && !/nocookie\.html/.test(wd.location.href) ) {
            redirect2Page('nocookie.html');
        }
        if ( wd.navigator.cookieEnabled && /nocookie\.html/.test(wd.location.href) ) {
            redirect2Page();
        }
        setTimeout(cookieAvailabilityWatcher, 500);
    })();

    // is "nocookie" page?
    if ( /nocookie\.html/.test(wd.location.href) ) {
        // stop last script execution
        return;
    }
    //
    try {
        /**
         * @description test `localStorage` API
         * @note    - `localStorage` may not be supported or disabled
         * @support - in date (May, 07th 2020) 98.26% {@link https://caniuse.com/#feat=namevalue-storage}
         */
        if ( typeof wd.localStorage !== 'undefined' ) {
            // check if ES6 is supported
            function ES6Tester() {
                // check `Symbol` support
                if ( typeof wd['Symbol'] === 'undefined' ) {
                    throw new PrequelCustomError('"Symbol" ES6 not detected! Your browser don\'t support "ES6"', 1);
                }
                eval('class Foo {};');
                // EventTarget with constructor
                eval("class Bar extends EventTarget { constructor() { super(); } };");
                // Arrow Function
                eval('var bar = (x) => x+1;');
                // Const
                eval('const noop = 1;');
                // Let
                eval('let x = 1;');
                // Async
                eval(';(function() { async _ => _; })();');
                // Spread operator
                eval(';[..."a","b","c"];');
                return true
            };
            // check excential API's (assuming that ES6 is supported)
            function ExcentialsAPIs() {
                /**
                 * ES6 Module Detection:
                 *   -- latests browser(s) support ES6 Modules, support "nomodule" attribute to ignore non module scripts
                 *   -- this reflect "static import": import {bar} from './foo.mjs'
                 */
                var script = document.createElement('script');
                var nv = wd.navigator,
                    excentials = {
                    /**
                     * @status  - active
                     * @support - in date (February, 2th 2021) 90.88% {link @link https://caniuse.com/mdn-javascript_builtins_globalthis}
                     */
                    GlobalThis: {
                        docs: 'JavaScript/Reference/Global_Objects/globalThis',
                        status: ( !(!globalThis) && (typeof globalThis === 'object') ) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (January, 28th 2020) 74.28% {@link https://caniuse.com/mdn-api_storagemanager_persist}
                     */
                    Persist: {
                        docs: 'API/StorageManager/persist',
                        status: ( ('storage' in nv) && ('persist' in nv.storage) ) ? true : false
                    },
                    /**
                     * @status  - disabled
                     * @reason  - low global support
                     * @support - in date (May, 07th 2020) 72.84% {@link https://caniuse.com/#feat=feature-policy}
                     *
                    featurePolicy: {
                        docs: 'HTTP/Feature_Policy',
                        status: ('featurePolicy' in dc) ? true : false
                    },
                    /**
                     * @status  - active
                     * @note A  - Firefox bug {@link https://bugzilla.mozilla.org/show_bug.cgi?id=1559743}
                     * @note B  - Firefox >= 65 support webp images but, don't support this syncronous detection
                     * @support - in date (january, 28th 2021) 91.36% {@link https://caniuse.com/webp}
                     */
                    WebP: {
                        docs: 'Media/Formats/Image_types#WebP',
                        status: (dc.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0) ? true : false
                    },
                     /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 94.41% {@link https://caniuse.com/#feat=gamepad}
                     */
                    GamePad: {
                        docs: 'API/Gamepad_API',
                        status: ( ('Gamepad' in wd) && ('getGamepads' in wd.navigator) ) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 90.82% {@link https://caniuse.com/#feat=mdn-api_mediadevices_getusermedia}
                     */
                    getUserMedia: {
                        docs: 'API/MediaDevices/getUserMedia',
                        status: ( ('mediaDevices' in nv) || ('getUserMedia' in nv) || ('webkitGetUserMedia' in nv) || ('mozGetUserMedia' in nv) ) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 92.41% {@link https://caniuse.com/#feat=rtcpeerconnection}
                     */
                    RTCPeerConnection: {
                        docs: 'API/RTCPeerConnection',
                        status: ('RTCPeerConnection' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @note    - see bug to use "correct way" to detect support {@link https://github.com/w3c/IntersectionObserver/issues/211}
                     * @support - in date (May, 07th 2020) 92.59% {@link https://caniuse.com/#feat=intersectionobserver}
                     */
                    Intersection: {
                        docs: 'API/Intersection_Observer_API',
                        status: ('IntersectionObserver' in wd && 'IntersectionObserverEntry' in wd && 'intersectionRatio' in wd.IntersectionObserverEntry.prototype && 'isIntersecting' in IntersectionObserverEntry.prototype) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 96.99% {@link https://caniuse.com/#feat=indexeddb}
                     */
                    IndexedDB: {
                        docs: 'API/IndexedDB_API',
                        status: ( ('indexedDB' in wd) && ('IDBTransaction' in wd) && ('IDBKeyRange' in wd) ) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 97.57% {@link https://caniuse.com/#feat=geolocation}
                     */
                    Geolocation: {
                        docs: 'API/Geolocation_API',
                        status: ('geolocation' in nv) ? true : false
                    },
                    /**
                     * @status  - active
                     * @note    - low support but, excential for this system
                     * @support - in date (May, 07th 2020) 76.27% {@link https://caniuse.com/#feat=notifications}
                     */
                    Notification: {
                        docs: 'API/Notifications_API',
                        status: ('Notification' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @note    - low support but, excential for this system
                     * @support - in date (May, 07th 2020) 76.99% {@link https://caniuse.com/#feat=push-api}
                     */
                    Push: {
                        docs: 'API/Push_API',
                        status: ('PushManager' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 97.2% {@link https://caniuse.com/#feat=webworkers}
                     */
                    Worker: {
                        docs: 'API/Web_Workers_API',
                        status: ('Worker' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 94.02% {@link https://caniuse.com/#feat=beacon}
                     */
                    sendBeacon: {
                        docs: 'API/Navigator/sendBeacon',
                        status: ('sendBeacon' in nv) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 95.16% {@link https://caniuse.com/#feat=promises}
                     */
                    Promise: {
                        docs: 'JavaScript/Reference/Global_Objects/Promise',
                        status: ('Promise' in wd) ? true : false

                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 93.89% {@link https://caniuse.com/#feat=proxy}
                     */
                    Proxy: {
                        docs: 'JavaScript/Reference/Global_Objects/Proxy',
                        status: ('Proxy' in wd) ? true : false

                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 91.56% {@link https://caniuse.com/#feat=mdn-javascript_builtins_reflect}
                     */
                    Reflect: {
                        docs: 'JavaScript/Reference/Global_Objects/Reflect',
                        status: ('Reflect' in wd) ? true : false

                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 93.68% {@link https://caniuse.com/#feat=serviceworkers}
                     */
                    ServiceWorker: {
                        docs: 'API/Service_Worker_API',
                        status: ('serviceWorker' in nv) ? true : false

                    },
                    /**
                     * @status  - active
                     * @note    - low support but, excential for this system (@revise - this block Safari users)
                     * @support - in date (January, 28th 2021) 76.26% {@link https://caniuse.com/broadcastchannel}
                     * @support detailed:
                     *   -- Firefox >= 38   (desktop)
                     *   -- Firefox >= 62   (mobile)(Android)
                     *   -- Chrome  >= 54   (desktop)
                     *   -- Chrome  >= 69   (mobile)(Android)
                     *   -- Edge    >= 79   (desktop)
                     *   -- Opera   >= 41   (desktop)
                     *   -- Opera   >= 46   (mobile)
                     *   -- Android >= 67   (WebView)
                     *   -- UC      >= 11.8 (mobile)(Android)
                     *   -- Samsung >= 7.2  (mobile)
                     */
                    BroadcastChannel: {
                        docs: 'API/BroadcastChannel/BroadcastChannel',
                        status: ('BroadcastChannel' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @note    - low support but, excential for this system (this refers to the `constructor`)
                     * @support - in date (January, 28th 2021) 86.87% {@link https://caniuse.com/#feat=mdn-api_eventtarget_eventtarget}
                     */
                    EventTarget: {
                        docs: 'API/EventTarget/EventTarget',
                        status: ('EventTarget' in wd) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 93.53% {@link https://caniuse.com/#feat=subresource-integrity}
                     */
                    integrity: {
                        docs: 'Security/Subresource_Integrity',
                        status: ('integrity' in script) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 90.11% {@link https://caniuse.com/#feat=mdn-html_elements_script_nomodule}
                     */
                    noModule: {
                        docs: 'API/HTMLScriptElement#Properties',
                        status: ('noModule' in script) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 96.26% {@link https://caniuse.com/#feat=cryptography}
                     */
                    Crypto: {
                        docs: 'API/Web_Crypto_API',
                        status: ( ('crypto' in wd) && ('subtle' in crypto) ) ? true : false
                    },
                    /**
                     * @status  - active
                     * @support - in date (May, 07th 2020) 83.16% {@link https://caniuse.com/#feat=webauthn}
                     */
                    WebAuthn: {
                        docs: 'API/Web_Authentication_API',
                        status: ( ('credentials' in nv) && ('PublicKeyCredential' in wd) && (typeof PublicKeyCredential !== "undefined") ) ? true : false
                    },
                    /**
                     * @status   - active
                     * @suppoert - in date (January, 28th 2021) 93.85% {@link https://caniuse.com/speech-synthesis}
                     */
                    SpeechSynthesis: {
                        docs: 'API/SpeechSynthesis',
                        status: ('speechSynthesis' in wd) ? true : false
                    }
                };

                // Special case of Firefox WebP images
                if ( !excentials.WebP.status && /firefox/i.test(nv.userAgent) ) {
                    // check for Firefox greater than 65 version
                    let match = nv.userAgent.match(/Firefox\/([0-9]+)\./),
                        FirefoxVersion = match ? parseInt(match[1]) : 0
                    if ( FirefoxVersion >= 65 ) {
                        // rewrite "status"
                        excentials.WebP.status = true
                    }
                }

                // save to storage (used to display info)
                wd.localStorage.setItem('EXCENTIAL_APIS', JSON.stringify(excentials));
                // test excentials support
                let keys = Object.keys(excentials);
                for (let i = 0; i < keys.length; i++) {
                    // ignore ES6Module
                    if ( keys[i] !== 'noModule' && excentials[keys[i]]['status'] === false ) {
                        // this break "loop"
                        throw new PrequelCustomError('Your browser don\'t support one or more features that are required for use this site ... see status table bellow:', 2)
                    }
                }
                // clear
                wd.localStorage.removeItem('EXCENTIAL_APIS');
                return true
            };
            // case it's "oldbrowser" page and "pass test" ... redirect to base website
            if ( ES6Tester() && ExcentialsAPIs() && /oldbrowser\.html/.test(wd.location.href) ) {
                redirect2Page();
            }

            function isRootOrOldBrowsersPage() {
                var path = wd.location.pathname
                if ( /oldbrowser\.html/.test(wd.location.href) || wd.location.href === BaseRoot || (path.length === 0 || path.length === 1 || path === '/index.html' || path === '/index') ) {
                    return false
                }
                return true
            }

            // case not it's "index" or "oldbrowser" page and "pass test" ... check if `ServiceWorker()` already instaled
            if ( ES6Tester() && ExcentialsAPIs() && isRootOrOldBrowsersPage() ) {
                /**
                 * Service Worker verification
                 * @note - bad use
                 *
                wd.navigator.serviceWorker.getRegistrations().then(registrations => {
                    // case no have "service"
                    if ( registrations.length === 0 ) {
                        // redirect
                        redirect2Page();
                    }
                });
                 */
            }

        } else {
            // possible Anonymous Mode from old browsers
            throw new PrequelCustomError('"Storage" API is not detected! This site require use of storagement!', 0);
        }
    } catch(e) {
        // redirect
        if ( !/oldbrowser\.html/.test(wd.location.href) ) {
            // prevent ...
            if ( wd.navigator.cookieEnabled ) {
                wd.localStorage.clear();
                // redirect to "oldbrowser" page
                redirect2Page('oldbrowser.html');
            } else {
                // redirect to "nocookie" page
                redirect2Page('nocookie.html');
            }

        } else {
            // check custom error
            if ( 'code' in e ) {
                switch (e.code) {
                    // `Storage` API not detected ... possible Anonimous Mode (incognitous)
                    case 0:
                        console.log('%c' + e.message, 'color:red;');
                        break;
                    // `Symbol` ES6 not detected ... nothing to show
                    case 1:
                        console.log('%c' + e.message, 'color:red;');
                        break;
                    // Excential API is not supported ... show info
                    case 2:
                        if ( wd.localStorage.getItem('EXCENTIAL_APIS') ) {
                            // Error in excentials API's ... "loop" for show status in console
                            var excentials = JSON.parse(wd.localStorage.getItem('EXCENTIAL_APIS'));
                            var tbody = dc.getElementById('unsupported-list-tbody');
                            Object.keys(excentials).forEach(function(item, index, array) {
                                var trClass = (excentials[item]['status'] === true) ? "table-success" : "table-danger";
                                tbody.insertAdjacentHTML('afterbegin', "<tr class='" + trClass + "'><td>" + item + "</td><td>" + excentials[item]['status'] + "</td><td><a href='" + MozillaDocs + excentials[item]['docs'] + "' target='_blank' rel='noopener'>" + excentials[item]['docs'] + "</a></td></tr>");
                                excentials[item]['docs'] = MozillaDocs + excentials[item]['docs'];
                                if ( index === array.length -1 ) {
                                    console.log('%cECMAScript5 or above is required!\n%c' + e.message, 'font-weight:bold;font-size:16px;', 'color:red;');
                                    console.table(excentials);
                                }
                            });
                        }
                        var showListBtn = dc.getElementById('show-unsupported-list');
                        var listBlock = dc.getElementById('unsupported-list-block');
                        showListBtn.classList.remove('d-none')
                        showListBtn.addEventListener('click', function(evt) {
                            listBlock.classList.remove('d-none');
                            this.classList.add('d-none');
                        }, false);
                        break;

                    // possible `window.cookiesEnabled` false (disabled)
                    default:
                        if ( !wd.navigator.cookieEnabled || typeof wd.localStorage === 'undefined' ) {
                            redirect2Page('nocookie.html');
                        }
                        break;
                }
            } else {
                console.error(e);
            }
        }
        // prevent ...
        if ( wd.navigator.cookieEnabled ) {
            wd.localStorage.clear();
        }
        // suggest browser's to update (or upgrade version)
        if ( !isMobile ) {
            // remove desktop browesrs suggest link
            var suggests = dc.getElementsByClassName('browser-suggest-link');
            for ( var i = 0; i < suggests.length; i++) {
                 suggests[i].classList.add('d-block');
                 suggests[i].classList.remove('d-none');
            }
        } else {
            var disableSuggestList = dc.querySelectorAll('[data-disable-mobile-suggest]');
            if ( disableSuggestList ) {
                for (var j = 0; j < disableSuggestList.length; j++) {
                    disableSuggestList[j].parentElement.removeChild(disableSuggestList[j]);
                }
            }
            var info = dc.getElementsByClassName('mobile-info');
            for (var i = 0; i < info.length; i++) {
                info[i].classList.add('d-block');
                info[i].classList.remove('d-none');
            }
        }
    }
})(window, document);