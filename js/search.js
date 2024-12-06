document.addEventListener('DOMContentLoaded', function() {
    initSearchPage();
});

function initSearchPage() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchTabs = document.querySelector('.search-tabs');
    const resultsList = document.getElementById('resultsList');
    const searchResults = document.querySelector('.search-results');
    const noResults = document.querySelector('.no-results');

    // 搜索类型切换
    searchTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            // 移除所有active类
            searchTabs.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // 添加active类到点击的按钮
            e.target.classList.add('active');
            // 更新搜索框placeholder
            updateSearchPlaceholder(e.target.dataset.type);
        }
    });

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        performSearch();
    });

    // 搜索框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 过滤器变化事件
    document.getElementById('timeFilter').addEventListener('change', updateResults);
    document.getElementById('typeFilter').addEventListener('change', updateResults);
}

function updateSearchPlaceholder(type) {
    const placeholders = {
        all: '输入电话、账号、网址等信息进行查询...',
        phone: '输入完整的电话号码进行查询...',
        account: '输入QQ、微信、支付宝等账号进行查询...',
        website: '输入网站域名或APP名称进行查询...',
        name: '输入诈骗者姓名或昵称进行查询...'
    };
    document.getElementById('searchInput').placeholder = placeholders[type] || placeholders.all;
}

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('请输入搜索内容', 'warning');
        return;
    }

    // 显示加载状态
    showLoading();

    try {
        // TODO: 替换为实际的API调用
        const response = await mockSearchAPI(query);
        
        if (response.results.length > 0) {
            displayResults(response.results);
            document.querySelector('.search-results').style.display = 'block';
            document.querySelector('.no-results').style.display = 'none';
        } else {
            document.querySelector('.search-results').style.display = 'none';
            document.querySelector('.no-results').style.display = 'block';
        }
    } catch (error) {
        showNotification('搜索失败，请稍后重试', 'error');
    } finally {
        hideLoading();
    }
}

function displayResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = ''; // 清空现有结果

    results.forEach(result => {
        const resultHtml = createResultItem(result);
        resultsList.insertAdjacentHTML('beforeend', resultHtml);
    });

    // 更新结果数量
    document.getElementById('resultCount').textContent = results.length;

    // 绑定结果项的事件
    bindResultEvents();
}

function createResultItem(result) {
    return `
        <div class="result-item">
            <div class="risk-level ${result.riskLevel}">${getRiskLevelText(result.riskLevel)}</div>
            <div class="result-content">
                <h3>${result.title}</h3>
                <div class="result-info">
                    <p class="info-item"><strong>诈骗类型：</strong>${result.type}</p>
                    <p class="info-item"><strong>举报次数：</strong>${result.reportCount}次</p>
                    <p class="info-item"><strong>最近举报：</strong>${result.lastReportDate}</p>
                </div>
                <div class="result-detail">
                    <p>${result.description}</p>
                </div>
                <div class="result-meta">
                    <span class="meta-item">举报时间：${result.reportDate}</span>
                    <span class="meta-item">来源：${result.source}</span>
                </div>
            </div>
            <div class="result-actions">
                <button class="btn-detail" data-id="${result.id}">查看详情</button>
                <button class="btn-report" data-id="${result.id}">我要举报</button>
            </div>
        </div>
    `;
}

function bindResultEvents() {
    // 绑定详情按钮点击事件
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            window.location.href = `/case/${id}`;
        });
    });

    // 绑定举报按钮点击事件
    document.querySelectorAll('.btn-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            window.location.href = `/report?target=${id}`;
        });
    });
}

function getRiskLevelText(level) {
    const levels = {
        high: '高风险',
        medium: '中风险',
        low: '低风险'
    };
    return levels[level] || '未知风险';
}

function showNotification(message, type) {
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
async function mockSearchAPI(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                results: [
                    {
                        id: '1',
                        title: '购物诈骗 - 虚假购物网站',
                        type: '购物诈骗',
                        riskLevel: 'high',
                        reportCount: 52,
                        lastReportDate: '2024-03-20',
                        description: '涉及虚假购物网站，以超低价格销售商品，收款后不发货或发送假冒伪劣商品...',
                        reportDate: '2024-03-20',
                        source: '用户举报'
                    }
                    // 可以添���更多模拟数据
                ]
            });
        }, 500);
    });
} 