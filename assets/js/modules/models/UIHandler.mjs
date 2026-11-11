/**
 * User Interface Event Handlers
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import _, {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts,
    // PHP time() approach
    time,
    // protocol
    uri,
    // root (domain)
    BaseRoot,
    // XMLHttpRequest
    XHR,
    // FormData
    FD,
    // global get APIS...
    indexedDB,
    IDBTransaction,
    IDBKeyRange,
    URL,
    Geolocation,
    RegLogout,
    Notifics,
    Fetch,
    Storage,
    Worker,
    ServiceWorker,
    Promise
} from '../helpers/Exporter.mjs'


/**
 * For Slides Menus (left|right|top|bottom)
 */
const SlideMenus = () => {

    // get dinamic
    _.DOM.waitEl(dc, 'a[id^="slide-"]', list => {
        ;[...list].forEach(item => {
            // `<a>` click
            _.DOM.event(item, 'click', evt => {
                let self = evt.currentTarget
                // prevent navigation
                evt.preventDefault()

                // exit handler
                if ( self.getAttribute('href') === '#body' ) {
                    return
                }

                // prevent hide drawer
                let drawer = _.DOM.querySelector('.drawer-container');
                if ( _.DOM.isVisible(drawer) ) {
                    // simple hide
                    dc.body.click()
                }

                // hide current slide
                const HideSlidePanel = (slide, direction) => {
                    // get closer
                    let closer = slide.querySelector('a[id^="slide-link"]');
                    if ( closer && closer.getAttribute('href') === '#body' ) {
                        _.DOM.event(closer, 'click', evt => {
                            // prevent navigation
                            evt.preventDefault()
                            // adjust
                            slideThis.classList.remove(`slide-margin-${direction}0`)
                        }, _.EventOptions(false, false, false))
                    }
                }

                // target
                let slideThis = _.DOM.getById(self.getAttribute('href').slice(1))

                switch (true) {
                    case (slideThis.classList.contains('slide-left')): {
                        slideThis.classList.add('slide-margin-left0')
                        HideSlidePanel(slideThis, 'left')
                        break
                    }
                    case (slideThis.classList.contains('slide-top')): {
                        slideThis.classList.add('slide-margin-top0')
                        HideSlidePanel(slideThis, 'top')
                        break
                    }
                    case (slideThis.classList.contains('slide-right')): {
                        slideThis.classList.add('slide-margin-right0')
                        HideSlidePanel(slideThis, 'right')
                        break
                    }
                    case (slideThis.classList.contains('slide-bottom')): {
                        slideThis.classList.add('slide-margin-bottom0')
                        HideSlidePanel(slideThis, 'bottom')
                        break
                    }
                }

            }, _.EventOptions(false, false, false))
        })
    })
    // @todo: add observer
}



/**
 * Request the browser's native notification permission.
 * The API call must happen directly inside the user's click gesture.
 */
const NotificationRequest =( permissions , notify)=> {
    _.DOM.waitEl(dc, '#modal-notification-request', list => {
        ;[...list].forEach(button => {
            if (button.dataset.notificationRequestBound === 'true') return
            button.dataset.notificationRequestBound = 'true'

            _.DOM.event(button, 'click', async evt => {
                evt.preventDefault()

                const NotificationAPI = wd.Notification

                if (!NotificationAPI || typeof NotificationAPI.requestPermission !== 'function') {
                    if (permissions?.status) permissions.status.notifications = 'unsupported'
                    return
                }

                try {
                    // A solicitação acontece diretamente no clique.
                    const permissionRequest = NotificationAPI.requestPermission()
                    const result = await permissionRequest
                    const state = result === 'default' ? 'prompt' : result
if (permissions?.status) {
    permissions.status.notifications = state
}

// NotifyJS handles the welcome notification and HTML fallback.
if (state === 'granted' && notify) {
    notify.notifyPermissionGranted()
}
                } catch (error) {
                    if (permissions?.status) permissions.status.notifications = 'error'
                    console.error('[UIHandler] Could not request notification permission:', error)
                }
            })
        })
    })
}

