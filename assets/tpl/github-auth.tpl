
<!-- GITHUB AUTHENTICATION -->
<section
    id="modal-github-auth"
    class="modal fade"
    tabindex="-1"
    role="dialog"
    aria-labelledby="github-auth-title"
    aria-hidden="true"
    data-backdrop="static"
    data-keyboard="false">

    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-0">

            <div class="modal-header">
                <h5
                    id="github-auth-title"
                    class="modal-title i18n"
                    data-i18n-html="github_auth.title">
                </h5>
            </div>

            <div class="modal-body">

                <!-- INTRODUÇÃO E INÍCIO DA AUTENTICAÇÃO -->
                <div id="github-auth-intro">

                    <p
                        class="i18n"
                        data-i18n-html="github_auth.description">
                    </p>

                    <form
                        id="github-auth-start-form"
                        method="POST"
                        action="/admin-auth/start">

                        <button
                            type="submit"
                            id="github-auth-start"
                            class="btn btn-info btn-block rounded-0 cp i18n"
                            data-i18n-html="github_auth.start">
                        </button>

                    </form>
                </div>

                <!-- STATUS DA AUTENTICAÇÃO -->
                <div
                    id="github-auth-status"
                    class="mt-3"
                    role="status"
                    aria-live="polite">
                </div>

                <!-- IDENTIDADE RETORNADA PELO GITHUB -->
                <div id="github-auth-identity" class="mt-3" hidden>

                    <div class="text-center mb-3">

                        <img
                            id="github-auth-avatar"
                            src=""
                            alt=""
                            class="rounded-circle"
                            width="96"
                            height="96">

                        <h5
                            id="github-auth-name"
                            class="mt-2 mb-1">
                        </h5>

                        <p
                            id="github-auth-login"
                            class="mb-1">
                        </p>

                    </div>

                    <div class="mb-3">

                        <p class="mb-1">
                            <strong
                                class="i18n"
                                data-i18n-html="github_auth.identity.id_label">
                            </strong>
                            <span id="github-auth-id"></span>
                        </p>

                        <p class="mb-1">
                            <strong
                                class="i18n"
                                data-i18n-html="github_auth.identity.profile_label">
                            </strong>
                            <a
                                id="github-auth-profile"
                                href=""
                                target="_blank"
                                rel="noopener noreferrer">
                            </a>
                        </p>

                        <p id="github-auth-email-container" class="mb-1" hidden>
                            <strong
                                class="i18n"
                                data-i18n-html="github_auth.identity.email_label">
                            </strong>
                            <span id="github-auth-email"></span>
                        </p>

                    </div>

                    <p
                        class="i18n"
                        data-i18n-html="github_auth.identity.confirmation">
                    </p>

                    <button
                        type="button"
                        id="github-auth-confirm"
                        class="btn btn-success btn-block rounded-0 cp i18n"
                        data-i18n-html="github_auth.confirm">
                    </button>

                </div>

                <!-- DIAGNÓSTICO DE ERROS -->
                <div id="github-auth-error" class="mt-3" hidden>

                    <pre
                        id="github-auth-diagnostics"
                        class="small text-wrap">
                    </pre>

                    <button
                        type="button"
                        id="github-auth-copy-diagnostics"
                        class="btn btn-secondary btn-block rounded-0 cp i18n"
                        data-i18n-html="github_auth.copy_diagnostics">
                    </button>

                </div>

            </div>
        </div>
    </div>
</section>

<!-- MENSAGENS DE STATUS DA AUTENTICAÇÃO (ocultas) -->
<div hidden id="github-auth-messages">

    <span
        class="i18n"
        data-msg="github_auth_empty"
        data-i18n-html="github_auth.messages.empty">
    </span>

    <span
        class="i18n"
        data-msg="github_auth_verifying"
        data-i18n-html="github_auth.messages.verifying">
    </span>

    <span
        class="i18n"
        data-msg="github_auth_failed"
        data-i18n-html="github_auth.messages.failed">
    </span>

    <span
        class="i18n"
        data-msg="github_auth_authenticated"
        data-i18n-html="github_auth.messages.authenticated">
    </span>

    <span
        class="i18n"
        data-msg="github_auth_saving"
        data-i18n-html="github_auth.messages.saving">
    </span>

    <span
        class="i18n"
        data-msg="github_auth_save_failed"
        data-i18n-html="github_auth.messages.save_failed">
    </span>

</div>
