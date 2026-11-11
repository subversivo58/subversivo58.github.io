    <!-- FIXED NAVBAR -->
    <nav id="navbar-fixed" class="navbar navbar-expand-md navbar-light fixed-top py-1 bg-white" role="navigation">
        <a class="navbar-brand d-none d-md-flex" href="./">
            <picture>
                <img alt="Brand"
                     src="./assets/media/image/1x1.gif"
                     data-src="./assets/media/image/logos/subversivo58.blog.io.webp" data-lazy-target
                     width="120px" height="30px" class="adjust-middle cp">
            </picture>
        </a>
        <div class="d-md-none d-sm-flex mw-100">
            <a class="navbar-brand" href="./">
                <picture>
                    <img alt="Brand"
                         src="./assets/media/image/1x1.gif"
                         data-src="./assets/media/image/logos/site-logo-icon@150x150.webp" data-lazy-target
                         width="30px" height="30px" class="adjust-middle cp">
                 </picture>
            </a>
            <!-- Button trigger modal -->
            <picture id="drawer-menu-2" class="navbar-brand py-0">
                <img alt="Brand"
                     src="./assets/media/image/1x1.gif"
                     data-src="./assets/media/image/icons/cube-26x26.gif" data-lazy-target
                     width="26px" height="26px" class="cp">
            </picture>
            <a class="btn btn-sm btn-outline-none border-def contrast rounded-0 mt-0 cp" href="#">Signin</a>
        </div>
        <button class="navbar-toggler contrast rounded-0" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <!--
                Change Bootstrap class "navbar-toggler-icon" to Font-Awesome class "fa fa-bars"
                because Bootstrap class violate CSP image Policie
                OBS: add Bootstrap class "p-1" (padding) to normalize style concepts
            -->
            📌
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <ul class="navbar-nav mr-auto">
                <!--
                <li class="nav-item">
                    <a href="https://github.com/Collabore/collabore.github.io/wiki" data-i18n-html="navbar.wiki" class="i18n nav-link tc"></a>
                </li>
                -->
                <li class="nav-item">
                    <a href="./blog.html" data-i18n-html="navbar.blog" class="i18n nav-link contrast tc"></a>
                </li>
                <li class="nav-item">
                    <a href="./about.html" data-i18n-html="navbar.about" class="i18n nav-link contrast tc"></a>
                </li>
                <li class="nav-item">
                    <a href="./lab/" data-i18n-html="navbar.lab" class="i18n nav-link contrast tc"></a>
                </li>
                <li class="nav-item">
                    <a href="#general-contact" data-i18n-html="navbar.contact" data-anchor-mg="100" class="i18n nav-link anchor-link contrast tc"></a>
                </li>
                <li class="nav-item">
                    <a href="./dpo.html" data-i18n-html="navbar.dpo" class="i18n nav-link contrast tc"></a>
                    <!--
                    <a href="https://github.com/Collabore/collabore.github.io/tree/master/docs" data-i18n-html="navbar.docs" class="i18n nav-link tc"></a>
                    -->
                </li>
                <li class="nav-item">
                    <a href="./donations.html" data-i18n-html="navbar.donations" class="i18n nav-link contrast tc"></a>
                </li>
                <li class="nav-item">
                    <a href="./policy.html" data-i18n-html="navbar.policies" class="i18n nav-link contrast tc"></a>
                </li>
                <!--
                <li class="nav-item">
                    <a href="#" data-i18n-html="navbar.colab" class="i18n nav-link tc"></a>
                </li>
                -->
            </ul>
            <ul class="navbar-nav d-none d-md-flex">
                <li class="nav-item">
                    <picture id="drawer-menu-1" class="navbar-brand py-0">
                        <img alt="Brand"
                             src="./assets/media/image/1x1.gif"
                             data-src="./assets/media/image/icons/cube-26x26.gif" data-lazy-target
                             width="26px" height="26px" class="cp">
                    </picture>
                </li>
                <li class="nav-item">
                    <a class="btn btn-sm btn-outline-none border-def contrast rounded-0 mt-0 cp" href="#" disabled>Signin</a>
                </li>
            </ul>
        </div>
    </nav>