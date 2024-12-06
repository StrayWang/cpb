// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有组件
    initSearchBox();
    initReportForm();
    initMobileNav();
    initScrollEffects();
    initNotifications();
});

// 搜索框功能
function initSearchBox() {
    const searchBox = document.querySelector('.search-box');
    const searchInput = searchBox?.querySelector('input');
    const searchButton = searchBox?.querySelector('button');

    if (!searchBox || !searchInput || !searchButton) return;

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 搜索建议功能
    const handleInput = debounce(async (event) => {
        const query = event.target.value.trim();
        if (query.length < 2) return;

        try {
            // TODO: 替换为实际的API端点
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            // 处理搜索建议...
        } catch (error) {
            console.error('获取搜索建议失败:', error);
        }
    }, 300);

    searchInput.addEventListener('input', handleInput);
    
    // 搜索提交
    searchBox.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // TODO: 实现搜索跳转
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    });
}

// 举报表单功能
function initReportForm() {
    const reportButton = document.querySelector('.btn-report');
    if (!reportButton) return;

    reportButton.addEventListener('click', () => {
        // 创建模态框
        const modal = createReportModal();
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => modal.classList.add('active'), 10);
    });
}

// 创建举报模态框
function createReportModal() {
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>举报骗子</h2>
            <form id="reportForm">
                <div class="form-group">
                    <label for="fraudType">诈骗类型</label>
                    <select id="fraudType" required>
                        <option value="">请选择诈骗类型</option>
                        <option value="shopping">购物诈骗</option>
                        <option value="investment">投资诈骗</option>
                        <option value="telecom">电信诈骗</option>
                        <option value="other">其他诈骗</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="fraudsterInfo">骗子信息</label>
                    <input type="text" id="fraudsterInfo" placeholder="请输入骗子的联系方式、账号等信息" required>
                </div>
                <div class="form-group">
                    <label for="description">详细描述</label>
                    <textarea id="description" placeholder="请详细描述诈骗过程..." required></textarea>
                </div>
                <div class="form-group">
                    <label for="evidence">证据上传</label>
                    <input type="file" id="evidence" multiple accept="image/*,.pdf">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">提交举报</button>
                    <button type="button" class="btn btn-secondary close-modal">取消</button>
                </div>
            </form>
        </div>
    `;

    // 关闭模态框
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });

    // 处理表单提交
    modal.querySelector('#reportForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
            // TODO: 替换为实际的API端点
            const response = await fetch('/api/report', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showNotification('举报提交成功！感谢您的贡献。', 'success');
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            } else {
                throw new Error('提交失败');
            }
        } catch (error) {
            showNotification('提交失败，请稍后重试。', 'error');
        }
    });

    return modal;
}

// 移动端导航
function initMobileNav() {
    const nav = document.querySelector('.main-nav');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-button';
    menuButton.innerHTML = '<span></span><span></span><span></span>';
    
    // 在小屏幕下显示菜单按钮
    if (window.innerWidth <= 768) {
        document.querySelector('.main-header .container').prepend(menuButton);
    }

    menuButton.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuButton.classList.toggle('active');
    });

    // 响应式处理
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            menuButton.classList.remove('active');
        }
    }, 250));
}

// 滚动效果
function initScrollEffects() {
    const scrollElements = document.querySelectorAll('.case-card, .knowledge-card');
    
    const elementInView = (el, offset = 0) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) - offset
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('scrolled');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 100)) {
                displayScrollElement(el);
            }
        });
    };

    window.addEventListener('scroll', debounce(handleScrollAnimation, 100));
}

// 通知系统
function initNotifications() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container = document.querySelector('.notification-container');
    container.appendChild(notification);

    // 自动消失
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
