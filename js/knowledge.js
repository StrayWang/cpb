document.addEventListener('DOMContentLoaded', function() {
    initKnowledgePage();
});

function initKnowledgePage() {
    // 初始化搜索功能
    initSearch();
    // 初始化导航高亮和滚动
    initNavigation();
    // 初始化FAQ折叠
    initFAQ();
    // 初始化知识测试
    initKnowledgeTest();
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // 搜索防抖
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

    // 回车搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

async function performSearch(query) {
    if (!query.trim()) return;

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const results = await mockSearchAPI(query);
        
        if (results.success) {
            displaySearchResults(results.data);
        } else {
            throw new Error(results.message || '搜索失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function displaySearchResults(results) {
    // 滚动到搜索结果
    const mainContent = document.querySelector('.knowledge-main');
    const resultsHTML = results.map(result => `
        <article class="search-result">
            <h3><a href="#${result.id}">${result.title}</a></h3>
            <p>${result.excerpt}</p>
            <div class="result-meta">
                <span class="result-type">${result.type}</span>
                <span class="result-date">${result.date}</span>
            </div>
        </article>
    `).join('');

    mainContent.innerHTML = `
        <section class="search-results">
            <h2>搜索结果</h2>
            ${resultsHTML}
        </section>
    `;

    mainContent.scrollIntoView({ behavior: 'smooth' });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.content-section');

    // 点击导航链接���动
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 滚动时更新导航高亮
    window.addEventListener('scroll', debounce(() => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }, 100));
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

function initKnowledgeTest() {
    const startTestBtn = document.getElementById('startTest');
    const testModal = document.getElementById('testModal');
    const closeBtn = testModal.querySelector('.modal-close');

    startTestBtn.addEventListener('click', () => {
        showTest();
    });

    closeBtn.addEventListener('click', () => {
        testModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === testModal) {
            testModal.style.display = 'none';
        }
    });
}

async function showTest() {
    const testModal = document.getElementById('testModal');
    const modalBody = testModal.querySelector('.modal-body');

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const questions = await mockGetTestQuestions();
        
        if (questions.success) {
            displayTestQuestions(questions.data);
            testModal.style.display = 'block';
        } else {
            throw new Error(questions.message || '获取测试题目失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function displayTestQuestions(questions) {
    const modalBody = document.querySelector('.test-question');
    let currentQuestion = 0;

    function showQuestion() {
        const question = questions[currentQuestion];
        modalBody.innerHTML = `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">问题 ${currentQuestion + 1}/${questions.length}</span>
                    <span class="question-type">${question.type}</span>
                </div>
                <h3 class="question-title">${question.title}</h3>
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <label class="option">
                            <input type="radio" name="answer" value="${index}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="question-actions">
                    ${currentQuestion > 0 ? '<button class="btn-prev">上一题</button>' : ''}
                    ${currentQuestion < questions.length - 1 
                        ? '<button class="btn-next">下一题</button>'
                        : '<button class="btn-submit">提交答案</button>'}
                </div>
            </div>
        `;

        // 绑定按钮事件
        const prevBtn = modalBody.querySelector('.btn-prev');
        const nextBtn = modalBody.querySelector('.btn-next');
        const submitBtn = modalBody.querySelector('.btn-submit');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestion > 0) {
                    currentQuestion--;
                    showQuestion();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestion < questions.length - 1) {
                    currentQuestion++;
                    showQuestion();
                }
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', submitTest);
        }
    }

    showQuestion();
}

async function submitTest() {
    // 收集答案
    const answers = Array.from(document.querySelectorAll('input[name="answer"]:checked'))
        .map(input => input.value);

    try {
        showLoading();
        
        // TODO: 替换为实际的API调用
        const result = await mockSubmitTest(answers);
        
        if (result.success) {
            showTestResult(result.data);
        } else {
            throw new Error(result.message || '提交答案失败');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

function showTestResult(result) {
    const modalBody = document.querySelector('.test-question');
    modalBody.innerHTML = `
        <div class="test-result">
            <h3>测试结果</h3>
            <div class="result-score">
                得分：${result.score}分
            </div>
            <div class="result-analysis">
                <h4>答题分析</h4>
                <ul>
                    ${result.analysis.map(item => `
                        <li>
                            <span class="question-title">${item.question}</span>
                            <span class="answer-status ${item.correct ? 'correct' : 'wrong'}">
                                ${item.correct ? '✓' : '✗'}
                            </span>
                            <p class="answer-explanation">${item.explanation}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <button class="btn-restart">重新测试</button>
        </div>
    `;

    // 绑定重新测试按钮
    const restartBtn = modalBody.querySelector('.btn-restart');
    restartBtn.addEventListener('click', () => {
        showTest();
    });
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
async function mockSearchAPI(query) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        id: 'basics-1',
                        title: '防骗意识培养',
                        excerpt: '培养防骗意识是预防诈骗的第一道防线...',
                        type: '防骗基础',
                        date: '2024-03-20'
                    }
                    // 可以添加更多模拟数��
                ]
            });
        }, 500);
    });
}

async function mockGetTestQuestions() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: [
                    {
                        type: '基础知识',
                        title: '接到陌生电话自称是公检法人员，以下做法正确的是？',
                        options: [
                            '立即按照对方要求操作',
                            '告知对方个人信息以配合调查',
                            '挂断电话，通过官方渠道核实',
                            '先转账以示清白'
                        ]
                    }
                    // 可以添加更多模拟题目
                ]
            });
        }, 500);
    });
}

async function mockSubmitTest(answers) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    score: 80,
                    analysis: [
                        {
                            question: '接到陌生电话自称是公检法人员，以下做法正确的是？',
                            correct: true,
                            explanation: '正确答案是"挂断电话，通过官方渠道核实"。公检法机关不会通过电话要求转账。'
                        }
                        // 可以添加更多模拟分析
                    ]
                }
            });
        }, 500);
    });
} 