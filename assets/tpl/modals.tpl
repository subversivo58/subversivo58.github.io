    <!-- MODALS -->





    <!-- LANGUAGE SELECTOR MODAL -->
    <section id="modal-language-selector" class="modal fade" tabindex="-1" role="dialog">
        <div id="login-overlay" class="modal-dialog">
            <div class="modal-content rounded-0">
                <div class="modal-header">
                    <h5 data-i18n-html="modals.language.title" class="i18n modal-title"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <span data-i18n-html="modals.language.avaliable" class="i18n col"></span>
                    </div>
                    <div class="row px-3">
                        <div id="pt-BR" class="col-6 col-sm-4 col-lg-3 change-language px-2 mt-3 bnh cp fl f32">
                            <div data-i18n-html="modals.language.pt_BR" class="i18n-append">🇧🇷</div>
                        </div>
                        <div id="en-US" class="col-6 col-sm-4 col-lg-3 change-language px-2 mt-3 bnh cp fl f32">
                            <div data-i18n-html="modals.language.en_US" class="i18n-append">🇺🇸</div>
                        </div>
                    </div>
                    <section id="language-selector-footer" class="mt-4 row">
                        <small data-i18n-html="modals.language.footer" class="i18n col"></small>
                    </section>
                </div>
            </div>
        </div>
    </section>

    <!-- NOTIFICATION -->
    <section id="modal-notification" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div id="modal-notification-content" class="modal-content rounded-0">
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.notification.title" class="i18n modal-title white tsa1"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div id="drawer-notification-block" class="col-6 col-sm-5 px-0">
                            <div class="col mt-sm-4">
                                <button type="button" id="modal-notification-request" data-dismiss="modal" data-i18n-html="drawer.notification.btn1" class="i18n btn btn-block btn-info rounded-0 cp"></button>
                            </div>
                            <div class="col mt-2 mt-sm-4">
                                <button type="button" data-dismiss="modal" data-i18n-html="drawer.notification.btn2" class="i18n btn btn-block btn-outline-dark rounded-0 cp"></button>
                            </div>
                        </div>
                    </div>
                    <section class="row">
                        <small data-i18n-html="drawer.notification.footer_info" class="i18n col"></small>
                    </section>
                </div>
            </div>
        </div>
    </section>

    <!-- GEOLOCATION -->
    <section id="modal-geolocation" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div id="modal-geolocation-content" class="modal-content rounded-0">
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.geolocation.title" class="i18n modal-title white tsa1"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div id="drawer-geolocation-block" class="col-6 offset-6 col-sm-5 offset-sm-7 px-0">
                            <div class="col mt-sm-4">
                                <button type="button" id="modal-geolocation-request" data-dismiss="modal" data-i18n-html="drawer.geolocation.btn1" class="i18n btn btn-block btn-info rounded-0 cp"></button>
                            </div>
                            <div class="col mt-2 mt-sm-3">
                                <button type="button" data-dismiss="modal" data-i18n-html="drawer.geolocation.btn2" class="i18n btn btn-block btn-outline-danger rounded-0 cp"></button>
                            </div>
                        </div>
                    </div>
                    <section class="row">
                        <small data-i18n-html="drawer.geolocation.footer_info" class="i18n col"></small>
                    </section>
                </div>
            </div>
        </div>
    </section>

    <!-- GETUSERMEDIA VIDEO -->
    <section id="modal-getmedia-video" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div id="modal-getmedia-video-content" class="modal-content rounded-0">


                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Requisitar camera</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="profile-tab" data-toggle="tab" href="#perfil" role="tab" aria-controls="profile" aria-selected="false">Permissões</a>
                    </li>
                    <li class="nav-item col">
                        <button type="button" class="close mt-2 fr cp" data-dismiss="modal">
                            <span aria-hidden="true">×</span>
                        </button>
                    </li>
                </ul>
                <div class="tab-content px-3" id="myTabContent">

                    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <div class="row">
                            <div id="drawer-getmedia-video-block" class="col-12 d-flex justify-content-center">
                                <div class="col-12 my-auto">
                                    <div class="col-12 col-md-6 mt-2 mt-sm-4">
                                        <button type="button" id="modal-getmedia-video-request" data-dismiss="modal" data-i18n-html="drawer.getmedia_video.btn1" class="i18n btn btn-block btn-info rounded-0 cp"></button>
                                    </div>
                                    <div class="col-1'2 col-md-6 mt-3 mt-sm-4">
                                        <button type="button" data-dismiss="modal" data-i18n-html="drawer.getmedia_video.btn2" class="i18n btn btn-block btn-outline-danger rounded-0 cp"></button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <section class="row mt-4 mt-sm-0 p-3">
                            <small data-i18n-html="drawer.getmedia_video.footer_info" class="i18n col px-0 text-light"></small>
                        </section>

                    </div>
                    <div class="tab-pane fade" id="perfil" role="tabpanel" aria-labelledby="profile-tab">...</div>
                    <div class="tab-pane fade" id="contato" role="tabpanel" aria-labelledby="contact-tab">...</div>
                </div>


                <!--
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.getmedia_video.title" class="i18n modal-title"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div id="drawer-getmedia-video-block" class="col-6 col-sm-5 px-0">
                            <div class="col mt-2 mt-sm-4">
                                <button type="button" id="modal-getmedia-video-request" data-dismiss="modal" data-i18n-html="drawer.getmedia_video.btn1" class="i18n btn btn-block btn-info rounded-0 cp"></button>
                            </div>
                            <div class="col mt-3 mt-sm-4">
                                <button type="button" data-dismiss="modal" data-i18n-html="drawer.getmedia_video.btn2" class="i18n btn btn-block btn-outline-danger rounded-0 cp"></button>
                            </div>
                        </div>
                    </div>
                    <section class="row mt-4 mt-sm-0">
                        <small data-i18n-html="drawer.getmedia_video.footer_info" class="i18n col"></small>
                    </section>
                </div>

                -->
            </div>
        </div>
    </section>

    <!-- GETUSERMEDIA AUDIO -->
    <section id="modal-getmedia-audio" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div id="modal-getmedia-audio-content" class="modal-content rounded-0">
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.getmedia_audio.title" class="i18n modal-title"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div id="drawer-getmedia-audio-block" class="col-6 col-sm-5 px-0">
                            <div class="col mt-sm-5">
                                <button type="button" id="modal-getmedia-audio-request" data-dismiss="modal" data-i18n-html="drawer.getmedia_audio.btn1" class="i18n btn btn-block btn-info rounded-0 cp"></button>
                            </div>
                            <div class="col mt-2 mt-sm-4">
                                <button type="button" data-dismiss="modal" data-i18n-html="drawer.getmedia_audio.btn2" class="i18n btn btn-block btn-outline-dark rounded-0 cp"></button>
                            </div>
                        </div>
                    </div>
                    <section class="row">
                        <small data-i18n-html="drawer.getmedia_audio.footer_info" class="i18n col"></small>
                    </section>
                </div>
            </div>
        </div>
    </section>



    <!-- CLEAR METADATA -->
    <section id="modal-clear-metadata" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div id="modal-clear-meta-data-content" class="modal-content rounded-0">
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.clear_data.title" class="i18n modal-title"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div id="drawer-clear-data-block" class="col-6 col-sm-5 px-0">
                            <div class="col mt-2 mt-sm-4">
                                <button id="clear-all-data-storage" type="button" data-i18n-html="drawer.clear_data.positive" class="i18n btn btn-outline-danger btn-block rounded-0 cp"></button>
                            </div>
                            <div class="col mt-3 mt-sm-4">
                                <button type="button" data-i18n-html="drawer.clear_data.negative" class="i18n btn btn-success btn-block rounded-0 cp" data-dismiss="modal"></button>
                            </div>
                        </div>
                    </div>
                    <section class="row mt-4 mt-sm-0">
                        <small data-i18n-html="drawer.clear_data.footer_info" class="i18n col"></small>
                    </section>
                </div>
            </div>
        </div>
    </section>



    <!-- SHARER -->
    <section id="modal-sharer-content" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content rounded-0">
                <div class="modal-header">
                    <h5 class="mb-0">Share this blog</h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body p-0">
                    <div id="modal-sharer-content-body" class="row px-3"></div>
                </div>
                <div class="modal-footer">
                    <div class="col px-0">
                        <small data-toggle="modal" data-target="#modal-bugs-report" data-dismiss="modal" class="tdu sky cp">Reportar um link quebrado?</small>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- FAST NOTES -->
    <section id="modal-fast-notes" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content rounded-0">
                <div class="modal-header rounded-0 border-0">
                    <h5 class="modal-title">Notas rapidas</h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">

                    <div class="row">
                        <div class="col-12">
                            <form id="fats-notes-form" action="./bugs" method="post" accept-charset="utf-8">
                                <div class="col px-0">
                                    <div class="col px-0">
                                        <div class="form-group">
                                            <label class="d-block">
                                                <strong>Titulo:</strong>
                                            </label>
                                            <div class="input-group input-group-sm">
                                                <span class="input-group-addon fa fa-edit rounded-0"></span>
                                                <input type="text" placeholder="Titulo" class="form-control rounded-0" maxlength="50">
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="d-block">
                                                        <strong>Categoria:</strong>
                                                    </label>
                                                    <div class="input-group input-group-sm">
                                                        <span class="input-group-addon fa fa-thumb-tack rounded-0"></span>
                                                        <input type="text" placeholder="Categoria" class="form-control rounded-0" maxlength="50">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="form-group">
                                                    <label class="d-block">
                                                        <strong>Tags:</strong>
                                                    </label>
                                                    <div class="input-group input-group-sm">
                                                        <span class="input-group-addon fa fa-tags rounded-0"></span>
                                                        <input type="text" placeholder="Tags" class="form-control rounded-0" maxlength="50">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group mt-2 mb-0">
                                    <label>
                                        <strong class="col px-0">Nota:</strong>
                                    </label>
                                    <textarea type="textarea" id="notes-textarea" placeholder="Your note here..." class="form-control resize-none rounded-0" rows="5" maxlength="400" required></textarea>
                                </div>
                                <div class="form-group mt-2 mt-md-0">
                                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 fa fa-microphone cp"></button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 fa fa-camera cp"></button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 fa fa-video-camera cp"></button>
                                    <button type="submit" class="btn btn-sm btn-info rounded-0 float-right cp">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>




    <!-- OFFLINE -->
    <section id="modal-offline-resources" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content rounded-0">
                <div id="modal-offline-content" class="modal-body px-0 py-2" style="height: 280px;">
                    <div class="col-12 p-2">
                        <h5 class="mb-0 white d-inline-block">Save to offline</h5>
                        <button type="button" class="close cp" data-dismiss="modal">
                            <span class="white" aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="col-12 px-0 pa" style="bottom:0px;">
                        <div class="col-10 col-md-6 mx-auto p-2">
                            <button type="button" class="btn btn-success rounded-0">Yes, save!</button>
                            <button type="button" class="btn btn-danger rounded-0 float-right" data-dismiss="modal">No, cancel</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col px-0">
                        <a href="{{adjust_dirs=./docs}}" target="_blank" class="tdu sky cp">
                            <small>About of offline resources?</small>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- LOGIN -->
    <section id="modal-login" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-0">
                <div class="modal-header">
                    <h5 class="mb-0">Signin and Authorize</h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body p-0">
                    <iframe id="modal-signin-frame" src="" style="zoom:0.60" width="99.6%" height="850px" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </section>

    <!-- VERSION SOURCE INFO MODAL -->
    <section id="modal-source-version-info" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-0">
                <div class="modal-header border-none">
                    <h5 data-i18n-html="modals.version.title" class="i18n col modal-title text-center"></h5>
                </div>
                <div class="modal-body pt-0 pb-3">

                        <div class="col-12 py-3 py-sm-0 px-2 text-center my-auto">
                            <small class="col-12">
                                <strong data-i18n-html="words.version" class="i18n tc"></strong>: {{source_version_canonical=1.0.0}}
                            </small>
                            <div class="col-12 alert alert-success rounded-0 px-2 mt-3">
                                <p data-i18n-html="modals.version.text1" class="i18n-prepend"><a href='https://github.com/subversivo58/subversivo58.github.io/blob/master/CONTRIBUTORS.md' target="about:blank" rel="noopener" data-i18n-html="modals.version.text2" class="i18n ext-link-icon"></a></p>
                                <p data-i18n-html="modals.version.text3" class="i18n"></p>
                                <a href="./copyright.html" target="about:blank" class="tdu ext-link-icon">
                                    <small data-i18n-html="combo.seelicenses" class="i18n"></small>
                                </a>
                            </div>
                            <div class="col-12 mt-2">
                                <small class="col">Source-code: <a href="https://github.com/subversivo58/subversivo58.github.io" target="about:blank" rel="noopener" class="tdu ext-link-icon">view on GitHub</a></small>
                            </div>
                        </div>

                </div>
            </div>
        </div>
    </section>


    <!-- FEEDBACK -->
    <section id="modal-feedback" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div id="modal-feedback-content" class="modal-content rounded-0">
                <div class="modal-header border-0 rounded-0">
                    <h5 data-i18n-html="drawer.feedback.title" class="i18n modal-title">Envie seu comentário</h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div class="col-12 p-3">
                            <div id="drawer-feedback-block" class="d-flex align-items-start flex-column">

                                <div class="d-flex w-100 mt-3">
                                    <span data-i18n-html="drawer.feedback.rating" class="i18n mt-2">Avaliação</span>
                                    <div class="rating cp">
                                        <span data-star-value="5" class="star-rating">☆</span>
                                        <span data-star-value="4" class="star-rating">☆</span>
                                        <span data-star-value="3" class="star-rating">☆</span>
                                        <span data-star-value="2" class="star-rating">☆</span>
                                        <span data-star-value="1" class="star-rating ml-4">☆</span>
                                    </div>
                                </div>

                                <div class="d-flex w-100 mt-2">
                                    <small data-i18n-html="drawer.feedback.question_info" class="i18n col px-0">Envie sua opnião sobre este site!</small>
                                </div>

                                <div class="d-flex w-100 mt-2">
                                    <form class="col-12 d-inline-block px-0" id="feedback-form" action="./feedback" method="post" accept-charset="utf-8">
                                        <div class="form-group mt-1 mb-2 fill-height">
                                            <textarea type="textarea" id="feedback-textarea" data-i18n-place="drawer.feedback.placeholder" class="i18n form-control resize-none bg-none rounded-0" rows="5" maxlength="400" required></textarea>
                                        </div>
                                        <div class="form-group mt-2 mt-md-0 mb-0">
                                            <button type="reset" id="feedback-form-clear" data-i18n-html="words.clear" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp">Limpar</button>
                                            <button type="submit" id="feedback-form-submit" data-i18n-html="drawer.bug_report.send" class="i18n btn btn-sm btn-info rounded-0 float-right cp">Enviar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                    <section class="row">
                        <small data-i18n-html="drawer.feedback.footer_info" class="i18n col">Enviando comentários. Veja a <a href='#' class='tdu blue'>documentação</a> sobre isto.</small>
                    </section>
                </div>
            </div>
        </div>
    </section>



    <!-- BUGS REPORT -->
    <section id="modal-bugs-report" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog">
            <div id="modal-bugs-report-content" class="modal-content rounded-0">
                <div class="modal-header rounded-0 border-0">
                    <h5 data-i18n-html="drawer.bug_report.title" class="i18n modal-title"></h5>
                    <button type="button" class="close cp" data-dismiss="modal">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <div class="row">
                        <div class="col-12">
                            <form id="bugs-report-form" action="./bugs" method="post" accept-charset="utf-8">
                                <div class="col px-0">
                                    <div class="col px-0">
                                        <div class="form-group">
                                            <label class="d-block">
                                                <strong>Selecione o tipo:</strong>
                                            </label>
                                            <select class="border-def d-block">
                                                <option selected value="custom">Erro personalizado</option>
                                                <option value="css">Erro de CSS</option>
                                                <option value="javascript">Erro de JavaScript</option>
                                                <option value="language">Erro de Idioma</option>
                                                <option value="plugin">Erro em Plugins</option>
                                                <option value="server">Erro do Servidor</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group mt-2 mb-0">
                                    <label>
                                        <strong class="col px-0">Envie uma descrição</strong>
                                    </label>
                                    <textarea type="textarea" id="bugs-report-textarea" placeholder="Description here..." class="form-control resize-none rounded-0" rows="5" maxlength="400" required></textarea>
                                </div>
                                <div class="form-group mt-2 mt-md-3">
                                    <button type="reset" data-i18n-html="words.clear" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp">Limpar</button>
                                    <button type="submit" id="bugs-report-form-submit" data-i18n-html="drawer.bug_report.send" class="i18n btn btn-sm btn-info rounded-0 float-right cp">Enviar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <section class="mt-4 row">
                        <small data-i18n-html="drawer.bug_report.footer_info" class="i18n col">Reportando erros. Veja a <a href='#' class='tdu blue'>documentação</a> sobre isto.</small>
                    </section>
                </div>
            </div>
        </div>
    </section>