const DrawerEvents = (permissions = null, notify = null) => {
    NotificationRequest(permissions, notify)
    let drawer = [];
    // get dinamic
    _.DOM.waitEl(dc, 'picture[id^="drawer-"]', list => {
        ;[...list].forEach(item => {
            _.DOM.event(item, 'click', evt => {
                let self = evt.currentTarget
                evt.stopPropagation()
                let targetid = self.id
                let bod = _.DOM.getByTagName('html')[0]

                if ( drawer.includes(targetid) ) {
                    for (let k in drawer) {
                         if ( drawer[k] === targetid ) {
                             let parts = drawer[k].split('-'),
                                 target;
                             if ( parts.length > 2 ) {
                                 target = _.DOM.querySelector('.' + parts[0] + '-' + parts[1])
                             } else {
                                 target = _.DOM.querySelector('.' + drawer[k])
                             }
                             target ? target.classList.add('invisible') : null;
                             drawer.splice(k, 1)
                         }
                    }
                    return
                } else {
                    for (let k in drawer) {
                         if ( drawer[k] !== targetid ) {
                             let parts = drawer[k].split('-')
                             if ( parts.length > 2 ) {
                                 _.DOM.querySelector('.' + parts[0] + '-' + parts[1]).classList.add('invisible')
                             } else {
                                 _.DOM.querySelector('.' + drawer[k]).classList.add('invisible')
                             }
                             drawer.splice(k, 1)
                         }
                    }
                    drawer.push(targetid)
                }

                // set UI
                let setDrawerUI = (btn) => {
                    let idtoclass = btn.id,
                        parts = btn.id.split('-')
                    if ( parts.length > 2 ) {
                        idtoclass = parts[0] + '-' + parts[1]
                    }
                    let drawerElement = _.DOM.querySelector('.' + idtoclass)
                    if ( drawerElement && drawerElement.length !== 0 ) {

                        // fix drawer
                        if ( _.DOM.getById('navbar-fixed').length ) {
                            drawerElement.classList.remove('pa')
                            drawerElement.classList.add('fx')
                        }
                        // adjust to mobile [if is]
                        if ( _.isMobile ) {
                            drawerElement.classList.add('col','w-100')
                            drawerElement.classList.remove('drawer-md')
                            let iconsContainer = _.DOM.getById('drawer-icons')
                            iconsContainer.classList.remove('p-3')
                            iconsContainer.classList.add('p-2')
                            let onResize = () => {
                                if ( wd.innerWidth > 480 ) {
                                    ;[..._.DOM.querySelectorAll('[id^="drawer-icons"] div')].forEach(div => (div.classList.remove('p-3', 'col-4'), div.classList.add('col-2', 'p-2')))
                                } else {
                                    ;[..._.DOM.querySelectorAll('[id^="drawer-icons"] div')].forEach(div => (div.classList.remove('p-3', 'col-4'), div.classList.add('col-4', 'p-2')))
                                }
                            }
                            onResize()
                            //
                            _.DOM.event(wd, 'resize', onResize)
                            let pos     = _.DOM.getPosition(btn),
                                hY  = btn.offsetHeight / 2,          // half / 3
                                cX  = pos.x + (btn.offsetWidth / 2),
                                cY  = pos.y + btn.offsetHeight + (hY / 2)

                            drawerElement.style.top = cY + 'px'
                            drawerElement.classList.remove('invisible')
                            let ele = _.DOM.getPosition(drawerElement)
                            // adjust arrows
                            _.DOM.querySelector('.arrow-up').style.left = ((cX - ele.x) - 10) + 'px'
                            _.DOM.querySelector('.arrow-up-s').style.left = ((cX - ele.x) - 25) + 'px'
                        } else {
                            // width
                            let width = drawerElement.clientWidth,//drawerElement.width(),
                                // get cordinates (x,y)
                                pos     = _.DOM.getPosition(btn),
                                // calculate
                                hY  = btn.offsetHeight / 2,          // half / 3
                                cX  = pos.x + (btn.offsetWidth / 2), // cordinate x (tringle left)
                                cY  = pos.y + btn.offsetHeight + (hY / 2), // cordinate y (container top)
                                lr  = pos.x + (btn.offsetWidth / 2) - (width / 2), // left result (container)
                                lf // reserved for final left
                            // check if great than 25px margin limit
                            if ( lr < 25 ) {
                                lf = 25 // define limit
                            } else {
                                lf = lr
                            }
                            // check if "lf" is great than window width minus 25px (limit)
                            if ( (lf + width) > (wd.innerWidth - 25) ) {
                                let diff = (wd.innerWidth - 25) - (lf + width)
                                lf       = lr + diff
                            }

                            // show container
                            drawerElement.style.top = cY + 'px'
                            drawerElement.style.left = lf + 'px'
                            drawerElement.classList.remove('invisible')
                            let ele = _.DOM.getPosition(drawerElement)//.position()

                            // adjust arrows
                            _.DOM.querySelector('.arrow-up').style.left = ((cX - ele.x) - 10) + 'px'
                            _.DOM.querySelector('.arrow-up-s').style.left = ((cX - ele.x) - 10) + 'px'
                        }
                    }
                }

               let inEvents = () => {
                    if ( drawer.length > 0 ) {
                        let target = _.DOM.getById(drawer[0]);
                        if ( _.DOM.isVisible(target) ) {
                            setDrawerUI(target)
                        } else {
                            let parts = drawer[0].split('-')
                            if ( parts.length > 2 ) {
                                let elements = _.DOM.querySelectorAll('[id^="' + parts[0] + '-' + parts[1] + '"]')
                                if ( !!elements ) {
                                    ;[...elements].forEach(element => {
                                        if ( element.offsetHeight > 0 ) {
                                            setDrawerUI(element)
                                        }
                                    })
                                }
                            }
                        }
                    }
                }

                // event resize
                _.DOM.event(wd, 'resize', () => {
                    inEvents()
                })
                // event scrool
                _.DOM.event(wd, 'scroll', () => {
                    if ( bod.scrollTop > 0 ) {
                        inEvents()
                    }
                })
                // atach event click on document
                _.DOM.event(dc, 'click', event => {
                    if( !event.target.closest('.drawer-container') ) {
                       // is visible?
                       if ( drawer.length > 0 ) {
                           for (let k in drawer) {
                                if ( drawer.hasOwnProperty(k) ) {
                                    let parts = drawer[k].split('-')
                                    if ( parts.length > 2 ) {
                                        _.DOM.querySelector('.' + parts[0] + '-' + parts[1]).classList.add('invisible')
                                    } else {
                                        _.DOM.querySelector('.' + drawer[k]).classList.add('invisible')
                                    }
                                    drawer.splice(k, 1)
                                }
                           }
                        }
                    }
                })
                // init
                setDrawerUI(self)

            }) // end click event on drawer
        })
    })
}

export { DrawerEvents, SlideMenus }