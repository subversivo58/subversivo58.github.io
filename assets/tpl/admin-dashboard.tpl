
<!-- ADMIN DASHBOARD -->
<section id="admin-dashboard" class="admin-dashboard-shell w-100">

    <!-- MOBILE HEADER -->
    <header class="admin-mobile-bar d-flex d-md-none align-items-center justify-content-between px-3 py-2 bg-white border-bottom">
        <button
            type="button"
            id="admin-sidebar-toggle"
            class="i18n btn btn-sm btn-outline-secondary rounded-0 cp d-inline-flex align-items-center"
            aria-controls="admin-sidebar"
            aria-expanded="false"
            data-i18n-title="admin_dashboard.menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span class="i18n ml-2" data-i18n-html="admin_dashboard.menu"></span>
        </button>

        <span class="i18n font-weight-bold text-truncate mx-2" data-i18n-html="admin_dashboard.title"></span>

        <button
            type="button"
            id="admin-mobile-new-post"
            class="i18n btn btn-sm btn-info rounded-0 cp"
            data-i18n-title="admin_dashboard.new_post">+</button>
    </header>

    <div id="admin-sidebar-backdrop" class="admin-sidebar-backdrop d-md-none" hidden></div>

    <div class="admin-layout d-flex w-100">

        <!-- SIDEBAR UNIFICADA -->
        <aside id="admin-sidebar" class="admin-sidebar border-right d-flex flex-column" aria-label="Admin Navigation">

            <div class="admin-sidebar-head d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
                <div class="min-w-0">
                    <div class="i18n font-weight-bold text-truncate" data-i18n-html="admin_dashboard.title"></div>
                    <small class="i18n text-muted d-block text-truncate" data-i18n-html="admin_dashboard.description"></small>
                </div>
                <button
                    type="button"
                    id="admin-sidebar-close"
                    class="i18n btn btn-sm btn-outline-secondary rounded-0 d-md-none ml-2 cp"
                    data-i18n-title="admin_dashboard.close_menu">&times;</button>
            </div>

            <nav class="admin-sidebar-nav p-2 flex-grow-1" role="tablist">

                <button
                    type="button"
                    data-admin-nav="posts"
                    class="admin-nav-btn active cp"
                    role="tab"
                    aria-selected="true">
                    <svg class="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="8" y1="13" x2="16" y2="13"></line>
                        <line x1="8" y1="17" x2="16" y2="17"></line>
                    </svg>
                    <span class="i18n admin-nav-label" data-i18n-html="admin_dashboard.posts"></span>
                    <span id="admin-posts-badge" class="badge badge-secondary ml-auto">0</span>
                </button>

                <button
                    type="button"
                    data-admin-nav="footoodles"
                    class="admin-nav-btn cp"
                    role="tab"
                    aria-selected="false">
                    <svg class="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span class="i18n admin-nav-label" data-i18n-html="admin_dashboard.footoodles.tab"></span>
                    <span id="admin-footoodles-badge" class="badge badge-secondary ml-auto">0</span>
                </button>

                <button
                    type="button"
                    data-admin-nav="session"
                    class="admin-nav-btn cp"
                    role="tab"
                    aria-selected="false">
                    <svg class="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span class="i18n admin-nav-label" data-i18n-html="admin_dashboard.nav.session"></span>
                    <span id="admin-session-nav-dot" class="admin-status-dot ml-auto" aria-hidden="true"></span>
                </button>

                <!-- DEVTOOLS -->
                <button
                    type="button"
                    data-admin-nav="devtools"
                    class="admin-nav-btn cp"
                    role="tab"
                    aria-selected="false">
                    <svg class="admin-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 8V4"></path>
                        <path d="M8 4h8"></path>
                        <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                        <path d="M9 13h.01"></path>
                        <path d="M15 13h.01"></path>
                        <path d="M9 17h6"></path>
                    </svg>
                    <span class="i18n admin-nav-label" data-i18n-html="admin_dashboard.devtools.title">DevTools</span>
                </button>

            </nav>

            <!-- CARD DE IDENTIDADE GITHUB NA SIDEBAR -->
            <div class="admin-sidebar-user p-3 border-top">
                <div class="d-flex align-items-center mb-2">
                    <picture class="mr-2 flex-shrink-0">
                        <img
                            id="admin-github-avatar"
                            src="/assets/media/image/1x1.gif"
                            data-src=""
                            data-lazy-target
                            alt=""
                            class="rounded-circle border bg-white"
                            width="40"
                            height="40">
                    </picture>
                    <div class="min-w-0">
                        <div id="admin-github-name" class="font-weight-bold small text-truncate"></div>
                        <div id="admin-github-login" class="text-muted small text-truncate"></div>
                    </div>
                </div>

                <button
                    type="button"
                    id="admin-github-credentials-clear"
                    class="i18n btn btn-outline-danger btn-sm rounded-0 w-100 cp"
                    data-i18n-html="admin_dashboard.settings.clear_credentials"></button>
            </div>

        </aside>

        <!-- ÁREA PRINCIPAL -->
        <main id="admin-dashboard-content" class="admin-main flex-grow-1 p-3 p-lg-4">

            <!-- VIEW 1: POSTAGENS -->
            <section id="admin-view-posts" class="admin-view">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-3 border-bottom">
                    <div class="mb-2 mb-md-0">
                        <h1 class="i18n h4 mb-1" data-i18n-html="admin_dashboard.posts"></h1>
                        <p class="i18n text-muted small mb-0" data-i18n-html="admin_dashboard.posts_view.subtitle"></p>
                    </div>
                    <div class="d-flex flex-wrap align-items-center">
                        <input
                            type="search"
                            id="admin-posts-search"
                            class="i18n form-control form-control-sm rounded-0 mr-2 mb-2 mb-sm-0 admin-search-input"
                            data-i18n-place="admin_dashboard.posts_view.search_placeholder"
                            autocomplete="off">
                        <button
                            type="button"
                            id="admin-new-post"
                            class="i18n btn btn-info btn-sm rounded-0 px-3 cp"
                            data-i18n-html="admin_dashboard.new_post"></button>
                    </div>
                </div>

                <div id="admin-posts-empty" class="p-4 text-center border bg-white text-muted small" hidden>
                    <span class="i18n" data-i18n-html="admin_dashboard.posts_view.empty"></span>
                </div>

                <div id="admin-posts-list" class="admin-posts-grid"></div>
            </section>

            <!-- VIEW 2: EDITOR WYSIWYG -->
            <section id="admin-view-editor" class="admin-view" hidden>
                <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <button
                            type="button"
                            id="admin-back-to-posts"
                            class="i18n btn btn-outline-secondary btn-sm rounded-0 mr-3 cp"
                            data-i18n-html="admin_dashboard.posts_view.back"></button>
                        <h2 id="admin-editor-heading" class="i18n h5 mb-0" data-i18n-html="admin_dashboard.new_post"></h2>
                    </div>
                </div>

                <div id="admin-post-editor" class="bg-white border p-3 p-lg-4"></div>
            </section>

            <!-- VIEW 3: FOOTOODLES -->
            <section id="admin-view-footoodles" class="admin-view" hidden>
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 pb-3 border-bottom">
                    <div class="mb-2 mb-md-0">
                        <h2 class="i18n h4 mb-1" data-i18n-html="admin_dashboard.footoodles.title"></h2>
                        <p class="i18n text-muted small mb-0" data-i18n-html="admin_dashboard.footoodles.subtitle"></p>
                    </div>
                    <button
                        type="button"
                        data-footoodles-new
                        class="i18n btn btn-info btn-sm rounded-0 px-3 cp"
                        data-i18n-html="admin_dashboard.footoodles.new"></button>
                </div>

                <div id="admin-footoodles-editor-panel" class="mb-4" hidden></div>

                <div id="admin-footoodles-empty" class="p-4 text-center border bg-white text-muted small" hidden>
                    <span class="i18n" data-i18n-html="admin_dashboard.footoodles.empty"></span>
                </div>

                <div id="admin-footoodles-list" class="row"></div>
            </section>

            <!-- VIEW 4: SESSÃO GITHUB -->
            <section id="admin-view-session" class="admin-view" hidden>
                <div class="mb-3 pb-3 border-bottom">
                    <h2 class="i18n h4 mb-1" data-i18n-html="admin_dashboard.session.title"></h2>
                    <p class="i18n text-muted small mb-0" data-i18n-html="admin_dashboard.session.subtitle"></p>
                </div>

                <div class="row">
                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card rounded-0 h-100 border">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <picture class="mr-3 flex-shrink-0">
                                        <img
                                            id="admin-session-avatar"
                                            src="/assets/media/image/1x1.gif"
                                            data-src=""
                                            data-lazy-target
                                            alt=""
                                            class="rounded-circle border"
                                            width="64"
                                            height="64">
                                    </picture>
                                    <div class="min-w-0">
                                        <h3 id="admin-session-name" class="h5 mb-1 text-truncate"></h3>
                                        <p id="admin-session-login" class="small text-muted mb-1 text-truncate"></p>
                                        <span id="admin-session-status-badge" class="badge badge-secondary"></span>
                                    </div>
                                </div>

                                <dl class="row small mb-3">
                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="github_auth.identity.id_label"></dt>
                                    <dd id="admin-session-id" class="col-sm-7 mb-1 text-monospace"></dd>

                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="github_auth.identity.profile_label"></dt>
                                    <dd class="col-sm-7 mb-1 text-truncate">
                                        <a id="admin-session-profile" href="" target="_blank" rel="noopener noreferrer"></a>
                                    </dd>

                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="github_auth.identity.email_label"></dt>
                                    <dd id="admin-session-email" class="col-sm-7 mb-1 text-truncate"></dd>

                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="admin_dashboard.session.scope_label"></dt>
                                    <dd id="admin-session-scope" class="col-sm-7 mb-1 text-monospace"></dd>

                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="admin_dashboard.session.obtained_label"></dt>
                                    <dd id="admin-session-obtained" class="col-sm-7 mb-1"></dd>

                                    <dt class="i18n col-sm-5 text-muted" data-i18n-html="admin_dashboard.session.expires_label"></dt>
                                    <dd id="admin-session-expires" class="col-sm-7 mb-0"></dd>
                                </dl>

                                <div class="d-flex flex-wrap">
                                    <button
                                        type="button"
                                        id="admin-session-refresh"
                                        class="i18n btn btn-info btn-sm rounded-0 mr-2 mb-2 cp"
                                        data-i18n-html="admin_dashboard.session.refresh_btn"></button>
                                    <button
                                        type="button"
                                        id="admin-session-credentials-clear"
                                        class="i18n btn btn-outline-danger btn-sm rounded-0 mb-2 cp"
                                        data-i18n-html="admin_dashboard.settings.clear_credentials"></button>
                                </div>

                                <p id="admin-session-refresh-status" class="small mt-2 mb-0" role="status" aria-live="polite" hidden></p>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card rounded-0 h-100 border">
                            <div class="card-header bg-white d-flex align-items-center justify-content-between py-2">
                                <span class="i18n small font-weight-bold" data-i18n-html="admin_dashboard.session.diagnostics_title"></span>
                                <button
                                    type="button"
                                    id="admin-session-diagnostics-refresh"
                                    class="i18n btn btn-outline-secondary btn-sm rounded-0 cp"
                                    data-i18n-html="admin_dashboard.session.reload_diagnostics"></button>
                            </div>
                            <div class="card-body p-3">
                                <pre id="admin-session-diagnostics" class="admin-session-diagnostics small bg-light border p-2 mb-0"></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- VIEW 5: DEVTOOLS -->
            <section id="admin-view-devtools" class="admin-view" hidden>

                <div class="mb-3 pb-3 border-bottom">
                    <h2 class="i18n h4 mb-1" data-i18n-html="admin_dashboard.devtools.title">DevTools</h2>
                    <p class="i18n text-muted small mb-0" data-i18n-html="admin_dashboard.devtools.subtitle"></p>
                </div>

                <div class="row">

                    <!-- INDEXEDDB -->
                    <div class="col-12 mb-4">
                        <div class="card rounded-0 border">
                            <div class="card-header bg-white py-2">
                                <h3 class="i18n h6 mb-0" data-i18n-html="admin_dashboard.devtools.indexeddb.title">IndexedDB</h3>
                            </div>
                            <div class="card-body">
                                <div id="admin-devtools-indexeddb" class="small">
                                    <p class="i18n text-muted mb-0" data-i18n-html="admin_dashboard.devtools.loading"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- LOCAL STORAGE -->
                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card rounded-0 h-100 border">
                            <div class="card-header bg-white py-2">
                                <h3 class="i18n h6 mb-0" data-i18n-html="admin_dashboard.devtools.local_storage.title">Local Storage</h3>
                            </div>
                            <div class="card-body">
                                <div id="admin-devtools-local-storage" class="small">
                                    <p class="i18n text-muted mb-0" data-i18n-html="admin_dashboard.devtools.loading"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CACHE STORAGE -->
                    <div class="col-12 col-lg-6 mb-4">
                        <div class="card rounded-0 h-100 border">
                            <div class="card-header bg-white py-2">
                                <h3 class="i18n h6 mb-0" data-i18n-html="admin_dashboard.devtools.cache_storage.title">Cache Storage</h3>
                            </div>
                            <div class="card-body">
                                <div id="admin-devtools-cache-storage" class="small">
                                    <p class="i18n text-muted mb-0" data-i18n-html="admin_dashboard.devtools.loading"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COOKIES -->
                    <div class="col-12 mb-4">
                        <div class="card rounded-0 border">
                            <div class="card-header bg-white py-2">
                                <h3 class="i18n h6 mb-0" data-i18n-html="admin_dashboard.devtools.cookies.title">Cookies</h3>
                            </div>
                            <div class="card-body">
                                <div id="admin-devtools-cookies" class="small">
                                    <p class="i18n text-muted mb-0" data-i18n-html="admin_dashboard.devtools.loading"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </main>
    </div>

    <!-- MENSAGENS INTERNAS TRADUZÍVEIS -->
    <div id="admin-dashboard-messages" hidden>
        <span class="i18n" data-msg="clear_confirm" data-i18n-html="admin_dashboard.session.clear_confirm"></span>
        <span class="i18n" data-msg="status_active" data-i18n-html="admin_dashboard.session.status_active"></span>
        <span class="i18n" data-msg="status_expiring" data-i18n-html="admin_dashboard.session.status_expiring"></span>
        <span class="i18n" data-msg="status_expired" data-i18n-html="admin_dashboard.session.status_expired"></span>
        <span class="i18n" data-msg="status_no_expiry" data-i18n-html="admin_dashboard.session.status_no_expiry"></span>
        <span class="i18n" data-msg="refreshing" data-i18n-html="admin_dashboard.session.refreshing"></span>
        <span class="i18n" data-msg="refreshed" data-i18n-html="admin_dashboard.session.refreshed"></span>
        <span class="i18n" data-msg="refresh_failed" data-i18n-html="admin_dashboard.session.refresh_failed"></span>
        <span class="i18n" data-msg="reauth_needed" data-i18n-html="admin_dashboard.session.reauth_needed"></span>
        <span class="i18n" data-msg="diagnostics_empty" data-i18n-html="admin_dashboard.session.diagnostics_empty"></span>
        <span class="i18n" data-msg="diagnostics_error" data-i18n-html="admin_dashboard.session.diagnostics_error"></span>
    </div>

</section>
<!-- END ADMIN DASHBOARD -->
