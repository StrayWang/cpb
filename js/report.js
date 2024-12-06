document.addEventListener('DOMContentLoaded', function() {
    initReportForm();
});

function initReportForm() {
    const form = document.getElementById('reportForm');
    const previewBtn = document.querySelector('.btn-preview');
    const modal = document.getElementById('previewModal');
    const modalClose = modal.querySelector('.modal-close');
    const btnCancel = modal.querySelector('.btn-cancel');
    const btnConfirm = modal.querySelector('.btn-confirm');

    // 初始化文件上传
    initFileUpload('chatUpload', 'chatPreview', 10);
    initFileUpload('transferUpload', 'transferPreview', 5);

    // 预览按钮点击事件
    previewBtn.addEventListener('click', () => {
        if (validateForm()) {
            showPreview();
        }
    });

    // 关闭模态框
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 确认提交
    btnConfirm.addEventListener('click', () => {
        submitReport();
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 表单提交
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            submitReport();
        }
    });

    // 匿名举报复选框事件
    document.getElementById('isAnonymous').addEventListener('change', function() {
        const reporterContact = document.getElementById('reporterContact');
        reporterContact.required = !this.checked;
        reporterContact.disabled = this.checked;
        if (this.checked) {
            reporterContact.value = '';
        }
    });
}

function initFileUpload(uploadAreaId, previewAreaId, maxFiles) {
    const uploadArea = document.getElementById(uploadAreaId);
    const previewArea = document.getElementById(previewAreaId);
    const fileInput = uploadArea.querySelector('input[type="file"]');
    const uploadedFiles = new Set();

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--light-color)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--light-color)';
        handleFiles(e.dataTransfer.files);
    });

    // 点击上传
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        if (uploadedFiles.size + files.length > maxFiles) {
            showNotification(`最多只能上传${maxFiles}张图片`, 'warning');
            return;
        }

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showNotification('只能上传图片文件', 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = createPreviewItem(e.target.result, file);
                previewArea.appendChild(previewItem);
                uploadedFiles.add(file);
            };
            reader.readAsDataURL(file);
        });
    }

    function createPreviewItem(src, file) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${src}" alt="preview">
            <button type="button" class="remove-btn">&times;</button>
        `;

        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            uploadedFiles.delete(file);
        });

        return div;
    }
}

function validateForm() {
    const form = document.getElementById('reportForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            showFieldError(field);
        } else {
            field.classList.remove('error');
            removeFieldError(field);
        }
    });

    if (!isValid) {
        showNotification('请填写所有必填项', 'warning');
    }

    return isValid;
}

function showFieldError(field) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = '此项为必填';
    
    if (!field.nextElementSibling?.classList.contains('field-error')) {
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
}

function removeFieldError(field) {
    const errorDiv = field.nextElementSibling;
    if (errorDiv?.classList.contains('field-error')) {
        errorDiv.remove();
    }
}

function showPreview() {
    const modal = document.getElementById('previewModal');
    const modalBody = modal.querySelector('.modal-body');
    const formData = new FormData(document.getElementById('reportForm'));
    
    let previewHTML = `
        <div class="preview-content">
            <h3>诈骗信息</h3>
            <p><strong>诈骗类型：</strong>${getFormattedValue('fraudType', formData.get('fraudType'))}</p>
            <p><strong>涉案金额：</strong>${formData.get('fraudAmount') ? `￥${formData.get('fraudAmount')}` : '未填写'}</p>
            <p><strong>诈骗时间：</strong>${formData.get('fraudDate')}</p>

            <h3>骗子信息</h3>
            <p><strong>联系方式：</strong>${formData.get('fraudsterContact')}</p>
            <p><strong>姓名/昵称：</strong>${formData.get('fraudsterName') || '未填写'}</p>
            <p><strong>收款账号：</strong>${formData.get('fraudsterAccount') || '未填写'}</p>
            <p><strong>诈骗平台：</strong>${formData.get('fraudsterPlatform') || '未填写'}</p>

            <h3>诈骗经过</h3>
            <p>${formData.get('fraudDescription')}</p>

            <h3>举报人信息</h3>
            <p><strong>联系方式：</strong>${formData.get('isAnonymous') === 'on' ? '匿名举报' : formData.get('reporterContact')}</p>
        </div>
    `;

    modalBody.innerHTML = previewHTML;
    modal.style.display = 'block';
}

function getFormattedValue(fieldName, value) {
    const formatters = {
        fraudType: {
            shopping: '购物诈骗',
            investment: '投资理财诈骗',
            job: '求职招聘诈骗',
            dating: '交友诈骗',
            telecom: '电信诈骗',
            other: '其他诈骗'
        }
    };

    return formatters[fieldName]?.[value] || value;
}

async function submitReport() {
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const response = await mockSubmitAPI(formData);
        
        if (response.success) {
            showNotification('举报提交成功！感谢您的贡献', 'success');
            form.reset();
            document.getElementById('previewModal').style.display = 'none';
            
            // 清除预览图片
            document.getElementById('chatPreview').innerHTML = '';
            document.getElementById('transferPreview').innerHTML = '';
            
            // 延迟跳转到成功页面
            setTimeout(() => {
                window.location.href = 'report/report-success.html';
            }, 2000);
        } else {
            throw new Error(response.message || '提交失败');
        }
    } catch (error) {
        showNotification(error.message || '提交失败，请稍后重试', 'error');
    } finally {
        hideLoading();
    }
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
async function mockSubmitAPI(formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '举报提交成功'
            });
        }, 1000);
    });
} 