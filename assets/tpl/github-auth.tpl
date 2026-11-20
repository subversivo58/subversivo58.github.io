
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
                    class="i18n modal-title"
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
                            class="i18n btn btn-info btn-block rounded-0 cp"
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

                <!-- CONTÊINER DE COMPATIBILIDADE COM setup.mjs -->
                <div
                    id="github-auth-identity"
                    class="mt-3"
                    hidden>
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
                        class="i18n btn btn-secondary btn-block rounded-0 cp"
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

</div>
