<!-- WYSIWYG POST EDITOR -->
<div class="wysiwyg-editor w-100">

    <!-- BARRA DE STATUS -->
    <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 px-1">
        <div
            id="post-editor-status"
            class="small text-muted"
            role="status"
            aria-live="polite">
        </div>
        <div class="small text-muted" id="post-reading-badge"></div>
    </div>

    <!-- METADADOS PRINCIPAIS -->
    <div class="row">
        <div class="col-12 col-lg-7 form-group mb-3">
            <label
                for="post-title"
                class="i18n small font-weight-bold mb-1"
                data-i18n-html="admin_dashboard.editor.title_label">
            </label>
            <input
                type="text"
                id="post-title"
                class="i18n form-control rounded-0"
                data-i18n-place="admin_dashboard.editor.title_placeholder">
        </div>

        <div class="col-12 col-lg-5 form-group mb-3">
            <label
                for="post-slug"
                class="i18n small font-weight-bold mb-1"
                data-i18n-html="admin_dashboard.editor.slug_label">
            </label>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text rounded-0 small text-muted">/posts/</span>
                </div>
                <input
                    type="text"
                    id="post-slug"
                    class="i18n form-control rounded-0"
                    data-i18n-place="admin_dashboard.editor.slug_placeholder"
                    autocomplete="off"
                    spellcheck="false">
                <div class="input-group-append">
                    <span class="input-group-text rounded-0 small text-muted">.html</span>
                    <button
                        type="button"
                        id="post-slug-lock"
                        class="i18n btn btn-outline-secondary rounded-0 cp"
                        data-i18n-title="admin_dashboard.editor.slug_unlock_title"
                        aria-pressed="false">🔒</button>
                </div>
            </div>
            <small id="post-slug-preview" class="form-text text-muted text-monospace"></small>
        </div>
    </div>

    <!-- RESUMO -->
    <div class="form-group mb-3">
        <label
            for="post-summary"
            class="i18n small font-weight-bold mb-1"
            data-i18n-html="admin_dashboard.editor.summary_label">
        </label>
        <div class="input-group input-group-sm">
            <input
                type="text"
                id="post-summary"
                class="i18n form-control rounded-0"
                maxlength="240"
                data-i18n-place="admin_dashboard.editor.summary_placeholder">
            <div class="input-group-append">
                <button
                    type="button"
                    id="post-summary-restore"
                    class="i18n btn btn-outline-secondary rounded-0 cp"
                    data-i18n-title="admin_dashboard.editor.summary_restore_title">↺</button>
            </div>
        </div>
    </div>

    <!-- BARRA DE FERRAMENTAS DO EDITOR -->
    <div
        id="post-editor-toolbar"
        class="wysiwyg-toolbar d-flex flex-wrap align-items-center p-2 bg-light border border-bottom-0"
        role="toolbar">

        <div class="btn-group btn-group-sm mr-2 mb-1">
            <button
                type="button"
                data-editor-action="undo"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.undo_title">↶</button>
            <button
                type="button"
                data-editor-action="redo"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.redo_title">↷</button>
        </div>

        <select
            id="post-block-format"
            class="i18n form-control form-control-sm rounded-0 mr-2 mb-1 wysiwyg-select"
            data-i18n-title="admin_dashboard.editor.block_format_title">
            <option value="p" class="i18n" data-i18n-html="admin_dashboard.editor.block_paragraph"></option>
            <option value="h1" class="i18n" data-i18n-html="admin_dashboard.editor.heading1"></option>
            <option value="h2" class="i18n" data-i18n-html="admin_dashboard.editor.heading2"></option>
            <option value="h3" class="i18n" data-i18n-html="admin_dashboard.editor.heading3"></option>
            <option value="h4" class="i18n" data-i18n-html="admin_dashboard.editor.heading4"></option>
            <option value="h5" class="i18n" data-i18n-html="admin_dashboard.editor.heading5"></option>
            <option value="h6" class="i18n" data-i18n-html="admin_dashboard.editor.heading6"></option>
            <option value="blockquote" class="i18n" data-i18n-html="admin_dashboard.editor.quote"></option>
            <option value="pre" class="i18n" data-i18n-html="admin_dashboard.editor.code_block"></option>
        </select>

        <select
            id="post-font-size"
            class="i18n form-control form-control-sm rounded-0 mr-2 mb-1 wysiwyg-select"
            data-i18n-title="admin_dashboard.editor.font_size_title">
            <option value="" class="i18n" data-i18n-html="admin_dashboard.editor.font_size"></option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
        </select>

        <div class="btn-group btn-group-sm mr-2 mb-1">
            <button
                type="button"
                data-editor-action="bold"
                class="i18n btn btn-outline-secondary rounded-0 font-weight-bold cp"
                data-i18n-title="admin_dashboard.editor.bold_title">B</button>
            <button
                type="button"
                data-editor-action="italic"
                class="i18n btn btn-outline-secondary rounded-0 font-italic cp"
                data-i18n-title="admin_dashboard.editor.italic_title">I</button>
            <button
                type="button"
                data-editor-action="underline"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.underline_title"><u>U</u></button>
            <button
                type="button"
                data-editor-action="strike"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.strike_title"><s>S</s></button>
            <button
                type="button"
                data-editor-action="inline-code"
                class="i18n btn btn-outline-secondary rounded-0 text-monospace cp"
                data-i18n-title="admin_dashboard.editor.inline_code_title">&lt;/&gt;</button>
            <button
                type="button"
                data-editor-action="clear-format"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.clear_format_title">Tx</button>
        </div>

        <div class="btn-group btn-group-sm mr-2 mb-1 align-items-center">
            <label
                for="post-fore-color"
                class="i18n btn btn-outline-secondary rounded-0 mb-0 cp wysiwyg-color-btn"
                data-i18n-title="admin_dashboard.editor.fore_color_title">
                <span>A</span>
                <input type="color" id="post-fore-color" value="#212529" class="wysiwyg-color-input">
            </label>
            <label
                for="post-back-color"
                class="i18n btn btn-outline-secondary rounded-0 mb-0 cp wysiwyg-color-btn"
                data-i18n-title="admin_dashboard.editor.back_color_title">
                <span class="bg-warning px-1">H</span>
                <input type="color" id="post-back-color" value="#fff3cd" class="wysiwyg-color-input">
            </label>
        </div>

        <div class="btn-group btn-group-sm mr-2 mb-1">
            <button
                type="button"
                data-editor-action="unordered-list"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.unordered_list_title">•≡</button>
            <button
                type="button"
                data-editor-action="ordered-list"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.ordered_list_title">1≡</button>
            <button
                type="button"
                data-editor-action="align-left"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.align_left_title">⫤</button>
            <button
                type="button"
                data-editor-action="align-center"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.align_center_title">≡</button>
            <button
                type="button"
                data-editor-action="align-right"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.align_right_title">⫥</button>
            <button
                type="button"
                data-editor-action="align-justify"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.align_justify_title">≣</button>
        </div>

        <div class="btn-group btn-group-sm mr-2 mb-1">
            <button
                type="button"
                data-editor-action="link"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.link_title">🔗</button>
            <button
                type="button"
                data-editor-action="quote"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.quote_title">❝</button>
            <button
                type="button"
                data-editor-action="code"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.code_title">{ }</button>
            <button
                type="button"
                data-editor-action="hr"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.hr_title">―</button>
            <button
                type="button"
                data-editor-action="table"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.table_title">⊞</button>
        </div>

        <div class="btn-group btn-group-sm mr-2 mb-1">
            <button
                type="button"
                id="post-add-image"
                data-editor-action="image"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.image_title">🖼</button>
            <input
                type="file"
                id="post-image-input"
                accept="image/*"
                multiple
                hidden>
            <button
                type="button"
                id="post-microphone"
                data-editor-action="microphone"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-title="admin_dashboard.editor.microphone_title"
                disabled>🎤</button>
        </div>

        <div class="btn-group btn-group-sm ml-auto mb-1">
            <button
                type="button"
                id="post-source-toggle"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-html="admin_dashboard.editor.source_btn"
                data-i18n-title="admin_dashboard.editor.source_title"
                aria-pressed="false"></button>
            <button
                type="button"
                id="post-preview-toggle"
                class="i18n btn btn-outline-info rounded-0 cp"
                data-i18n-html="admin_dashboard.editor.preview"
                aria-expanded="false"></button>
        </div>
    </div>

    <!-- BARRA DE LINK INLINE -->
    <div id="wysiwyg-link-bar" class="wysiwyg-subbar bg-white border border-bottom-0 p-2" hidden>
        <div class="form-row align-items-center">
            <div class="col-12 col-md-4 mb-2 mb-md-0">
                <input
                    type="url"
                    id="wysiwyg-link-url"
                    class="i18n form-control form-control-sm rounded-0"
                    data-i18n-place="admin_dashboard.editor.link_url_placeholder">
            </div>
            <div class="col-12 col-md-4 mb-2 mb-md-0">
                <input
                    type="text"
                    id="wysiwyg-link-text"
                    class="i18n form-control form-control-sm rounded-0"
                    data-i18n-place="admin_dashboard.editor.link_text_placeholder">
            </div>
            <div class="col-12 col-md-4 d-flex flex-wrap align-items-center">
                <div class="custom-control custom-checkbox mr-2">
                    <input type="checkbox" class="custom-control-input" id="wysiwyg-link-blank" checked>
                    <label class="i18n custom-control-label small" for="wysiwyg-link-blank" data-i18n-html="admin_dashboard.editor.link_new_tab"></label>
                </div>
                <button type="button" id="wysiwyg-link-apply" class="i18n btn btn-sm btn-info rounded-0 mr-1 cp" data-i18n-html="admin_dashboard.editor.apply"></button>
                <button type="button" id="wysiwyg-link-remove" class="i18n btn btn-sm btn-outline-danger rounded-0 mr-1 cp" data-i18n-html="admin_dashboard.editor.unlink"></button>
                <button type="button" id="wysiwyg-link-cancel" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.cancel"></button>
            </div>
        </div>
    </div>

    <!-- BARRA DE TABELA INLINE -->
    <div id="wysiwyg-table-bar" class="wysiwyg-subbar bg-white border border-bottom-0 p-2" hidden>
        <div class="d-flex flex-wrap align-items-center">
            <span class="i18n small font-weight-bold mr-2" data-i18n-html="admin_dashboard.editor.table_rows"></span>
            <input type="number" id="wysiwyg-table-rows" class="form-control form-control-sm rounded-0 mr-3" style="width: 72px;" value="3" min="1" max="20">
            <span class="i18n small font-weight-bold mr-2" data-i18n-html="admin_dashboard.editor.table_cols"></span>
            <input type="number" id="wysiwyg-table-cols" class="form-control form-control-sm rounded-0 mr-3" style="width: 72px;" value="3" min="1" max="10">
            <button type="button" id="wysiwyg-table-insert" class="i18n btn btn-sm btn-info rounded-0 mr-1 cp" data-i18n-html="admin_dashboard.editor.table_insert"></button>
            <button type="button" id="wysiwyg-table-cancel" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.cancel"></button>
        </div>
    </div>

    <!-- ÁREA DE EDIÇÃO WYSIWYG + CONTROLE FLUTUANTE DE IMAGEM -->
    <div class="wysiwyg-surface-wrap position-relative border bg-white">

        <div
            id="post-content"
            class="wysiwyg-surface markdown-body post-content p-3 p-md-4"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"></div>

        <textarea
            id="post-html-source"
            class="wysiwyg-source form-control rounded-0 border-0 text-monospace p-3"
            rows="18"
            spellcheck="false"
            hidden></textarea>

        <!-- BARRA FLUTUANTE FORA DO CONTENTEDITABLE PARA IMAGEM SELECIONADA -->
        <div id="wysiwyg-image-overlay" class="wysiwyg-image-overlay border shadow-sm bg-white p-2" hidden>
            <div class="d-flex flex-wrap align-items-center mb-2">
                <span class="i18n small font-weight-bold mr-2" data-i18n-html="admin_dashboard.editor.img_width"></span>
                <div class="btn-group btn-group-sm mr-2">
                    <button type="button" data-img-width="25" class="btn btn-outline-secondary rounded-0 cp">25%</button>
                    <button type="button" data-img-width="50" class="btn btn-outline-secondary rounded-0 cp">50%</button>
                    <button type="button" data-img-width="75" class="btn btn-outline-secondary rounded-0 cp">75%</button>
                    <button type="button" data-img-width="100" class="btn btn-outline-secondary rounded-0 cp">100%</button>
                </div>
                <input type="range" id="wysiwyg-img-width" min="15" max="100" step="1" value="100" class="custom-range mr-2" style="width: 110px;">
                <span id="wysiwyg-img-width-label" class="small text-monospace mr-3">100%</span>

                <span class="i18n small font-weight-bold mr-2" data-i18n-html="admin_dashboard.editor.img_align"></span>
                <div class="btn-group btn-group-sm mr-2">
                    <button type="button" data-img-align="left" class="i18n btn btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.img_align_left"></button>
                    <button type="button" data-img-align="center" class="i18n btn btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.img_align_center"></button>
                    <button type="button" data-img-align="right" class="i18n btn btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.img_align_right"></button>
                    <button type="button" data-img-align="full" class="i18n btn btn-outline-secondary rounded-0 cp" data-i18n-html="admin_dashboard.editor.img_align_full"></button>
                </div>

                <button
                    type="button"
                    id="wysiwyg-img-delete"
                    class="i18n btn btn-sm btn-outline-danger rounded-0 ml-auto cp"
                    data-i18n-html="admin_dashboard.editor.img_remove"></button>
            </div>
            <div class="form-row align-items-center">
                <div class="col-12 col-md-6 mb-1 mb-md-0">
                    <input
                        type="text"
                        id="wysiwyg-img-alt"
                        class="i18n form-control form-control-sm rounded-0"
                        data-i18n-place="admin_dashboard.editor.img_alt_placeholder">
                </div>
                <div class="col-12 col-md-6">
                    <input
                        type="text"
                        id="wysiwyg-img-caption"
                        class="i18n form-control form-control-sm rounded-0"
                        data-i18n-place="admin_dashboard.editor.img_caption_placeholder">
                </div>
            </div>
        </div>
    </div>

    <!-- PRÉ-VISUALIZAÇÃO -->
    <div id="post-preview-panel" class="card rounded-0 mt-3" hidden>
        <div class="card-header d-flex justify-content-between align-items-center py-2">
            <span class="i18n small font-weight-bold" data-i18n-html="admin_dashboard.editor.preview"></span>
            <button
                type="button"
                id="post-preview-close"
                class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                data-i18n-html="admin_dashboard.editor.preview_close"></button>
        </div>
        <div id="post-preview" class="card-body markdown-body post-content"></div>
    </div>

    <!-- TAGS -->
    <div class="form-group mt-3 mb-3">
        <label
            for="post-tags"
            class="i18n small font-weight-bold mb-1"
            data-i18n-html="admin_dashboard.editor.tags_label">
        </label>
        <input
            type="text"
            id="post-tags"
            class="i18n form-control form-control-sm rounded-0"
            data-i18n-place="admin_dashboard.editor.tags_placeholder">
    </div>

    <!-- RASCUNHOS -->
    <div class="border bg-light p-3 mt-3 mb-3">
        <div class="i18n small font-weight-bold mb-2" data-i18n-html="admin_dashboard.editor.drafts_section">Rascunhos</div>
        <div class="d-flex flex-wrap align-items-center">
            <button
                type="button"
                id="post-save-draft"
                class="i18n btn btn-sm btn-outline-secondary rounded-0 mr-2 mb-2 mb-sm-0 cp"
                data-i18n-html="admin_dashboard.editor.save_draft"></button>
            <select id="post-draft-list" class="form-control form-control-sm rounded-0 mr-2 mb-2 mb-sm-0" style="width: auto; min-width: 180px; max-width: 260px;">
                <option value="" class="i18n" data-i18n-html="admin_dashboard.editor.drafts_placeholder"></option>
            </select>
            <button
                type="button"
                id="post-open-draft"
                class="i18n btn btn-sm btn-outline-info rounded-0 mr-2 mb-2 mb-sm-0 cp"
                data-i18n-html="admin_dashboard.editor.open_draft"></button>
            <button
                type="button"
                id="post-delete-draft"
                class="i18n btn btn-sm btn-outline-danger rounded-0 mb-2 mb-sm-0 cp"
                data-i18n-html="admin_dashboard.editor.delete_draft"></button>
        </div>
    </div>

    <!-- PUBLICAÇÃO -->
    <div class="d-flex flex-wrap align-items-center justify-content-end border-top pt-3">
        <button
            type="button"
            id="post-generate"
            class="i18n btn btn-info rounded-0 px-4 cp"
            data-i18n-html="admin_dashboard.editor.generate"></button>
    </div>

    <!-- MENSAGENS DE STATUS TRADUZÍVEIS -->
    <div id="post-editor-messages" hidden>
        <span class="i18n" data-msg="speech_error" data-i18n-html="admin_dashboard.editor.msg.speech_error"></span>
        <span class="i18n" data-msg="speech_unavailable" data-i18n-html="admin_dashboard.editor.msg.speech_unavailable"></span>
        <span class="i18n" data-msg="speech_start_error" data-i18n-html="admin_dashboard.editor.msg.speech_start_error"></span>
        <span class="i18n" data-msg="pending_changes" data-i18n-html="admin_dashboard.editor.msg.pending_changes"></span>
        <span class="i18n" data-msg="images_db_unavailable" data-i18n-html="admin_dashboard.editor.msg.images_db_unavailable"></span>
        <span class="i18n" data-msg="images_optimized" data-i18n-html="admin_dashboard.editor.msg.images_optimized"></span>
        <span class="i18n" data-msg="images_added" data-i18n-html="admin_dashboard.editor.msg.images_added"></span>
        <span class="i18n" data-msg="image_save_error" data-i18n-html="admin_dashboard.editor.msg.image_save_error"></span>
        <span class="i18n" data-msg="drafts_db_unavailable" data-i18n-html="admin_dashboard.editor.msg.drafts_db_unavailable"></span>
        <span class="i18n" data-msg="autosave_ok" data-i18n-html="admin_dashboard.editor.msg.autosave_ok"></span>
        <span class="i18n" data-msg="autosave_error" data-i18n-html="admin_dashboard.editor.msg.autosave_error"></span>
        <span class="i18n" data-msg="nothing_to_save" data-i18n-html="admin_dashboard.editor.msg.nothing_to_save"></span>
        <span class="i18n" data-msg="db_unavailable" data-i18n-html="admin_dashboard.editor.msg.db_unavailable"></span>
        <span class="i18n" data-msg="draft_updated" data-i18n-html="admin_dashboard.editor.msg.draft_updated"></span>
        <span class="i18n" data-msg="draft_saved" data-i18n-html="admin_dashboard.editor.msg.draft_saved"></span>
        <span class="i18n" data-msg="draft_save_error" data-i18n-html="admin_dashboard.editor.msg.draft_save_error"></span>
        <span class="i18n" data-msg="changes_recovered" data-i18n-html="admin_dashboard.editor.msg.changes_recovered"></span>
        <span class="i18n" data-msg="draft_untitled" data-i18n-html="admin_dashboard.editor.msg.draft_untitled"></span>
        <span class="i18n" data-msg="draft_select" data-i18n-html="admin_dashboard.editor.msg.draft_select"></span>
        <span class="i18n" data-msg="draft_not_found" data-i18n-html="admin_dashboard.editor.msg.draft_not_found"></span>
        <span class="i18n" data-msg="draft_opened" data-i18n-html="admin_dashboard.editor.msg.draft_opened"></span>
        <span class="i18n" data-msg="draft_open_error" data-i18n-html="admin_dashboard.editor.msg.draft_open_error"></span>
        <span class="i18n" data-msg="draft_deleted" data-i18n-html="admin_dashboard.editor.msg.draft_deleted"></span>
        <span class="i18n" data-msg="editor_ready_new" data-i18n-html="admin_dashboard.editor.msg.editor_ready_new"></span>
        <span class="i18n" data-msg="publishing" data-i18n-html="admin_dashboard.editor.msg.publishing"></span>
        <span class="i18n" data-msg="need_title" data-i18n-html="admin_dashboard.editor.msg.need_title"></span>
        <span class="i18n" data-msg="need_slug" data-i18n-html="admin_dashboard.editor.msg.need_slug"></span>
        <span class="i18n" data-msg="need_content" data-i18n-html="admin_dashboard.editor.msg.need_content"></span>
        <span class="i18n" data-msg="preparing" data-i18n-html="admin_dashboard.editor.msg.preparing"></span>
        <span class="i18n" data-msg="stage_init" data-i18n-html="admin_dashboard.editor.msg.stage_init"></span>
        <span class="i18n" data-msg="stage_preview" data-i18n-html="admin_dashboard.editor.msg.stage_preview"></span>
        <span class="i18n" data-msg="stage_read" data-i18n-html="admin_dashboard.editor.msg.stage_read"></span>
        <span class="i18n" data-msg="stage_autosave" data-i18n-html="admin_dashboard.editor.msg.stage_autosave"></span>
        <span class="i18n" data-msg="stage_images" data-i18n-html="admin_dashboard.editor.msg.stage_images"></span>
        <span class="i18n" data-msg="stage_files" data-i18n-html="admin_dashboard.editor.msg.stage_files"></span>
        <span class="i18n" data-msg="stage_publish" data-i18n-html="admin_dashboard.editor.msg.stage_publish"></span>
        <span class="i18n" data-msg="stage_confirm" data-i18n-html="admin_dashboard.editor.msg.stage_confirm"></span>
        <span class="i18n" data-msg="published" data-i18n-html="admin_dashboard.editor.msg.published"></span>
        <span class="i18n" data-msg="prepared" data-i18n-html="admin_dashboard.editor.msg.prepared"></span>
        <span class="i18n" data-msg="publish_stage_error" data-i18n-html="admin_dashboard.editor.msg.publish_stage_error"></span>
        <span class="i18n" data-msg="discard_changes" data-i18n-html="admin_dashboard.editor.msg.discard_changes"></span>
        <span class="i18n" data-msg="post_updated" data-i18n-html="admin_dashboard.editor.msg.post_updated"></span>
        <span class="i18n" data-msg="post_loaded" data-i18n-html="admin_dashboard.editor.msg.post_loaded"></span>
        <span class="i18n" data-msg="post_load_error" data-i18n-html="admin_dashboard.editor.msg.post_load_error"></span>
        <span class="i18n" data-msg="delete_prepare_error" data-i18n-html="admin_dashboard.editor.msg.delete_prepare_error"></span>
        <span class="i18n" data-msg="delete_error" data-i18n-html="admin_dashboard.editor.msg.delete_error"></span>
        <span class="i18n" data-msg="content_placeholder" data-i18n-html="admin_dashboard.editor.content_placeholder"></span>
        <span class="i18n" data-msg="reading_stats" data-i18n-html="admin_dashboard.editor.reading_stats"></span>
    </div>
</div>
