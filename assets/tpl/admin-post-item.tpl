<!-- ADMIN POST ITEM (template clonado pelo AdminPosts.mjs para cada postagem) -->
<template id="admin-post-item-template">
    <article class="admin-post-card card rounded-0 border" data-post-item>
        <div class="card-body p-3 d-flex flex-column h-100">
            <div class="d-flex align-items-start mb-2">
                <div class="admin-post-thumb mr-3 flex-shrink-0 bg-light border d-flex align-items-center justify-content-center" data-post-cover></div>
                <div class="flex-grow-1 min-w-0">
                    <h3 class="h6 font-weight-bold text-break mb-1" data-post-title></h3>
                    <div class="small text-muted text-monospace text-truncate mb-1" data-post-slug></div>
                    <div class="small text-muted">
                        <span data-post-date></span>
                        <span class="mx-1">&middot;</span>
                        <span data-post-reading></span>
                    </div>
                </div>
            </div>

            <div class="d-flex flex-wrap mb-3" data-post-tags></div>

            <div class="d-flex flex-wrap align-items-center mt-auto pt-2 border-top">
                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="i18n btn btn-sm btn-outline-secondary rounded-0 mr-2 mb-1 cp"
                    data-post-action="view"
                    data-i18n-html="admin_dashboard.posts_view.view"></a>
                <button
                    type="button"
                    class="i18n btn btn-sm btn-outline-primary rounded-0 mr-2 mb-1 cp"
                    data-post-action="edit"
                    data-i18n-html="admin_dashboard.posts_list.edit"></button>
                <button
                    type="button"
                    class="i18n btn btn-sm btn-outline-danger rounded-0 ml-auto mb-1 cp"
                    data-post-action="delete"
                    data-i18n-html="admin_dashboard.posts_list.delete"></button>
            </div>
        </div>
    </article>
</template>
<!-- END ADMIN POST ITEM -->
