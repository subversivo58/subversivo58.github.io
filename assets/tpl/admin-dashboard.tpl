
<!-- ADMIN DASHBOARD -->
<section id="admin-dashboard" class="container-fluid px-0">

    <div class="row mx-0">

        <!-- SIDEBAR -->
        <aside id="admin-dashboard-sidebar"
               class="col-12 col-md-3 col-lg-2 px-0">

            <!-- MOBILE MENU TRIGGER -->
            <div class="d-md-none px-3 py-2">

                <a href="#admin-dashboard-slide"
                   id="slide-admin-menu"
                   class="btn btn-outline-secondary btn-block rounded-0">

                    <span class="mr-2">&#9776;</span>
                    Menu Administrativo

                </a>

            </div>

            <!-- MOBILE SLIDE MENU -->
            <nav id="admin-dashboard-slide"
                 class="slide-left fx transition bg-white overflow
                        d-md-none"
                 style="
                    width: 85%;
                    max-width: 320px;
                    z-index: 1000;
                 ">

                <!-- SLIDE HEADER -->
                <div class="d-flex align-items-center
                            justify-content-between
                            px-3 py-3 border-bottom">

                    <h3 class="h5 mb-0">
                        Administração
                    </h3>

                    <a href="#body"
                       id="slide-link-admin-close"
                       class="btn btn-sm btn-outline-secondary rounded-0"
                       aria-label="Fechar menu">

                        &times;

                    </a>

                </div>

                <!-- MOBILE NAVIGATION -->
                <div class="list-group list-group-flush">

                    <a href="#admin-dashboard"
                       class="list-group-item list-group-item-action">

                        Painel

                    </a>

                    <a href="#admin-posts"
                       class="list-group-item list-group-item-action">

                        Postagens

                    </a>

                </div>

            </nav>

            <!-- DESKTOP NAVIGATION -->
            <nav id="admin-dashboard-desktop-menu"
                 class="d-none d-md-block">

                <div class="list-group list-group-flush">

                    <a href="#admin-dashboard"
                       class="list-group-item list-group-item-action active">

                        Painel

                    </a>

                    <a href="#admin-posts"
                       class="list-group-item list-group-item-action">

                        Postagens

                    </a>

                </div>

            </nav>

        </aside>

        <!-- MAIN CONTENT -->
        <main id="admin-dashboard-content"
              class="col-12 col-md-9 col-lg-10 py-3">

            <!-- DASHBOARD HEADER -->
            <header id="admin-dashboard-header"
                    class="mb-4">

                <h2 class="h3 mb-1">
                    Painel Administrativo
                </h2>

                <p class="text-muted mb-0">
                    Gerencie as postagens do seu blog.
                </p>

            </header>

            <!-- NEW POST -->
            <section id="admin-dashboard-actions"
                     class="mb-4">

                <button
                    type="button"
                    id="admin-new-post"
                    class="btn btn-info btn-block rounded-0">

                    + Nova Postagem

                </button>

            </section>

            <!-- POST EDITOR CONTAINER -->
            <section id="admin-post-editor-container"
                     class="card rounded-0 mb-4 d-none">

                <!-- EDITOR HEADER -->
                <div class="card-header bg-transparent
                            d-flex align-items-center
                            justify-content-between">

                    <h3 class="h5 mb-0">
                        Nova Postagem
                    </h3>

                    <button
                        type="button"
                        id="admin-close-post-editor"
                        class="btn btn-sm btn-outline-secondary rounded-0"
                        aria-label="Fechar editor">

                        &times;

                    </button>

                </div>

                <!-- MARKDOWN EDITOR MOUNT POINT -->
                <div id="admin-post-editor"
                     class="card-body">

                    <!-- MARKDOWN EDITOR WILL BE MOUNTED HERE -->

                </div>

            </section>

            <!-- POSTS -->
            <section id="admin-posts"
                     class="card rounded-0">

                <div class="card-header bg-transparent">

                    <h3 class="h5 mb-0">
                        Suas Postagens
                    </h3>

                </div>

                <div id="admin-posts-list"
                     class="list-group list-group-flush">

                    <!-- POSTS WILL BE INSERTED HERE -->

                    <div id="admin-posts-empty"
                         class="list-group-item text-muted text-center py-4">

                        Nenhuma postagem carregada.

                    </div>

                </div>

            </section>

        </main>

    </div>

</section>
<!-- END ADMIN DASHBOARD -->
