
<!-- MARKDOWN EDITOR -->
<style>
    #post-preview-panel {
        position: fixed;
        inset: 0;
        z-index: 2000;
        width: 100%;
        height: 100vh;
        height: 100dvh;
        background: #fff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: postPreviewSlideIn 0.25s ease-out;
    }

    #post-preview-panel[hidden] {
        display: none !important;
    }

    @keyframes postPreviewSlideIn {
        from {
            transform: translateX(100%);
        }

        to {
            transform: translateX(0);
        }
    }

    #post-preview-header {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
        border-bottom: 1px solid #dee2e6;
        background: #fff;
    }

    #post-preview-content {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 20px 16px calc(24px + env(safe-area-inset-bottom));
    }
</style>

<section class="markdown-editor">

    <p class="i18n small text-muted mb-3"
       id="post-editor-status"
       role="status"
       aria-live="polite"
       data-i18n-html="admin_dashboard.editor.status_ready"></p>

    <div class="form-group">
        <label for="post-title" class="i18n"
               data-i18n-html="admin_dashboard.editor.title_label"></label>

        <input
            type="text"
            id="post-title"
            class="form-control rounded-0"
            data-i18n-place="admin_dashboard.editor.title_placeholder"
            autocomplete="off"
        >
    </div>

    <div class="form-group">
        <label for="post-summary" class="i18n"
               data-i18n-html="admin_dashboard.editor.summary_label"></label>

            <textarea
                id="post-summary"
                class="form-control rounded-0"
                rows="4"
                data-i18n-place="admin_dashboard.editor.summary_placeholder"
            ></textarea>

            <button
                type="button"
                id="post-summary-restore"
                class="i18n btn btn-sm btn-outline-secondary rounded-0 cp mt-2"
                data-i18n-title="admin_dashboard.editor.summary_restore"
                data-i18n-html="admin_dashboard.editor.summary_restore">
            </button>

        <small class="i18n form-text text-muted"
               data-i18n-html="admin_dashboard.editor.summary_help"></small>
    </div>

    <div class="form-group">
        <label for="post-content" class="i18n"
               data-i18n-html="admin_dashboard.editor.content_label"></label>

        <div class="card rounded-0">

            <div class="card-header bg-transparent p-2">
                <div class="btn-toolbar align-items-center"
                     id="post-editor-toolbar"
                     role="toolbar"
                     data-i18n-title="admin_dashboard.editor.toolbar_label">

                    <div class="btn-group btn-group-sm mr-2 mb-1" role="group">
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="1">H1</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="2">H2</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="3">H3</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="4">H4</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="5">H5</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="heading" data-level="6">H6</button>
                    </div>

                    <div class="btn-group btn-group-sm mr-2 mb-1" role="group">
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="bold"
                            data-i18n-title="admin_dashboard.editor.bold"><strong>B</strong></button>
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="italic"
                            data-i18n-title="admin_dashboard.editor.italic"><em>I</em></button>
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="strike"
                            data-i18n-title="admin_dashboard.editor.strike"><s>S</s></button>
                    </div>

                    <div class="btn-group btn-group-sm mr-2 mb-1" role="group">
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="unordered-list"
                            data-i18n-title="admin_dashboard.editor.unordered_list"
                            data-i18n-html="admin_dashboard.editor.unordered_list_label"></button>
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="ordered-list"
                            data-i18n-title="admin_dashboard.editor.ordered_list"
                            data-i18n-html="admin_dashboard.editor.ordered_list_label"></button>
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="quote"
                            data-i18n-title="admin_dashboard.editor.quote">❝</button>
                    </div>

                    <div class="btn-group btn-group-sm mr-2 mb-1" role="group">
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="link"
                            data-i18n-title="admin_dashboard.editor.link"
                            data-i18n-html="admin_dashboard.editor.link_label"></button>
                        <button type="button" class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-editor-action="code"
                            data-i18n-title="admin_dashboard.editor.code">&lt;/&gt;</button>
                    </div>

                    <div class="d-flex align-items-center mr-2 mb-1">
                        <label for="post-font-size" class="i18n small mb-0 mr-2"
                               data-i18n-html="admin_dashboard.editor.font_size"></label>

                        <select
                            id="post-font-size"
                            class="i18n custom-select custom-select-sm rounded-0 w-auto"
                            data-i18n-title="admin_dashboard.editor.font_size_title">
                            <option value="12px">12</option>
                            <option value="14px">14</option>
                            <option value="16px" selected>16</option>
                            <option value="18px">18</option>
                            <option value="20px">20</option>
                            <option value="24px">24</option>
                            <option value="28px">28</option>
                            <option value="32px">32</option>
                        </select>
                    </div>

                    <div class="mb-1">
                        <button type="button"
                            class="i18n btn btn-sm btn-outline-secondary rounded-0 cp fileUpload"
                            id="post-add-image"
                            data-editor-action="image"
                            data-i18n-title="admin_dashboard.editor.image_title">
                            <span aria-hidden="true">＋</span>
                            <span class="i18n" data-i18n-html="admin_dashboard.editor.image"></span>
                        </button>

                        <input
                            type="file"
                            id="post-image-input"
                            accept="image/*"
                            multiple
                            hidden
                        >
                    </div>

                    <div class="mb-1 mr-2">
                        <button
                            type="button"
                            id="post-microphone"
                            class="i18n btn btn-sm btn-outline-secondary rounded-0 cp"
                            data-i18n-title="admin_dashboard.editor.microphone_title"
                            disabled>
                            <span aria-hidden="true">🎙️</span>
                            <span class="i18n" data-i18n-html="admin_dashboard.editor.microphone"></span>
                        </button>
                    </div>

                    <div class="mb-1 ml-md-auto">
                        <button
                            type="button"
                            id="post-preview-toggle"
                            class="i18n btn btn-sm btn-outline-primary rounded-0 cp"
                            aria-expanded="false"
                            aria-controls="post-preview-panel">
                            <span aria-hidden="true">◉</span>
                            <span class="i18n" data-i18n-html="admin_dashboard.editor.preview_toggle"></span>
                        </button>
                    </div>

                </div>
            </div>

            <textarea
                id="post-content"
                class="form-control rounded-0 border-0 text-monospace"
                rows="14"
                data-i18n-place="admin_dashboard.editor.content_placeholder"
                spellcheck="true"
            ></textarea>

        </div>
    </div>

    <div class="form-group">
        <label for="post-tags" class="i18n"
               data-i18n-html="admin_dashboard.editor.tags_label"></label>

        <input
            type="text"
            id="post-tags"
            class="form-control rounded-0"
            data-i18n-place="admin_dashboard.editor.tags_placeholder"
            autocomplete="off"
        >
    </div>

    <div class="input-group mb-3">
        <select
            id="post-draft-list"
            class="i18n custom-select rounded-0"
            data-i18n-title="admin_dashboard.editor.draft_select_label">
            <option value="" class="i18n" data-i18n-html="admin_dashboard.editor.draft_select_default"></option>
        </select>

        <div class="input-group-append">
            <button
                type="button"
                id="post-open-draft"
                class="i18n btn btn-outline-secondary rounded-0 cp"
                data-i18n-html="admin_dashboard.editor.draft_open">
            </button>
        </div>
    </div>

    <div class="d-flex flex-column flex-sm-row">
        <button
            type="button"
            id="post-save-draft"
            class="i18n btn btn-outline-secondary rounded-0 cp mb-2 mb-sm-0 mr-sm-2"
            data-i18n-html="admin_dashboard.editor.draft_save">
        </button>

        <button
            type="button"
            id="post-generate"
            class="i18n btn btn-info rounded-0 cp ml-sm-auto"
            data-i18n-html="admin_dashboard.editor.generate">
        </button>
    </div>

