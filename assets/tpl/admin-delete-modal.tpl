<!-- ADMIN DELETE MODAL (template clonado pelo AdminPosts.mjs) -->
<template id="admin-delete-modal-template">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-0">

            <div class="modal-header">
                <h5 id="admin-delete-title" class="i18n modal-title"
                    data-i18n-html="admin_dashboard.delete_modal.title"></h5>

                <button type="button" class="close i18n" data-modal-close
                    data-i18n-title="admin_dashboard.delete_modal.close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body">
                <p class="i18n mb-2" data-i18n-html="admin_dashboard.delete_modal.question"></p>

                <strong class="d-block text-break" data-post-title></strong>

                <p class="small mt-3 mb-0" role="status" aria-live="polite"
                    data-modal-status hidden></p>
            </div>

            <div class="modal-footer">
                <button type="button" class="i18n btn btn-outline-secondary rounded-0" data-modal-close
                    data-i18n-html="admin_dashboard.delete_modal.cancel"></button>

                <button type="button" class="i18n btn btn-danger rounded-0" data-modal-confirm
                    data-i18n-html="admin_dashboard.delete_modal.confirm"></button>
            </div>

        </div>
    </div>
</template>
<!-- END ADMIN DELETE MODAL -->
