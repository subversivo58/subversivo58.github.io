<!-- ADMIN POST ITEM (template clonado pelo AdminPosts.mjs para cada postagem) -->
<template id="admin-post-item-template">
    <div class="list-group-item px-2 py-2" data-post-item>
        <div class="d-flex align-items-center">
            <div class="mr-2 flex-shrink-0" data-post-cover></div>
            <div class="flex-grow-1" style="min-width: 0;">
                <div class="font-weight-bold text-break" data-post-title
                    style="font-size: 13px; line-height: 1.3;"></div>
                <small class="d-block text-muted" data-post-date
                    style="font-size: 11px;"></small>
            </div>
        </div>
        <div class="d-flex align-items-center mt-2">
            <button type="button"
                class="i18n btn btn-outline-primary rounded-0 mr-1"
                data-post-action="edit"
                data-i18n-html="admin_dashboard.posts_list.edit"
                style="font-size: 11px; padding: 3px 7px; line-height: 1.2;"></button>
            <button type="button"
                class="i18n btn btn-outline-danger rounded-0"
                data-post-action="delete"
                data-i18n-html="admin_dashboard.posts_list.delete"
                style="font-size: 11px; padding: 3px 7px; line-height: 1.2;"></button>
        </div>
    </div>
</template>
<!-- END ADMIN POST ITEM -->
