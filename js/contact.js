document.addEventListener('DOMContentLoaded', function() {
    initContactPage();
});

function initContactPage() {
    // 初始化在线客服
    initChat();
    // 初始化文件上传
    initFileUpload();
    // 初始化FAQ折叠
    initFAQ();
    // 初始化反馈表单
    initFeedbackForm();
}

function initChat() {
    const chatBtn = document.querySelector('.btn-chat');
    const modal = document.getElementById('chatModal');
    const closeBtn = modal.querySelector('.modal-close');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessage');
    const messagesContainer = document.getElementById('chatMessages');

    // 打开聊天窗口
    chatBtn.addEventListener('click', () => {
        if (!isUserLoggedIn()) {
            showNotification('请先登录后再使用在线客服', 'warning');
            return;
        }
        modal.style.display = 'block';
        loadChatHistory();
        messageInput.focus();
    });

    // 关闭聊天窗口
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 发送消息
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // 添加用户消息到聊天窗口
        appendMessage(message, 'user');
        messageInput.value = '';

        try {
            // TODO: 替换为实际的API调用
            const response = await mockChatAPI(message);
            
            if (response.success) {
                appendMessage(response.reply, 'service');
            } else {
                throw new Error(response.message || '发送失败');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

function appendMessage(content, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${type}`;
    
    const time = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadChatHistory() {
    try {
        // TODO: 替换为实际的API调用
        const response = await mockLoadChatHistory();
        
        if (response.success) {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = '';
            
            response.messages.forEach(msg => {
                appendMessage(msg.content, msg.type);
            });
        } else {
            throw new Error(response.message || '加载聊天记录失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function initFileUpload() {
    const fileInput = document.getElementById('attachments');
    const uploadArea = document.querySelector('.upload-area');
    const fileList = document.getElementById('fileList');
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // 点击上传
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                showNotification('不支持的文件类型', 'error');
                return;
            }

            if (file.size > maxSize) {
                showNotification('文件大小不能超过10MB', 'error');
                return;
            }

            addFileToList(file);
        });
    }

    function addFileToList(file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-item';
        fileDiv.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <span class="remove-file">&times;</span>
        `;

        const removeBtn = fileDiv.querySelector('.remove-file');
        removeBtn.addEventListener('click', () => {
            fileDiv.remove();
        });

        fileList.appendChild(fileDiv);
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // 关闭其他打开的FAQ
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // 切换当前FAQ的状态
            item.classList.toggle('active');
        });
    });
}

function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            showLoading();
            
            const formData = new FormData(form);
            // TODO: 替换为实际的API调用
            const response = await mockSubmitFeedback(formData);
            
            if (response.success) {
                showNotification('反馈提交成功！', 'success');
                form.reset();
                document.getElementById('fileList').innerHTML = '';
            } else {
                throw new Error(response.message || '提交失败');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading();
        }
    });
}

function validateForm() {
    const form = document.getElementById('feedbackForm');
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;

    if (!isValidEmail(email)) {
        showNotification('请输入有效的邮箱地址', 'error');
        return false;
    }

    if (subject.length < 5 || subject.length > 100) {
        showNotification('主题长度应在5-100字之间', 'error');
        return false;
    }

    if (message.length < 10 || message.length > 1000) {
        showNotification('反馈内容长度应在10-1000字之间', 'error');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 工具函数
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
async function mockChatAPI(message) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                reply: '您好，这是客服自动回复。您的问题我们已经收到，会尽快处理。'
            });
        }, 500);
    });
}

async function mockLoadChatHistory() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                messages: [
                    {
                        type: 'service',
                        content: '您好，欢迎使用在线客服，请问有什么可以帮您？',
                        time: '10:00'
                    }
                ]
            });
        }, 500);
    });
}

async function mockSubmitFeedback(formData) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '反馈提交成功'
            });
        }, 500);
    });
} 