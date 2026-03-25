// 页面加载完成后执行后台核心逻辑
window.onload = function() {
    // 获取DOM元素（与后台HTML类名/ID严格对应）
    const adminTableBody = document.querySelector('#adminTable tbody');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const editForm = document.getElementById('editForm');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const cancelDeleteBtn = document.getElementById('cancelDelete');

    let currentMessageId = ''; // 存储当前操作（编辑/删除）的留言ID

    // 初始化：加载后台留言列表
    loadAdminMessageList();

    // 1. 表格点击事件：编辑/删除按钮触发
    adminTableBody.onclick = function(e) {
        // 点击编辑按钮
        if (e.target.classList.contains('edit-btn')) {
            currentMessageId = e.target.dataset.id; // 获取留言ID（从HTML data-id属性）
            loadMessageById(currentMessageId); // 加载单条留言数据到编辑模态框
            editModal.style.display = 'block'; // 显示编辑模态框
        }

        // 点击删除按钮
        if (e.target.classList.contains('delete-btn')) {
            currentMessageId = e.target.dataset.id;
            deleteModal.style.display = 'block'; // 显示删除确认模态框
        }
    };

    // 2. 关闭编辑模态框
    closeEditModal.onclick = function() {
        editModal.style.display = 'none';
        editForm.reset(); // 重置表单，清空输入
    };

    // 3. 关闭删除模态框
    closeDeleteModal.onclick = function() {
        deleteModal.style.display = 'none';
    };

    // 4. 取消删除
    cancelDeleteBtn.onclick = function() {
        deleteModal.style.display = 'none';
    };

    // 5. 编辑表单提交：更新留言（调用PUT接口）
    editForm.onsubmit = function(e) {
        e.preventDefault(); // 阻止默认刷新

        // 获取编辑表单数据
        const username = document.getElementById('editUsername').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const content = document.getElementById('editContent').value.trim();

        // 简单验证（非空）
        if (!username || !content) {
            alert('用户名和留言内容不能为空！');
            return;
        }

        // 调用更新接口
        updateMessage({
            id: currentMessageId,
            username,
            phone,
            content
        });
    };

    // 6. 确认删除：调用DELETE接口
    confirmDeleteBtn.onclick = function() {
        deleteMessage(currentMessageId);
    };

    // 核心函数1：加载后台留言列表（调用GET接口）
    function loadAdminMessageList() {
        fetch(`${baseUrl}/getMessage`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                const messages = result.data;
                adminTableBody.innerHTML = ''; // 清空表格

                if (messages.length > 0) {
                    // 动态生成表格行
                    messages.forEach(item => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${item.id}</td>
                            <td>${item.username}</td>
                            <td>${item.phone || '无'}</td>
                            <td>${item.content}</td>
                            <td>${formatTime(item.id)}</td> <!-- 引用公共JS的时间格式化函数 -->
                            <td>
                                <button class="btn edit-btn" data-id="${item.id}">编辑</button>
                                <button class="btn delete-btn" data-id="${item.id}">删除</button>
                            </td>
                        `;
                        adminTableBody.appendChild(tr);
                    });
                } else {
                    // 无数据时显示提示行
                    const emptyTr = document.createElement('tr');
                    emptyTr.innerHTML = '<td colspan="6" style="color: #666; padding: 20px;">暂无留言数据</td>';
                    adminTableBody.appendChild(emptyTr);
                }
            }
        })
        .catch(error => {
            console.log('加载留言列表失败：', error);
            adminTableBody.innerHTML = '<td colspan="6" style="color: #ff4d4f; padding: 20px;">加载失败，请稍后重试</td>';
        });
    }

    // 核心函数2：根据ID加载单条留言（编辑用，调用GET接口）
    function loadMessageById(id) {
        fetch(`${baseUrl}/getMessageById?id=${id}`)
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                const message = result.data;
                // 填充编辑表单
                document.getElementById('editId').value = message.id;
                document.getElementById('editUsername').value = message.username;
                document.getElementById('editPhone').value = message.phone || '';
                document.getElementById('editContent').value = message.content;
            } else {
                alert('获取留言数据失败！');
                editModal.style.display = 'none';
            }
        })
        .catch(error => {
            console.log('获取单条留言失败：', error);
            alert('网络异常，获取失败！');
        });
    }

    // 核心函数3：更新留言（调用PUT接口）
    function updateMessage(updateData) {
        fetch(`${baseUrl}/updateMessage`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('修改成功！');
                editModal.style.display = 'none';
                loadAdminMessageList(); // 刷新列表
            } else {
                alert('修改失败，请稍后重试！');
            }
        })
        .catch(error => {
            console.log('更新留言失败：', error);
            alert('网络异常，修改失败！');
        });
    }

    // 核心函数4：删除留言（调用DELETE接口）
    function deleteMessage(id) {
        fetch(`${baseUrl}/deleteMessage?id=${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('删除成功！');
                deleteModal.style.display = 'none';
                loadAdminMessageList(); // 刷新列表
            } else {
                alert('删除失败，请稍后重试！');
            }
        })
        .catch(error => {
            console.log('删除留言失败：', error);
            alert('网络异常，删除失败！');
        });
    }
};
