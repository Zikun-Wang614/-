// 页面加载完成后执行首页核心逻辑
window.onload = function() {
    // 获取DOM元素（与首页HTML类名/ID严格对应）
    const messageForm = document.getElementById('messageForm');
    const messageList = document.getElementById('messageList');
    const successModal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');
    const usernameTip = document.getElementById('usernameTip');
    const phoneTip = document.getElementById('phoneTip');
    const contentTip = document.getElementById('contentTip');

    // 初始化：页面加载完成后自动加载留言列表
    loadMessageList();

    // 1. 表单提交事件：触发表单验证+留言提交
    messageForm.onsubmit = function(e) {
        e.preventDefault(); // 阻止表单默认刷新提交，实现无刷新交互（课程要求）
        let isFormValid = true; // 表单验证状态标记

        // 获取表单输入值（去除前后空格）
        const username = document.getElementById('username').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const content = document.getElementById('content').value.trim();

        // 2. 表单验证逻辑（课程要求：非空+手机号格式）
        // 用户名非空验证
        if (username === '') {
            usernameTip.innerText = '用户名不能为空';
            isFormValid = false;
        } else {
            usernameTip.innerText = ''; // 验证通过，清空错误提示
        }

        // 手机号格式验证（可选填写，填写则需符合11位手机号规则）
        if (phone !== '' && !/^1[3-9]\d{9}$/.test(phone)) {
            phoneTip.innerText = '请输入正确的11位手机号';
            isFormValid = false;
        } else {
            phoneTip.innerText = '';
        }

        // 留言内容非空验证
        if (content === '') {
            contentTip.innerText = '留言内容不能为空';
            isFormValid = false;
        } else {
            contentTip.innerText = '';
        }

        // 3. 验证通过：调用提交留言函数
        if (isFormValid) {
            submitMessage({ username, phone, content });
        }
    };

    // 4. 关闭成功模态框：关闭后重置表单
    closeModal.onclick = function() {
        successModal.style.display = 'none';
        messageForm.reset(); // 重置表单输入框
    };

    // 5. 核心函数：提交留言（调用后台POST接口）
    function submitMessage(messageData) {
        fetch(`${baseUrl}/submitMessage`, { // 引用公共JS的baseUrl，统一接口地址
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 告诉后台提交的是JSON数据
            },
            body: JSON.stringify(messageData) // 转换数据格式
        })
        .then(response => response.json()) // 解析后台返回的JSON数据
        .then(result => {
            if (result.code === 200) { // 后台返回成功状态
                successModal.style.display = 'block'; // 显示成功模态框
                loadMessageList(); // 提交成功后刷新留言列表
            }
        })
        .catch(error => {
            console.log('留言提交失败：', error);
            alert('网络异常，提交失败，请稍后重试');
        });
    }

    // 6. 核心函数：加载留言列表（调用后台GET接口）
    function loadMessageList() {
        fetch(`${baseUrl}/getMessage`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                const messages = result.data;
                messageList.innerHTML = ''; // 清空原有列表，避免重复渲染

                // 有留言数据：动态生成留言卡片
                if (messages.length > 0) {
                    messages.forEach(item => {
                        const messageCard = document.createElement('div');
                        messageCard.className = 'message-card'; // 与CSS样式对应

                        // 拼接卡片内容（手机号可选显示）
                        messageCard.innerHTML = `
                            <div class="info">
                                <span>用户名：${item.username}</span>
                                <span>留言时间：${formatTime(item.id)}</span> <!-- 引用公共JS的格式化时间函数 -->
                            </div>
                            ${item.phone ? `<div class="info"><span>手机号：${item.phone}</span></div>` : ''}
                            <div class="content">${item.content}</div>
                        `;

                        messageList.appendChild(messageCard); // 添加卡片到列表容器
                    });
                } else {
                    // 无留言数据：显示友好提示
                    messageList.innerHTML = '<p style="text-align: center; color: #666; font-size: 16px;">暂无留言，快来抢沙发吧！</p>';
                }
            }
        })
        .catch(error => {
            console.log('留言列表加载失败：', error);
            messageList.innerHTML = '<p style="text-align: center; color: #ff4d4f; font-size: 16px;">加载失败，请稍后重试</p>';
        });
    }
};
