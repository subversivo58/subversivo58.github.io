/**
 * @file RecordsManager.mjs
 * @description Client for CRUD operations on records served by the backend, authenticated with JWT.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
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
                deleting: false,
                error: null,
                message: null,
                dateFrom: "",
                dateTo: "",
                managerOpen: false,
                expandedRecords: new Set()
            };
        });

        this.initialized = false;
    }

    /**
     * Binds the tab, panel and action events of the records interface and renders the initial state.
     * @return {RecordsManager} The instance, for chaining.
     */
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
                "[data-records-page], [data-records-action]"
            );

            if (!button || !this.root.contains(button)) {
                return;
            }

            if (button.disabled) return;

            if (button.hasAttribute("data-records-page")) {
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

                return;
            }

            const table = button.dataset.recordsTable;
            const action = button.dataset.recordsAction;

            if (!this.tables[table]) return;

            if (action === "delete") {
                this.deleteRecord(
                    table,
                    button.dataset.recordId
                );

                return;
            }

            if (action === "delete-period") {
                this.deletePeriod(table);
                return;
            }

            if (action === "delete-all") {
                this.deleteAll(table);
            }
        });

        this.root.addEventListener("change", event => {
            const input = event.target.closest(
                "[data-records-date]"
            );

            if (!input || !this.root.contains(input)) {
                return;
            }

            const table = input.dataset.recordsTable;
            const field = input.dataset.recordsDate;

            if (
                !this.tables[table] ||
                !["from", "to"].includes(field)
            ) {
                return;
            }

            this.state[table][
                field === "from" ? "dateFrom" : "dateTo"
            ] = input.value;
        });

        this.initialized = true;

        this.showTab("analytics");

        return this;
    }

    /**
     * Shows the panel of one table and marks its tab as active.
     * @param {string} table - Table name. Ignored if it does not exist.
     * @return {void}
     */
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

    /**
     * Loads the first page of every configured table.
     * @return {Promise<void>}
     */
    async loadAll() {
        await Promise.all(
            Object.keys(this.tables).map(table =>
                this.load(table, 1)
            )
        );
    }

    /**
     * Returns a valid JWT for the records service.
     * @return {string} The access token.
     * @throws {Error} If the JWT manager is not available.
     */
    getAccessToken() {
        if (!this.jwtManager) {
            throw new Error(
                "Gerenciador JWT indisponível."
            );
        }

        const credentials = this.jwtManager.getCredentials();

        if (!Array.isArray(credentials)) {
            throw new Error(
                "Não foi possível consultar as credenciais JWT."
            );
        }

        const now = Math.floor(Date.now() / 1000);

        const tokens = credentials
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
                Number(b.expiresAt) - Number(a.expiresAt)
            );

        if (!tokens.length) {
            return null;
        }

        return tokens[0].token;
    }

    async request(path, {
        method = "GET",
        token,
        body
    } = {}) {
        if (
            typeof token !== "string" ||
            !token
        ) {
            throw new Error(
                "Token JWT não disponível."
            );
        }

        const response = await fetch(
            `${this.endpoint}${path}`,
            {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    ...(body ? {
                        "Content-Type": "application/json"
                    } : {})
                },
                ...(body ? {
                    body: JSON.stringify(body)
                } : {}),
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
                `Falha na operação: HTTP ${response.status}.`
            );
        }

        return data;
    }

    /**
     * Loads one page of records from a table and updates the interface.
     * @param {string} table - Table name.
     * @param {number} [page=1] - Page number.
     * @return {Promise<void>}
     * @description Without a valid token, the table shows a message asking the user to create or renew a credential.
     */
    async load(table, page = 1) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        state.loading = true;
        state.error = null;
        state.message = null;

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

            const data = await this.request(
                `/v1/admin/${table}?page=${page}`,
                {
                    token
                }
            );

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

    async reloadAfterMutation(table, {
        message = null,
        error = null
    } = {}) {
        const state = this.state[table];

        state.deleting = false;

        await this.load(table, 1);

        if (error) {
            state.error = error;
            state.message = null;
        } else if (message) {
            state.message = message;
            state.error = null;
        }

        this.render(table);
    }

    /**
     * Deletes one record after confirmation.
     * @param {string} table - Table name.
     * @param {number|string} id - Record identifier. Invalid values are ignored.
     * @return {Promise<void>}
     */
    async deleteRecord(table, id) {
        if (!this.tables[table]) return;

        const recordId = Number(id);

        if (
            !Number.isSafeInteger(recordId) ||
            recordId < 1
        ) {
            return;
        }

        const confirmed = confirm(
            `Deseja realmente excluir o registro #${recordId} ` +
            `da tabela ${this.tables[table].label}?`
        );

        if (!confirmed) return;

        const state = this.state[table];

        if (state.deleting || state.loading) return;

        state.deleting = true;
        state.error = null;
        state.message = null;

        this.render(table);

        let message = null;
        let errorMessage = null;

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            await this.request(
                `/v1/admin/${table}/${recordId}`,
                {
                    method: "DELETE",
                    token
                }
            );

            message =
                `Registro #${recordId} excluído com sucesso.`;

        } catch (error) {
            errorMessage = error.message;

            console.error(
                `[RECORDS]: Falha ao excluir registro ${recordId}.`,
                error
            );

        }

        await this.reloadAfterMutation(table, {
            message,
            error: errorMessage
        });
    }

    /**
     * Deletes the records of a table within a date range, after confirmation.
     * @param {string} table - Table name.
     * @return {Promise<void>}
     * @description The dates must be in YYYY-MM-DD format, and the start date cannot be later than the end date.
     */
    async deletePeriod(table) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        if (state.loading || state.deleting) return;

        const from = state.dateFrom;
        const to = state.dateTo;

        if (!from || !to) {
            state.error =
                "Informe a data inicial e a data final.";

            state.message = null;

            this.render(table);

            return;
        }

        /**
         * Checks whether a string is a real calendar date in YYYY-MM-DD format.
         * @private
         * @param {string} value
         * @return {boolean}
         */
        const validDate = value => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            const date = new Date(
                `${value}T00:00:00.000Z`
            );

            return (
                !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
            );
        };

        if (!validDate(from) || !validDate(to)) {
            state.error = "Informe um intervalo de datas válido.";
            state.message = null;

            this.render(table);

            return;
        }

        if (from > to) {
            state.error =
                "A data inicial não pode ser posterior à data final.";

            state.message = null;

            this.render(table);

            return;
        }

        const confirmed = confirm(
            `Deseja realmente excluir os registros da tabela ` +
            `${this.tables[table].label} entre ${from} e ${to}?\n\n` +
            "Essa operação não pode ser desfeita."
        );

        if (!confirmed) return;

        state.deleting = true;
        state.error = null;
        state.message = null;

        this.render(table);

        let message = null;
        let errorMessage = null;

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            const params = new URLSearchParams({
                from,
                to
            });

            const data = await this.request(
                `/v1/admin/${table}?${params.toString()}`,
                {
                    method: "DELETE",
                    token
                }
            );

            const deleted = Number(data.deleted);

            if (
                !Number.isSafeInteger(deleted) ||
                deleted < 0
            ) {
                throw new Error(
                    "Quantidade de registros excluídos inválida."
                );
            }

            message = deleted === 0
                ? "Nenhum registro encontrado nesse período."
                : `${deleted} registro(s) excluído(s) do período selecionado.`;

        } catch (error) {
            errorMessage = error.message;

            console.error(
                `[RECORDS]: Falha na exclusão por período de ${table}.`,
                error
            );
        }

        await this.reloadAfterMutation(table, {
            message,
            error: errorMessage
        });
    }

    /**
     * Deletes all records of a table after a double confirmation.
     * @param {string} table - Table name.
     * @return {Promise<void>}
     * @description The operation cannot be undone.
     */
    async deleteAll(table) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        if (state.loading || state.deleting) return;

        const confirmed = confirm(
            `ATENÇÃO!\n\n` +
            `Você está prestes a excluir TODOS os registros ` +
            `da tabela ${this.tables[table].label}.\n\n` +
            "Essa operação não pode ser desfeita.\n\n" +
            "Deseja continuar?"
        );

        if (!confirmed) return;

        state.deleting = true;
        state.error = null;
        state.message = null;

        this.render(table);

        let message = null;
        let errorMessage = null;

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            const data = await this.request(
                `/v1/admin/${table}`,
                {
                    method: "DELETE",
                    token
                }
            );

            const deleted = Number(data.deleted);

            if (
                !Number.isSafeInteger(deleted) ||
                deleted < 0
            ) {
                throw new Error(
                    "Quantidade de registros excluídos inválida."
                );
            }

            message = deleted === 0
                ? "Não existiam registros para excluir."
                : `Todos os ${deleted} registros foram excluídos.`;

        } catch (error) {
            errorMessage = error.message;

            console.error(
                `[RECORDS]: Falha na limpeza de ${table}.`,
                error
            );
        }

        await this.reloadAfterMutation(table, {
            message,
            error: errorMessage
        });
    }

    /**
     * Escapes special HTML characters to prevent injection when rendering values.
     * @param {*} value
     * @return {string} The escaped value. null and undefined become an empty string.
     */
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

    /**
     * Formats a date for display in the local format.
     * @param {string} value - Date value.
     * @return {string} The formatted date, the original value when it is invalid, or "—" when empty.
     */
    formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString();
    }

    /**
     * Formats a value as indented JSON, when possible.
     * @param {*} value
     * @return {string} Formatted JSON, or the original text when it is not valid JSON.
     */
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

    /**
     * Builds the HTML of the toolbar for managing records in a table.
     * @param {string} table - Table name.
     * @return {string} HTML markup.
     */
    renderToolbar(table) {
        const state = this.state[table];
        const disabled = state.loading || state.deleting;

        return `
            <details
                class="card rounded-0 mb-3"
                data-records-manager="${table}"
                ${state.managerOpen ? "open" : ""}>

                <summary
                    class="card-header bg-light d-flex flex-wrap
                           justify-content-between align-items-center"
                    style="cursor:pointer;">

                    <strong>Gerenciar registros</strong>

                    <span class="small text-muted">
                        ${this.escapeHTML(
                            this.tables[table].label
                        )}
                    </span>

                </summary>

                <div class="card-body">

                    <div class="form-row align-items-end">

                        <div class="form-group col-12 col-md-4 mb-2">

                            <label
                                for="records-from-${table}"
                                class="small font-weight-bold">
                                Data inicial
                            </label>

                            <input
                                type="date"
                                id="records-from-${table}"
                                class="form-control form-control-sm rounded-0"
                                data-records-date="from"
                                data-records-table="${table}"
                                value="${this.escapeHTML(state.dateFrom)}"
                                ${disabled ? "disabled" : ""}>

                        </div>

                        <div class="form-group col-12 col-md-4 mb-2">

                            <label
                                for="records-to-${table}"
                                class="small font-weight-bold">
                                Data final
                            </label>

                            <input
                                type="date"
                                id="records-to-${table}"
                                class="form-control form-control-sm rounded-0"
                                data-records-date="to"
                                data-records-table="${table}"
                                value="${this.escapeHTML(state.dateTo)}"
                                ${disabled ? "disabled" : ""}>

                        </div>

                        <div class="form-group col-12 col-md-4 mb-2">

                            <button
                                type="button"
                                class="btn btn-outline-danger btn-sm rounded-0 btn-block"
                                data-records-action="delete-period"
                                data-records-table="${table}"
                                ${disabled ? "disabled" : ""}>
                                Excluir período
                            </button>

                        </div>

                    </div>

                    <div class="border-top pt-3 mt-2">

                        <button
                            type="button"
                            class="btn btn-danger btn-sm rounded-0"
                            data-records-action="delete-all"
                            data-records-table="${table}"
                            ${disabled ? "disabled" : ""}>
                            Limpar todos os registros
                        </button>

                    </div>

                    ${state.deleting ? `
                        <div class="small text-muted mt-3">
                            <span class="spinner-border spinner-border-sm mr-2"></span>
                            Excluindo registros. Aguarde...
                        </div>
                    ` : ""}

                </div>

            </details>
        `;
    }

    /**
     * Builds the HTML of one record card, with fields that depend on the table.
     * @param {string} table - Table name.
     * @param {Object} record - Record data.
     * @return {string} HTML markup. All values are escaped.
     */
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

        const recordId = String(record.id);
        const expanded = this.state[table].expandedRecords.has(recordId);

        return `
            <details
                class="card rounded-0 border mb-2"
                data-records-record="${table}"
                data-record-id="${this.escapeHTML(record.id)}"
                ${expanded ? "open" : ""}>

                <summary
                    class="card-header bg-light d-flex flex-wrap
                           justify-content-between align-items-center"
                    style="cursor:pointer;">

                    <strong>
                        Registro #${this.escapeHTML(record.id)}
                    </strong>

                    <small class="text-muted">
                        ${this.escapeHTML(
                            this.formatDate(record.created_at)
                        )}
                    </small>

                </summary>

                <div class="card-body">

                    ${description}

                    <div class="border-top mt-3 pt-3
                                d-flex justify-content-end">

                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm rounded-0"
                            data-records-action="delete"
                            data-records-table="${table}"
                            data-record-id="${this.escapeHTML(record.id)}"
                            ${this.state[table].deleting ? "disabled" : ""}>
                            Excluir registro
                        </button>

                    </div>

                </div>

            </details>
        `;
    }

    /**
     * Keeps the open and closed state of the toolbar and of the records in sync with the state.
     * @param {string} table - Table name.
     * @param {HTMLElement} list - Container with the rendered records.
     * @return {void}
     */
    bindCollapsibleToggles(table, list) {
        const state = this.state[table];

        const manager = list.querySelector(
            "[data-records-manager]"
        );

        if (manager) {
            manager.addEventListener("toggle", () => {
                state.managerOpen = manager.open;
            });
        }

        list.querySelectorAll(
            "[data-records-record]"
        ).forEach(details => {
            details.addEventListener("toggle", () => {
                const id = details.dataset.recordId;

                if (!id) return;

                if (details.open) {
                    state.expandedRecords.add(String(id));
                } else {
                    state.expandedRecords.delete(String(id));
                }
            });
        });
    }

    /**
     * Renders the list, the toolbar and the pagination of a table from its state.
     * @param {string} table - Table name.
     * @return {void}
     */
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

        let content = this.renderToolbar(table);

        if (state.error) {
            content += `
                <div class="alert alert-danger rounded-0">
                    ${this.escapeHTML(state.error)}
                </div>
            `;
        }

        if (state.message) {
            content += `
                <div class="alert alert-success rounded-0">
                    ${this.escapeHTML(state.message)}
                </div>
            `;
        }

        if (state.error && !state.results.length) {
            list.innerHTML = content;
            this.bindCollapsibleToggles(table, list);
            pagination.innerHTML = "";

            return;
        }

        if (!state.results.length) {
            content += `
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
            content += state.results
                .map(record =>
                    this.renderRecord(table, record)
                )
                .join("");
        }

        list.innerHTML = content;
        this.bindCollapsibleToggles(table, list);

        this.renderPagination(table);
    }

    /**
     * Renders the pagination controls of a table.
     * @param {string} table - Table name.
     * @return {void}
     */
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