</section>

<div id="post-preview-panel" hidden>

    <div id="post-preview-header">
        <strong class="i18n" data-i18n-html="admin_dashboard.editor.preview_heading"></strong>

        <button
            type="button"
            id="post-preview-close"
            class="btn btn-sm btn-outline-secondary rounded-0 cp">
            <span aria-hidden="true">✕</span>
            <span class="i18n" data-i18n-html="admin_dashboard.editor.preview_close"></span>
        </button>
    </div>

    <div id="post-preview-content" class="text-break">
        <div id="post-preview" class="markdown-body"></div>
    </div>

</div>

<!-- MENSAGENS DE STATUS (ocultas): o JS copia a mensagem traduzida pelo data-msg -->
<div hidden>
    <span class="i18n" data-msg="speech_error" data-i18n-html="admin_dashboard.msg.speech_error"></span>
    <span class="i18n" data-msg="speech_unavailable" data-i18n-html="admin_dashboard.msg.speech_unavailable"></span>
    <span class="i18n" data-msg="speech_start_error" data-i18n-html="admin_dashboard.msg.speech_start_error"></span>
    <span class="i18n" data-msg="pending_changes" data-i18n-html="admin_dashboard.msg.pending_changes"></span>
    <span class="i18n" data-msg="images_db_unavailable" data-i18n-html="admin_dashboard.msg.images_db_unavailable"></span>
    <span class="i18n" data-msg="images_optimized" data-i18n-html="admin_dashboard.msg.images_optimized"></span>
    <span class="i18n" data-msg="images_added" data-i18n-html="admin_dashboard.msg.images_added"></span>
    <span class="i18n" data-msg="image_save_error" data-i18n-html="admin_dashboard.msg.image_save_error"></span>
    <span class="i18n" data-msg="markdown_load_error" data-i18n-html="admin_dashboard.msg.markdown_load_error"></span>
    <span class="i18n" data-msg="drafts_db_unavailable" data-i18n-html="admin_dashboard.msg.drafts_db_unavailable"></span>
    <span class="i18n" data-msg="autosave_ok" data-i18n-html="admin_dashboard.msg.autosave_ok"></span>
    <span class="i18n" data-msg="autosave_error" data-i18n-html="admin_dashboard.msg.autosave_error"></span>
    <span class="i18n" data-msg="nothing_to_save" data-i18n-html="admin_dashboard.msg.nothing_to_save"></span>
    <span class="i18n" data-msg="db_unavailable" data-i18n-html="admin_dashboard.msg.db_unavailable"></span>
    <span class="i18n" data-msg="draft_updated" data-i18n-html="admin_dashboard.msg.draft_updated"></span>
    <span class="i18n" data-msg="draft_saved" data-i18n-html="admin_dashboard.msg.draft_saved"></span>
    <span class="i18n" data-msg="draft_save_error" data-i18n-html="admin_dashboard.msg.draft_save_error"></span>
    <span class="i18n" data-msg="changes_recovered" data-i18n-html="admin_dashboard.msg.changes_recovered"></span>
    <span class="i18n" data-msg="draft_select" data-i18n-html="admin_dashboard.msg.draft_select"></span>
    <span class="i18n" data-msg="draft_not_found" data-i18n-html="admin_dashboard.msg.draft_not_found"></span>
    <span class="i18n" data-msg="draft_opened" data-i18n-html="admin_dashboard.msg.draft_opened"></span>
    <span class="i18n" data-msg="draft_open_error" data-i18n-html="admin_dashboard.msg.draft_open_error"></span>
    <span class="i18n" data-msg="editor_ready_new" data-i18n-html="admin_dashboard.msg.editor_ready_new"></span>
    <span class="i18n" data-msg="need_title" data-i18n-html="admin_dashboard.msg.need_title"></span>
    <span class="i18n" data-msg="need_content" data-i18n-html="admin_dashboard.msg.need_content"></span>
    <span class="i18n" data-msg="preparing" data-i18n-html="admin_dashboard.msg.preparing"></span>
    <span class="i18n" data-msg="published" data-i18n-html="admin_dashboard.msg.published"></span>
    <span class="i18n" data-msg="prepared" data-i18n-html="admin_dashboard.msg.prepared"></span>
    <span class="i18n" data-msg="publish_stage_error" data-i18n-html="admin_dashboard.msg.publish_stage_error"></span>
    <span class="i18n" data-msg="publishing" data-i18n-html="admin_dashboard.msg.publishing"></span>
    <span class="i18n" data-msg="stage_init" data-i18n-html="admin_dashboard.msg.stage_init"></span>
    <span class="i18n" data-msg="stage_library" data-i18n-html="admin_dashboard.msg.stage_library"></span>
    <span class="i18n" data-msg="stage_preview" data-i18n-html="admin_dashboard.msg.stage_preview"></span>
    <span class="i18n" data-msg="stage_read" data-i18n-html="admin_dashboard.msg.stage_read"></span>
    <span class="i18n" data-msg="stage_autosave" data-i18n-html="admin_dashboard.msg.stage_autosave"></span>
    <span class="i18n" data-msg="stage_images" data-i18n-html="admin_dashboard.msg.stage_images"></span>
    <span class="i18n" data-msg="stage_files" data-i18n-html="admin_dashboard.msg.stage_files"></span>
    <span class="i18n" data-msg="stage_publish" data-i18n-html="admin_dashboard.msg.stage_publish"></span>
    <span class="i18n" data-msg="stage_confirm" data-i18n-html="admin_dashboard.msg.stage_confirm"></span>
    <span class="i18n" data-msg="discard_changes" data-i18n-html="admin_dashboard.msg.discard_changes"></span>
    <span class="i18n" data-msg="post_updated" data-i18n-html="admin_dashboard.msg.post_updated"></span>
    <span class="i18n" data-msg="post_loaded" data-i18n-html="admin_dashboard.msg.post_loaded"></span>
    <span class="i18n" data-msg="post_load_error" data-i18n-html="admin_dashboard.msg.post_load_error"></span>
    <span class="i18n" data-msg="delete_prepare_error" data-i18n-html="admin_dashboard.msg.delete_prepare_error"></span>
    <span class="i18n" data-msg="delete_error" data-i18n-html="admin_dashboard.msg.delete_error"></span>
    <span class="i18n" data-msg="draft_untitled" data-i18n-html="admin_dashboard.msg.draft_untitled"></span>
    <span class="i18n" data-msg="post_missing" data-i18n-html="admin_dashboard.msg.post_missing"></span>
    <span class="i18n" data-msg="post_missing_delete" data-i18n-html="admin_dashboard.msg.post_missing_delete"></span>
    <span class="i18n" data-msg="github_not_confirmed" data-i18n-html="admin_dashboard.msg.github_not_confirmed"></span>
    <span class="i18n" data-msg="markdown_fetch_error" data-i18n-html="admin_dashboard.msg.markdown_fetch_error"></span>
</div>
<!-- END MARKDOWN EDITOR -->
