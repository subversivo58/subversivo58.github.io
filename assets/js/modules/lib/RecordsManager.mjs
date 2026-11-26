
/*
  @license The MIT License (MIT)
  @copyright Copyright (c) 2010-2026 Lauro Moraes
*/

export default class RecordsManager {
    constructor({
        endpoint,
        jwtManager,
        root
    } = {}) {
        if (
            typeof endpoint !== "string" ||
            !endpoint.trim()
        ) {
            throw new TypeError(
                "Endpoint do serviço Records inválido."
            );
        }

        if (!root) {
            throw new TypeError(
                "Elemento principal de Records não encontrado."
            );
        }

        this.endpoint = endpoint.replace(/\/+$/, "");
        this.jwtManager = jwtManager;
        this.root = root;

        this.activeTab = "analytics";

        this.tables = {
            analytics: {
                label: "Analíticos"
            },
            feedback: {
                label: "Feedback"
            },
            errors: {
                label: "Erros"
            }
        };

        this.state = {};

        Object.keys(this.tables).forEach(table => {
            this.state[table] = {
                results: [],
                pagination: null,
                loading: false,
                error: null
            };
        });

        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return this;

        this.root.querySelectorAll(
            "[data-records-tab]"
        ).forEach(button => {
            button.addEventListener("click", () => {
                this.showTab(button.dataset.recordsTab);
            });
        });

        this.root.addEventListener("click", event => {
            const button = event.target.closest(
                "[data-records-page]"
            );

            if (!button || !this.root.contains(button)) {
                return;
            }

            const table = button.dataset.recordsPage;
            const page = Number(button.dataset.page);

            if (
                !this.tables[table] ||
                !Number.isSafeInteger(page) ||
                page < 1
            ) {
                return;
            }

            this.load(table, page);
        });

        this.initialized = true;

        this.showTab("analytics");

        return this;
    }

    showTab(table) {
        if (!this.tables[table]) return;

        this.activeTab = table;

        this.root.querySelectorAll(
            "[data-records-tab]"
        ).forEach(button => {
            const active =
                button.dataset.recordsTab === table;

            button.classList.toggle("active", active);

            button.setAttribute(
                "aria-selected",
                String(active)
            );
        });

        this.root.querySelectorAll(
            "[data-records-panel]"
        ).forEach(panel => {
            panel.hidden =
                panel.dataset.recordsPanel !== table;
        });
    }

    async loadAll() {
        await Promise.all(
            Object.keys(this.tables).map(table =>
                this.load(table, 1)
            )
        );
    }

    getAccessToken() {
        if (!this.jwtManager) {
            throw new Error(
                "Gerenciador JWT indisponível."
            );
        }

        const now = Math.floor(Date.now() / 1000);

        const tokens = this.jwtManager
            .getCredentials()
            .flatMap(credential =>
                (credential.tokens || []).map(token => ({
                    ...token
                }))
            )
            .filter(token =>
                token.aud === "blog-records" &&
                typeof token.token === "string" &&
                token.token &&
                Number(token.expiresAt) > now
            )
            .sort((a, b) =>
                b.expiresAt - a.expiresAt
            );

        if (!tokens.length) {
            return null;
        }

        return tokens[0].token;
    }

    async load(table, page = 1) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        state.loading = true;
        state.error = null;

        this.render(table);

