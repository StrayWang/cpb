document.addEventListener('DOMContentLoaded', function() {
    initReportSuccess();
});

function initReportSuccess() {
    // 从URL参数获取举报编号
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');
    
    if (reportId) {
        document.getElementById('reportId').textContent = reportId;
    }

    // 初始化进度更新
    updateProgress();
}

function updateProgress() {
    // TODO: 替换为实际的API调用
    mockFetchProgress().then(response => {
        if (response.success) {
            updateProgressUI(response.data);
        }
    });
}

function updateProgressUI(progressData) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        if (index < progressData.currentStep) {
            step.classList.add('active');
            step.querySelector('.step-time').textContent = progressData.times[index];
        }
    });
}

async function copyReportId() {
    const reportId = document.getElementById('reportId').textContent;
    
    try {
        await navigator.clipboard.writeText(reportId);
        showNotification('举报编号已复制到剪贴板', 'success');
    } catch (err) {
        showNotification('复制失败，请手动复制', 'error');
    }
}

function showNotification(message, type = 'info') {
    // TODO: 实现通知显示功能
    alert(message);
}

// Mock API
async function mockFetchProgress() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    currentStep: 2,
                    times: [
                        '2024-03-20 12:34',
                        '2024-03-20 12:35',
                        '-',
                        '-'
                    ]
                }
            });
        }, 500);
    });
} 