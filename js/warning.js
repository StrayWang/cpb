document.addEventListener('DOMContentLoaded', function() {
    initWarningPage();
});

function initWarningPage() {
    // 初始化筛选功能
    initFilter();
    // 初始化预警详情
    initWarningDetails();
    // 初始化分享功能
    initShare();
    // 初始化订阅功能
    initSubscribe();
    // 初始化搜索功能
    initSearch();
}

function initFilter() {
    const filters = {
        type: document.getElementById('typeFilter'),
        region: document.getElementById('regionFilter'),
        risk: document.getElementById('riskFilter'),
        time: document.getElementById('timeFilter')
    };

    // 为每个筛选器添加change事件
    Object.values(filters).forEach(filter => {
        filter.addEventListener('change', () => {
            refreshWarnings(getFilterParams());
        });
    });
}

function getFilterParams() {
    return {
        type: document.getElementById('typeFilter').value,
        region: document.getElementById('regionFilter').value,
        risk: document.getElementById('riskFilter').value,
        time: document.getElementById('timeFilter').value
    };
}

async function refreshWarnings(filters) {
    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockFetchWarnings(filters);
        
        if (response.success) {
            renderWarnings(response.data);
            updateStats(response.stats);
        } else {
            throw new Error(response.message || '获取预警信息失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function renderWarnings(warnings) {
    const warningList = document.querySelector('.warning-list');
    warningList.innerHTML = warnings.map(warning => `
        <div class="warning-card" data-id="${warning.id}">
            <div class="warning-content">
                <h3>${warning.title}</h3>
                <div class="warning-meta">
                    <span class="time">${formatTime(warning.time)}</span>
                    <span class="region">${warning.region}</span>
                    <span class="risk-level ${warning.riskLevel}">${formatRiskLevel(warning.riskLevel)}</span>
                </div>
                <p class="warning-desc">${warning.description}</p>
                <div class="warning-tags">
                    ${warning.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="warning-actions">
                    <button class="btn-details" onclick="showWarningDetails('${warning.id}')">查看详情</button>
                    <button class="btn-share" onclick="showShareModal('${warning.id}')">分享预警</button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats(stats) {
    document.querySelector('.warning-stats').innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${stats.today}</span>
            <span class="stat-label">今日预警</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${stats.week}</span>
            <span class="stat-label">本周预警</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${stats.total}</span>
            <span class="stat-label">累计预警</span>
        </div>
    `;
}

function initWarningDetails() {
    const modal = document.getElementById('warningModal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function showWarningDetails(warningId) {
    const modal = document.getElementById('warningModal');
    const modalBody = modal.querySelector('.modal-body');

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockFetchWarningDetails(warningId);
        
        if (response.success) {
            modalBody.innerHTML = `
                <div class="warning-detail">
                    <h3>${response.data.title}</h3>
                    <div class="warning-meta">
                        <span class="time">${formatTime(response.data.time)}</span>
                        <span class="region">${response.data.region}</span>
                        <span class="risk-level ${response.data.riskLevel}">
                            ${formatRiskLevel(response.data.riskLevel)}
                        </span>
                    </div>
                    <div class="warning-content">
                        ${response.data.content}
                    </div>
                    <div class="warning-prevention">
                        <h4>防范建议</h4>
                        <ul>
                            ${response.data.prevention.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        } else {
            throw new Error(response.message || '获取预警详情失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function initShare() {
    const modal = document.getElementById('shareModal');
    const closeBtn = modal.querySelector('.modal-close');
    const shareButtons = modal.querySelectorAll('.share-btn');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    shareButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            handleShare(type, currentWarningId);
        });
    });
}

function showShareModal(warningId) {
    const modal = document.getElementById('shareModal');
    currentWarningId = warningId;
    modal.style.display = 'block';
}

async function handleShare(type, warningId) {
    try {
        switch (type) {
            case 'wechat':
                // TODO: 实现微信分享
                showNotification('微信分享功能开发中', 'info');
                break;
            case 'weibo':
                // TODO: 实现微博分享
                showNotification('微博分享功能开发中', 'info');
                break;
            case 'qq':
                // TODO: 实现QQ分享
                showNotification('QQ分享功能开发中', 'info');
                break;
            case 'link':
                const link = `${window.location.origin}/warning/${warningId}`;
                await navigator.clipboard.writeText(link);
                showNotification('链接已复制到剪贴板', 'success');
                break;
        }
    } catch (error) {
        showNotification('分享失败', 'error');
    }
}

function initSubscribe() {
    const form = document.getElementById('subscribeForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const types = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (!validateEmail(email)) {
            showNotification('请输入有效的邮箱地址', 'error');
            return;
        }

        if (types.length === 0) {
            showNotification('请至少选择一种提醒方式', 'error');
            return;
        }

        try {
            showLoading();
            
            // TODO: 替换为实际的API调用
            const response = await mockSubscribe({ email, types });
            
            if (response.success) {
                showNotification('订阅成功！', 'success');
                form.reset();
            } else {
                throw new Error(response.message || '订阅失败');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    });
}

// 工具函数
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRiskLevel(level) {
    const levels = {
        high: '高风险',
        medium: '中风险',
        low: '低风险'
    };
    return levels[level] || level;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
async function mockFetchWarnings(filters) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        id: '1',
                        title: '新型"杀猪盘"诈骗手法预警',
                        time: Date.now(),
                        region: '全国',
                        riskLevel: 'high',
                        description: '近期发现新型"杀猪盘"诈骗手法，诈骗分子通过社交软件...',
                        tags: ['投资诈骗', '社交软件']
                    }
                    // 可以添加更多模拟数据
                ],
                stats: {
                    today: 24,
                    week: 138,
                    total: 3567
                }
            });
        }, 500);
    });
}

async function mockFetchWarningDetails(warningId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    id: warningId,
                    title: '新型"杀猪盘"诈骗手法预警',
                    time: Date.now(),
                    region: '全国',
                    riskLevel: 'high',
                    content: `
                        <p>近期发现新型"杀猪盘"诈骗手法，主要特点如下：</p>
                        <ol>
                            <li>通过社交软件主动添加好友</li>
                            <li>以投资理财为诱饵</li>
                            <li>使用虚假交易平台</li>
                        </ol>
                    `,
                    prevention: [
                        '不要轻信陌生人的投资建议',
                        '谨防"高收益、零风险"的投资项目',
                        '不要使用未经认证的交易平台'
                    ]
                }
            });
        }, 500);
    });
}

async function mockSubscribe(data) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '订阅成功'
            });
        }, 500);
    });
} 