        try {
            const token = this.getAccessToken();

            if (!token) {
                state.error =
                    "Nenhum JWT válido encontrado para blog-records. " +
                    "Crie ou renove uma credencial na seção Credenciais " +
                    "para consultar os registros.";

                state.results = [];
                state.pagination = null;

                return;
            }

            const response = await fetch(
                `${this.endpoint}/v1/admin/${table}?page=${page}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    cache: "no-store"
                }
            );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Resposta inválida do serviço Records."
                );
            }

            if (!response.ok || data.success !== true) {
                throw new Error(
                    data.error ||
                    `Falha na consulta: HTTP ${response.status}.`
                );
            }

            if (!Array.isArray(data.results)) {
                throw new Error(
                    "Formato de resultados inválido."
                );
            }

            state.results = data.results;

            state.pagination = data.pagination || {
                page,
                limit: 25,
                total: data.results.length,
                totalPages: 1
            };

        } catch (error) {
            state.error = error.message;

            state.results = [];
            state.pagination = null;

            console.error(
                `[RECORDS]: Falha ao consultar ${table}.`,
                error
            );

        } finally {
            state.loading = false;
            this.render(table);
        }
    }

    escapeHTML(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );
    }

    formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString();
    }

    formatContent(value) {
        if (typeof value !== "string") {
            return JSON.stringify(value, null, 2);
        }

        try {
            return JSON.stringify(
                JSON.parse(value),
                null,
                2
            );
        } catch {
            return value;
        }
    }

    renderRecord(table, record) {
        let description = "";

        if (table === "feedback") {
            description = `
                <p class="mb-2">
                    <strong>Avaliação:</strong>
                    ${this.escapeHTML(record.rating)}
                </p>

                <p class="mb-0">
                    ${this.escapeHTML(record.message)}
                </p>
            `;
        }

        if (table === "errors") {
            description = `
                <p class="mb-2">
                    <strong>Tipo:</strong>
                    ${this.escapeHTML(record.type)}
                </p>

                <p class="mb-0">
                    ${this.escapeHTML(record.message)}
                </p>
            `;
        }

        if (table === "analytics") {
            description = `
                <pre class="small text-break mb-0"
                     style="white-space:pre-wrap;">${this.escapeHTML(
                         this.formatContent(record.content)
                     )}</pre>
            `;
        }

        return `
            <article class="card rounded-0 border mb-3">
                <div class="card-body">

                    <div class="d-flex justify-content-between
                                align-items-center mb-3">

                        <strong>
                            Registro #${this.escapeHTML(record.id)}
                        </strong>

                        <small class="text-muted">
                            ${this.escapeHTML(
                                this.formatDate(record.created_at)
                            )}
                        </small>

                    </div>

                    ${description}

                </div>
            </article>
        `;
    }

    render(table) {
        const state = this.state[table];

        const list = this.root.querySelector(
            `[data-records-list="${table}"]`
        );

        const count = this.root.querySelector(
            `[data-records-count="${table}"]`
        );

        const pagination = this.root.querySelector(
            `[data-records-pagination="${table}"]`
        );

        if (!list || !count || !pagination) return;

        const total = state.pagination?.total;

        count.textContent =
            total === undefined
                ? state.loading ? "..." : "—"
                : String(total);

        if (state.loading) {
            list.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <span class="spinner-border spinner-border-sm
                                 mr-2"></span>
                    Consultando registros...
                </div>
            `;

            pagination.innerHTML = "";

            return;
        }

        if (state.error) {
            list.innerHTML = `
                <div class="alert alert-danger rounded-0">
                    ${this.escapeHTML(state.error)}
                </div>
            `;

            pagination.innerHTML = "";

            return;
        }

        if (!state.results.length) {
            list.innerHTML = `
                <div class="border bg-white text-center
                            text-muted p-4">

                    <p class="font-weight-bold mb-1">
                        Nenhum registro encontrado.
                    </p>

                    <p class="small mb-0">
                        0 resultados.
                    </p>

                </div>
            `;

        } else {
            list.innerHTML = state.results
                .map(record =>
                    this.renderRecord(table, record)
                )
                .join("");
        }

        this.renderPagination(table);
    }

    renderPagination(table) {
        const state = this.state[table];

        const container = this.root.querySelector(
            `[data-records-pagination="${table}"]`
        );

        if (!container) return;

        const pagination = state.pagination;

        if (
            !pagination ||
            pagination.totalPages <= 1
        ) {
            container.innerHTML = "";
            return;
        }

        const page = pagination.page;
        const lastPage = pagination.totalPages;

        container.innerHTML = `
            <div class="d-flex align-items-center
                        justify-content-between">

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm rounded-0"
                    data-records-page="${table}"
                    data-page="${page - 1}"
                    ${page <= 1 ? "disabled" : ""}>
                    Anterior
                </button>

                <span class="small text-muted">
                    Página ${page} de ${lastPage}
                    · ${pagination.total} resultados
                </span>

                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm rounded-0"
                    data-records-page="${table}"
                    data-page="${page + 1}"
                    ${page >= lastPage ? "disabled" : ""}>
                    Próxima
                </button>

            </div>
        `;
    }
}
