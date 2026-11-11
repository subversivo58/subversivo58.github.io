
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
                <h5 id="github-auth-title" class="modal-title">
                    Autenticação GitHub
                </h5>
            </div>

            <div class="modal-body">

                <p>
                    Informe sua API Key do GitHub para acessar
                    o painel administrativo.
                </p>

                <div class="form-group">
                    <label for="github-auth-key">
                        GitHub API Key
                    </label>

                    <input
                        type="password"
                        id="github-auth-key"
                        class="form-control rounded-0"
                        placeholder="Cole sua API Key"
                        autocomplete="off">
                </div>

                <div id="github-auth-status" class="mt-3"></div>

                <button
                    type="button"
                    id="github-auth-verify"
                    class="btn btn-info btn-block rounded-0 cp">
                    Verificar
                </button>

            </div>
        </div>
    </div>
</section>
