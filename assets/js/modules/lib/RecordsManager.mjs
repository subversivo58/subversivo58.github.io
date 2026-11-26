
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
                deleting: false,
                error: null,
                message: null,
                dateFrom: "",
                dateTo: ""
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
                const id = button.dataset.recordId;

                this.deleteRecord(table, id);
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

    async fetchAllRecords(table, token) {
        const firstPage = await this.request(
            `/v1/admin/${table}?page=1`,
            {
                token
            }
        );

        if (!Array.isArray(firstPage.results)) {
            throw new Error(
                "Formato de resultados inválido."
            );
        }

        const records = [
            ...firstPage.results
        ];

        const totalPages = Number(
            firstPage.pagination?.totalPages ?? 1
        );

        if (
            !Number.isSafeInteger(totalPages) ||
            totalPages < 0
        ) {
            throw new Error(
                "Paginação inválida recebida do serviço Records."
            );
        }

        for (let page = 2; page <= totalPages; page++) {
            const data = await this.request(
                `/v1/admin/${table}?page=${page}`,
                {
                    token
                }
            );

            if (!Array.isArray(data.results)) {
                throw new Error(
                    `Resultados inválidos na página ${page}.`
                );
            }

            records.push(...data.results);
        }

        return records;
    }

    async deleteByIds(table, records, token) {
        const result = {
            deleted: 0,
            failed: []
        };

        for (const record of records) {
            try {
                await this.request(
                    `/v1/admin/${table}/${encodeURIComponent(record.id)}`,
                    {
                        method: "DELETE",
                        token
                    }
                );

                result.deleted++;

            } catch (error) {
                result.failed.push({
                    id: record.id,
                    error: error.message
                });

                console.error(
                    `[RECORDS]: Falha ao excluir ${table} #${record.id}.`,
                    error
                );
            }
        }

        return result;
    }

    async deleteRecord(table, id) {
        if (
            !this.tables[table] ||
            !/^\d+$/.test(String(id))
        ) {
            return;
        }

        const confirmed = confirm(
            `Deseja realmente excluir o registro #${id} ` +
            `da tabela ${this.tables[table].label}?`
        );

        if (!confirmed) return;

        const state = this.state[table];

        if (state.deleting || state.loading) return;

        state.deleting = true;
        state.error = null;
        state.message = null;

        this.render(table);

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            await this.request(
                `/v1/admin/${table}/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    token
                }
            );

            state.message =
                `Registro #${id} excluído com sucesso.`;

        } catch (error) {
            state.error = error.message;

            console.error(
                `[RECORDS]: Falha ao excluir registro ${id}.`,
                error
            );

        } finally {
            state.deleting = false;

            await this.load(table, 1);
        }
    }

    getRecordDate(value) {
        if (!value) return null;

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    async deletePeriod(table) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        if (state.loading || state.deleting) return;

        const from = state.dateFrom;
        const to = state.dateTo;

        if (!from || !to) {
            state.error =
                "Informe a data inicial e a data final.";

            this.render(table);

            return;
        }

        if (from > to) {
            state.error =
                "A data inicial não pode ser posterior à data final.";

            this.render(table);

            return;
        }

        state.error = null;
        state.message = null;

        this.render(table);

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            const records = await this.fetchAllRecords(
                table,
                token
            );

            const selected = records.filter(record => {
                const date = this.getRecordDate(
                    record.created_at
                );

                return date && date >= from && date <= to;
            });

            if (!selected.length) {
                state.message =
                    "Nenhum registro encontrado nesse período.";

                this.render(table);

                return;
            }

            const confirmed = confirm(
                `Foram encontrados ${selected.length} registros ` +
                `em ${table} entre ${from} e ${to}.\n\n` +
                "Deseja excluir todos esses registros?"
            );

            if (!confirmed) return;

            state.deleting = true;
            this.render(table);

            const result = await this.deleteByIds(
                table,
                selected,
                token
            );

            if (result.failed.length) {
                state.error =
                    `${result.deleted} registro(s) excluído(s). ` +
                    `${result.failed.length} não puderam ser excluídos.`;
            } else {
                state.message =
                    `${result.deleted} registro(s) excluído(s) ` +
                    `do período selecionado.`;
            }

        } catch (error) {
            state.error = error.message;

            console.error(
                `[RECORDS]: Falha na exclusão por período de ${table}.`,
                error
            );

        } finally {
            state.deleting = false;

            await this.load(table, 1);
        }
    }

    async deleteAll(table) {
        if (!this.tables[table]) return;

        const state = this.state[table];

        if (state.loading || state.deleting) return;

        state.error = null;
        state.message = null;

        this.render(table);

        try {
            const token = this.getAccessToken();

            if (!token) {
                throw new Error(
                    "Nenhum JWT válido encontrado para blog-records."
                );
            }

            const records = await this.fetchAllRecords(
                table,
                token
            );

            if (!records.length) {
                state.message =
                    "Não existem registros para excluir.";

                this.render(table);

                return;
            }

            const confirmed = confirm(
                `ATENÇÃO!\n\n` +
                `Você está prestes a excluir TODOS os ` +
                `${records.length} registros da tabela ` +
                `${this.tables[table].label}.\n\n` +
                "Essa operação não pode ser desfeita.\n\n" +
                "Deseja continuar?"
            );

            if (!confirmed) return;

            state.deleting = true;
            this.render(table);

            const result = await this.deleteByIds(
                table,
                records,
                token
            );

            if (result.failed.length) {
                state.error =
                    `${result.deleted} registro(s) excluído(s). ` +
                    `${result.failed.length} não puderam ser excluídos.`;
            } else {
                state.message =
                    `Todos os ${result.deleted} registros foram excluídos.`;
            }

        } catch (error) {
            state.error = error.message;

            console.error(
                `[RECORDS]: Falha na limpeza de ${table}.`,
                error
            );

        } finally {
            state.deleting = false;

            await this.load(table, 1);
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

    renderToolbar(table) {
        const state = this.state[table];
        const disabled = state.loading || state.deleting;

        return `
            <div class="card rounded-0 mb-3">
                <div class="card-body">

                    <div class="d-flex flex-wrap
                                justify-content-between
                                align-items-center mb-3">

                        <strong>
                            Gerenciar registros
                        </strong>

                        <span class="small text-muted">
                            ${this.escapeHTML(
                                this.tables[table].label
                            )}
                        </span>

                    </div>

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
            </div>
        `;
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

                    <div class="d-flex flex-wrap
                                justify-content-between
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
