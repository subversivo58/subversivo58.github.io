<!-- ADMIN DASHBOARD -->
<section id="admin-dashboard" class="container-fluid px-0">

    <div class="row mx-0">

        <!-- SIDEBAR -->
        <aside id="admin-dashboard-sidebar"
            class="col-12 col-md-3 col-lg-2 px-0">

            <!-- MOBILE POSTS SLIDE -->
            <nav id="admin-dashboard-slide"
                class="slide-left fx transition bg-white overflow d-md-none"
                style="
                    width: 85%;
                    max-width: 320px;
                    z-index: 1000;
                 ">

                <div class="d-flex align-items-center
                            justify-content-between
                            px-3 py-3 border-bottom">

                    <h3 class="i18n h5 mb-0"
                        data-i18n-html="admin_dashboard.posts"></h3>

                    <a href="#body"
                        id="slide-link-admin-close"
                        class="btn btn-sm btn-outline-secondary rounded-0">
                        &times;
                    </a>

                </div>

                <div class="px-2 py-3">

                    <div id="admin-posts-list-mobile"
                        class="list-group list-group-flush">
                    </div>

                </div>

            </nav>

            <!-- MOBILE FOOTDOODLES SLIDE -->
            <nav id="admin-footoodles-slide"
                class="slide-left fx transition bg-white overflow d-md-none"
                style="
                    width: 85%;
                    max-width: 320px;
                    z-index: 1000;
                 ">

                <div class="d-flex align-items-center
                            justify-content-between
                            px-3 py-3 border-bottom">

                    <h3 class="i18n h5 mb-0"
                        data-i18n-html="admin_dashboard.footoodles.tab"></h3>

                    <a href="#body"
                        id="slide-link-footoodles-close"
                        class="btn btn-sm btn-outline-secondary rounded-0">
                        &times;
                    </a>

                </div>

                <div class="px-2 py-3">

                    <button type="button" data-footoodles-new class="i18n btn btn-info btn-sm rounded-0 mb-2 w-100 cp" data-i18n-html="admin_dashboard.footoodles.new"></button>
                    <div id="admin-footoodles-list-mobile"
                        class="list-group list-group-flush">
                    </div>

                </div>

            </nav>

            <!-- DESKTOP NAVIGATION -->
            <nav id="admin-dashboard-desktop-menu"
                class="d-none d-md-block">

                <ul class="nav nav-tabs nav-fill"
                    id="admin-dashboard-tabs"
                    role="tablist">

                    <li class="nav-item" role="presentation">

                        <a class="i18n nav-link active"
                            id="admin-posts-tab"
                            data-toggle="tab"
                            href="#admin-posts-pane"
                            role="tab"
                            aria-controls="admin-posts-pane"
                            aria-selected="true"
                            data-i18n-html="admin_dashboard.posts"></a>

                    </li>

                    <li class="nav-item" role="presentation">

                        <a class="i18n nav-link"
                            id="admin-footoodles-tab"
                            data-toggle="tab"
                            href="#admin-footoodles-pane"
                            role="tab"
                            aria-controls="admin-footoodles-pane"
                            aria-selected="false"
                            data-i18n-html="admin_dashboard.footoodles.tab"></a>

                    </li>

                </ul>

                <div class="tab-content">

                    <div class="tab-pane fade show active"
                        id="admin-posts-pane"
                        role="tabpanel"
                        aria-labelledby="admin-posts-tab">

                        <div class="px-2 py-3">

                            <div id="admin-posts-list-desktop"
                                class="list-group list-group-flush">
                            </div>

                        </div>

                    </div>

                    <div class="tab-pane fade"
                        id="admin-footoodles-pane"
                        role="tabpanel"
                        aria-labelledby="admin-footoodles-tab">

                        <div class="px-2 py-3">

                            <button type="button" data-footoodles-new class="i18n btn btn-info btn-sm rounded-0 mb-2 w-100 cp" data-i18n-html="admin_dashboard.footoodles.new"></button>
                            <div id="admin-footoodles-list-desktop"
                                class="list-group list-group-flush">
                            </div>

                        </div>

                    </div>

                </div>

            </nav>

        </aside>

        <!-- MAIN CONTENT -->
        <main id="admin-dashboard-content"
            class="col-12 col-md-9 col-lg-10 py-3">

            <!-- DASHBOARD HEADER -->
            <header id="admin-dashboard-header"
                class="mb-4">

                <div class="d-flex flex-column flex-md-row
                            align-items-md-center
                            justify-content-md-between">

                    <div>

                        <h2 class="i18n h3 mb-1"
                            data-i18n-html="admin_dashboard.title"></h2>

                        <p class="i18n text-muted mb-0"
                            data-i18n-html="admin_dashboard.description"></p>

                    </div>

                    <!-- DASHBOARD ACTIONS -->
                    <div id="admin-dashboard-actions"
                        class="d-flex align-items-center mt-3 mt-md-0">

                        <!-- MOBILE POSTS BUTTON -->
                        <a href="#admin-dashboard-slide"
                            id="slide-admin-menu"
                            class="btn btn-outline-secondary btn-sm
                                  rounded-0 flex-fill flex-md-grow-0
                                  mr-2 d-md-none">

                            <span aria-hidden="true">&#9776;</span>
                            <span class="i18n"
                                data-i18n-html="admin_dashboard.menu"></span>

                        </a>

                        <!-- MOBILE FOOTDOODLES BUTTON -->
                        <a href="#admin-footoodles-slide"
                            id="slide-admin-footoodles"
                            class="btn btn-outline-secondary btn-sm
                                  rounded-0 flex-fill flex-md-grow-0
                                  mr-2 d-md-none">

                            <span class="i18n"
                                data-i18n-html="admin_dashboard.footoodles.tab"></span>

                        </a>

                        <!-- NEW POST BUTTON -->
                        <button
                            type="button"
                            id="admin-new-post"
                            class="i18n btn btn-info btn-sm rounded-0
                                   flex-fill flex-md-grow-0"
                            data-i18n-html="admin_dashboard.new_post">
                        </button>

                    </div>

                </div>

            </header>

            <!-- POST EDITOR CONTAINER -->
            <section id="admin-post-editor-container"
                class="card rounded-0 mb-4 d-none">

                <div class="card-header bg-transparent
                            d-flex align-items-center
                            justify-content-between">

                    <h3 class="i18n h5 mb-0"
                        data-i18n-html="admin_dashboard.new_post"></h3>

                    <button
                        type="button"
                        id="admin-close-post-editor"
                        class="btn btn-sm btn-outline-secondary rounded-0">
                        &times;
                    </button>

                </div>

                <!-- MARKDOWN EDITOR MOUNT POINT -->
                <div id="admin-post-editor"
                    class="card-body">
                </div>

            </section>

        </main>

    </div>

</section>
<!-- END ADMIN DASHBOARD -->