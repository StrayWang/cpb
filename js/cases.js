document.addEventListener('DOMContentLoaded', function() {
    initCasesPage();
});

function initCasesPage() {
    // 初始化筛选器
    initFilters();
    // 初始化加载更多
    initLoadMore();
    // 初始化分享功能
    initShare();
    // 初始化趋势图表
    initTrendCharts();
}

function initFilters() {
    const filters = {
        type: document.getElementById('typeFilter'),
        time: document.getElementById('timeFilter'),
        sort: document.getElementById('sortFilter')
    };

    // 为每个筛选器添加change事件
    Object.values(filters).forEach(filter => {
        filter.addEventListener('change', () => {
            updateCasesList(getFilterParams());
        });
    });
}

function getFilterParams() {
    return {
        type: document.getElementById('typeFilter').value,
        time: document.getElementById('timeFilter').value,
        sort: document.getElementById('sortFilter').value,
    };
}

async function updateCasesList(filters, isLoadMore = false) {
    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockFetchCases(filters);
        
        if (response.success) {
            if (isLoadMore) {
                appendCases(response.cases);
            } else {
                replaceCases(response.cases);
            }
            
            updateLoadMoreButton(response.hasMore);
        } else {
            throw new Error(response.message || '获取案例失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function replaceCases(cases) {
    const casesList = document.getElementById('casesList');
    casesList.innerHTML = cases.map(createCaseCard).join('');
    bindCaseEvents();
}

function appendCases(cases) {
    const casesList = document.getElementById('casesList');
    const newCases = cases.map(createCaseCard).join('');
    casesList.insertAdjacentHTML('beforeend', newCases);
    bindCaseEvents();
}

function createCaseCard(caseData) {
    return `
        <article class="case-card">
            <div class="case-header">
                <span class="case-type">${caseData.type}</span>
                <span class="case-date">${formatDate(caseData.date)}</span>
            </div>
            <h3 class="case-title">${caseData.title}</h3>
            <div class="case-content">
                <p class="case-summary">${caseData.summary}</p>
                <div class="case-info">
                    <div class="info-item">
                        <span class="label">涉案金额</span>
                        <span class="value">￥${formatMoney(caseData.amount)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">发生地点</span>
                        <span class="value">${caseData.location}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">举报次数</span>
                        <span class="value">${caseData.reportCount}次</span>
                    </div>
                </div>
                <div class="case-tags">
                    ${caseData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="case-footer">
                <a href="/case/${caseData.id}" class="btn-more">查看详情</a>
                <button class="btn-share" data-id="${caseData.id}">分享案例</button>
            </div>
        </article>
    `;
}

function bindCaseEvents() {
    // 绑定分享按钮事件
    document.querySelectorAll('.btn-share').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const caseId = e.target.dataset.id;
            showShareModal(caseId);
        });
    });
}

function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', () => {
        const currentFilters = getFilterParams();
        updateCasesList(currentFilters, true);
    });
}

function updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
}

function initShare() {
    const shareModal = document.getElementById('shareModal');
    const closeBtn = shareModal.querySelector('.modal-close');
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });

    // 分享按钮点击事件
    shareModal.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const shareType = e.target.closest('.share-btn').dataset.type;
            handleShare(shareType);
        });
    });
}

function showShareModal(caseId) {
    const shareModal = document.getElementById('shareModal');
    // 可以在这里根据caseId设置分享内容
    shareModal.style.display = 'block';
}

function handleShare(type) {
    // TODO: 实现实际的分享功能
    const shareUrls = {
        wechat: 'weixin://',
        weibo: 'https://service.weibo.com/share/share.php',
        qq: 'https://connect.qq.com/widget/shareqq/index.html',
    };

    if (type === 'link') {
        // 复制链接到剪贴板
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => showNotification('链接已复制到剪贴板', 'success'))
            .catch(() => showNotification('复制失败，请手动复制', 'error'));
    } else {
        // 打开对应的分享页面
        const url = shareUrls[type];
        if (url) {
            window.open(url);
        }
    }
}

function initTrendCharts() {
    // TODO: 使用图表库（如ECharts）实现趋势图表
    // 这里是示例代码，需要替换为实际的图表实现
    const charts = {
        fraudTypes: document.querySelector('.trend-card:nth-child(1) .trend-chart'),
        amounts: document.querySelector('.trend-card:nth-child(2) .trend-chart'),
        locations: document.querySelector('.trend-card:nth-child(3) .trend-chart')
    };

    // 绘制示例图表
    drawMockChart(charts.fraudTypes, '诈骗类型分布');
    drawMockChart(charts.amounts, '诈骗金额分布');
    drawMockChart(charts.locations, '地区分布');
}

function drawMockChart(container, title) {
    // 这里应该使用实际的图表库绘制图表
    container.innerHTML = `<div style="text-align: center; padding: 20px;">
        ${title} 图表
        <p style="color: var(--gray);">（实际项目中需要使用图表库绘制）</p>
    </div>`;
}

// 工具函数
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
}

function formatMoney(amount) {
    return amount.toLocaleString('zh-CN');
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

// Mock API 用于测试
async function mockFetchCases(filters) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                cases: [
                    {
                        id: '1',
                        type: '购物诈骗',
                        title: '虚假购物网站诈骗',
                        summary: '以低价商品为诱饵，收款后不发货或发送假冒伪劣商品...',
                        amount: 3500,
                        location: '广东省',
                        reportCount: 28,
                        date: '2024-03-20',
                        tags: ['虚假网店', '低价诱饵', '虚假物流']
                    },
                    // 可以添加更多模拟数据
                ],
                hasMore: true
            });
        }, 500);
    });
} 