<!-- FOOTOODLES EDITOR (used by Footoodles.mjs inside #admin-footoodles-editor-panel) -->
<section id="admin-footoodle-editor" class="card rounded-0 border bg-white">

    <div class="card-header bg-light d-flex align-items-center justify-content-between py-2">
        <h3 id="footoodle-editor-heading" class="i18n h6 mb-0" data-i18n-html="admin_dashboard.footoodles.new"></h3>
    </div>

    <div class="card-body p-3">
        <div class="form-group">
            <label for="footoodle-image" class="i18n small font-weight-bold" data-i18n-html="admin_dashboard.footoodles.image"></label>
            <div class="mb-2">
                <img id="footoodle-image-preview" src="" alt="" class="img-fluid border admin-footoodle-preview" hidden>
            </div>
            <div class="d-flex align-items-center flex-wrap">
                <button type="button" id="footoodle-image-button"
                    class="i18n btn btn-sm btn-outline-secondary rounded-0 cp mr-2"
                    data-i18n-html="admin_dashboard.footoodles.image_select"></button>
                <small id="footoodle-image-name" class="text-muted text-break"></small>
            </div>
            <input type="file" id="footoodle-image" accept="image/jpeg,image/png,image/webp" hidden>
        </div>

        <div class="form-group">
            <label for="footoodle-title" class="i18n small font-weight-bold" data-i18n-html="admin_dashboard.footoodles.title_label"></label>
            <input type="text" id="footoodle-title" class="i18n form-control rounded-0" maxlength="50" autocomplete="off"
                data-i18n-place="admin_dashboard.footoodles.title_placeholder">
        </div>

        <div class="form-group">
            <label for="footoodle-content" class="i18n small font-weight-bold" data-i18n-html="admin_dashboard.footoodles.content_label"></label>
            <textarea id="footoodle-content" class="i18n form-control rounded-0 border-info p-3" maxlength="280" rows="5"
                data-i18n-place="admin_dashboard.footoodles.content_placeholder"></textarea>
            <small id="footoodle-count" class="d-block text-right text-muted"></small>
        </div>

        <p id="footoodle-status" class="small mt-2 mb-3" role="status" aria-live="polite" hidden></p>

        <div class="d-flex flex-column flex-sm-row">
            <button type="button" id="footoodle-cancel" class="i18n btn btn-outline-secondary btn-sm rounded-0 cp mb-2 mb-sm-0 mr-sm-2"
                data-i18n-html="admin_dashboard.footoodles.cancel"></button>
            <button type="button" id="footoodle-save" class="i18n btn btn-info btn-sm rounded-0 cp ml-sm-auto"
                data-i18n-html="admin_dashboard.footoodles.save"></button>
        </div>
    </div>

</section>
<!-- END FOOTOODLES EDITOR -->
