document.addEventListener('DOMContentLoaded', function() {
    initForumPage();
});

function initForumPage() {
    // 初始化发帖功能
    initNewPost();
    // 初始化筛选功能
    initFilter();
    // 初始化分页功能
    initPagination();
    // 初始化搜索功能
    initSearch();
    // 初始化版块切换
    initNavigation();
}

function initNewPost() {
    const newPostBtn = document.getElementById('newPostBtn');
    const modal = document.getElementById('newPostModal');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('newPostForm');

    // 打开发帖模态框
    newPostBtn.addEventListener('click', () => {
        if (!isUserLoggedIn()) {
            showNotification('请先登录后再发帖', 'warning');
            return;
        }
        modal.style.display = 'block';
    });

    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });

    // 发帖表单提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validatePostForm()) {
            return;
        }

        try {
            showLoading();
            
            const formData = {
                title: form.postTitle.value,
                category: form.postCategory.value,
                content: form.postContent.value,
                tags: form.postTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            // TODO: 替换为实际的API调用
            const response = await mockCreatePost(formData);
            
            if (response.success) {
                showNotification('发布成功！', 'success');
                modal.style.display = 'none';
                form.reset();
                refreshPosts();
            } else {
                throw new Error(response.message || '发布失败');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    });
}

function validatePostForm() {
    const form = document.getElementById('newPostForm');
    const title = form.postTitle.value.trim();
    const content = form.postContent.value.trim();
    const tags = form.postTags.value.split(',').map(tag => tag.trim()).filter(Boolean);

    if (title.length < 5 || title.length > 50) {
        showNotification('标题长度应在5-50字之间', 'error');
        return false;
    }

    if (content.length < 10 || content.length > 5000) {
        showNotification('正文长度应在10-5000字之间', 'error');
        return false;
    }

    if (tags.length > 5) {
        showNotification('标签数量不能超过5个', 'error');
        return false;
    }

    return true;
}

function initFilter() {
    const filterTabs = document.querySelectorAll('.tab-btn');
    const timeSelect = document.querySelector('.filter-options select');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            refreshPosts();
        });
    });

    timeSelect.addEventListener('change', () => {
        refreshPosts();
    });
}

async function refreshPosts() {
    const activeTab = document.querySelector('.tab-btn.active');
    const timeSelect = document.querySelector('.filter-options select');
    const currentCategory = document.querySelector('.nav-group li.active a').getAttribute('href').slice(1);

    const filters = {
        sort: activeTab.textContent,
        time: timeSelect.value,
        category: currentCategory
    };

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockFetchPosts(filters);
        
        if (response.success) {
            renderPosts(response.data);
            updatePagination(response.pagination);
        } else {
            throw new Error(response.message || '获取帖子失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderPosts(posts) {
    const postList = document.querySelector('.post-list');
    postList.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    return `
        <article class="post-item ${post.pinned ? 'pinned' : ''}">
            ${post.pinned ? '<div class="post-badge">置顶</div>' : ''}
            <div class="post-main">
                <h3 class="post-title">
                    <a href="/forum/post/${post.id}">${post.title}</a>
                </h3>
                ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
                <div class="post-meta">
                    <span class="post-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}">
                        ${post.author.name}
                    </span>
                    <span class="post-time">${formatTime(post.createTime)}</span>
                    <span class="post-category">${post.category}</span>
                    ${post.tags ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="post-stats">
                <div class="stat">
                    <span class="number">${formatNumber(post.views)}</span>
                    <span class="label">查看</span>
                </div>
                <div class="stat">
                    <span class="number">${formatNumber(post.replies)}</span>
                    <span class="label">回复</span>
                </div>
            </div>
        </article>
    `;
}

function initPagination() {
    const pagination = document.querySelector('.pagination');
    pagination.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.page-number') && !target.classList.contains('active')) {
            const pageNumbers = pagination.querySelectorAll('.page-number');
            pageNumbers.forEach(num => num.classList.remove('active'));
            target.classList.add('active');
            refreshPosts();
        } else if (target.matches('.page-btn') && !target.disabled) {
            const currentPage = pagination.querySelector('.page-number.active');
            const isNext = target.textContent === '下一页';
            const newPage = isNext ? currentPage.nextElementSibling : currentPage.previousElementSibling;
            if (newPage && newPage.matches('.page-number')) {
                currentPage.classList.remove('active');
                newPage.classList.add('active');
                refreshPosts();
            }
        }
    });
}

function updatePagination(pagination) {
    const paginationEl = document.querySelector('.pagination');
    const { currentPage, totalPages } = pagination;

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    html += '<div class="page-numbers">';

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-number ${i === currentPage ? 'active' : ''}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span class="page-ellipsis">...</span>';
        }
    }

    html += '</div>';
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;

    paginationEl.innerHTML = html;
}

function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 300);
    });

    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
}

async function performSearch(query) {
    if (!query.trim()) {
        refreshPosts();
        return;
    }

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockSearchPosts(query);
        
        if (response.success) {
            renderPosts(response.data);
            updatePagination(response.pagination);
        } else {
            throw new Error(response.message || '搜索失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-group a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('href').slice(1);
            
            // 更新active状态
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            refreshPosts();
        });
    });
}

// 工具函数
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // 转换为秒

    if (diff < 60) {
        return '刚刚';
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`;
    } else if (diff < 604800) {
        return `${Math.floor(diff / 86400)}天前`;
    } else {
        return date.toLocaleDateString();
    }
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function isUserLoggedIn() {
    // TODO: 实现实际的登录状态检查
    return true;
}

function showNotification(message, type = 'info') {
    // TODO: 实现通知显示功能
    alert(message);
}

function showLoading() {
    // TODO: 实现加载状态显示
}

function hideLoading() {
    // TODO: 实现加载状态隐藏
}

// Mock APIs
async function mockCreatePost(formData) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '发布成功'
            });
        }, 500);
    });
}

async function mockFetchPosts(filters) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        id: 1,
                        title: '【公告】社区规范及发帖指南',
                        author: {
                            name: '管理员',
                            avatar: 'images/admin-avatar.jpg'
                        },
                        createTime: Date.now() - 86400000,
                        category: '公告通知',
                        pinned: true,
                        views: 1234,
                        replies: 45
                    }
                    // 可以添加更多模拟数据
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 10
                }
            });
        }, 500);
    });
}

async function mockSearchPosts(query) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    // 模拟搜索结果
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 5
                }
            });
        }, 500);
    });
} 