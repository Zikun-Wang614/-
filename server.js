// 引入课程要求的核心模块
const express = require('express');
const fs = require('fs'); // 文件操作模块（操作JSON数据）
const path = require('path'); // 路径处理模块
const app = express();
const port = 3000; // 服务端口（与前端baseUrl一致，不可修改）

// -------------- 基础配置（必加，否则前后端无法交互）--------------
// 1. 跨域配置：允许前端跨域请求（课程要求，否则报错）
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有前端域名访问
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 允许的请求方法
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头
    next(); // 继续执行后续逻辑
});

// 2. 解析JSON请求体：让后台能获取前端提交的JSON数据（POST/PUT接口必用）
app.use(express.json());

// -------------- 数据存储配置（JSON文件，无需数据库）--------------
// 留言数据存储文件路径（自动生成message.json，存于backend文件夹）
const messageFilePath = path.join(__dirname, 'message.json');

// 工具函数1：读取JSON文件中的留言数据
function readAllMessages() {
    // 如果文件不存在，创建空文件并返回空数组
    if (!fs.existsSync(messageFilePath)) {
        fs.writeFileSync(messageFilePath, '[]', 'utf8');
        return [];
    }
    // 读取文件并解析为JSON格式
    const fileContent = fs.readFileSync(messageFilePath, 'utf8');
    return JSON.parse(fileContent);
}

// 工具函数2：将留言数据写入JSON文件
function writeAllMessages(messages) {
    fs.writeFileSync(messageFilePath, JSON.stringify(messages, null, 2), 'utf8');
}

// -------------- 核心接口（与前端JS调用完全对应）--------------
/**
 * 接口1：GET /api/getMessage
 * 功能：获取所有留言（首页列表+后台列表共用）
 */
app.get('/api/getMessage', (req, res) => {
    try {
        const messages = readAllMessages();
        res.json({ code: 200, data: messages, msg: '获取留言成功' });
    } catch (error) {
        res.json({ code: 500, msg: '获取失败：' + error.message });
    }
});

/**
 * 接口2：GET /api/getMessageById
 * 功能：根据ID获取单条留言（后台编辑功能用）
 */
app.get('/api/getMessageById', (req, res) => {
    try {
        const { id } = req.query; // 从请求参数中获取留言ID
        const messages = readAllMessages();
        // 查找对应ID的留言（注意：ID是时间戳字符串，需转成数字对比）
        const targetMessage = messages.find(msg => String(msg.id) === id);
        
        if (targetMessage) {
            res.json({ code: 200, data: targetMessage, msg: '获取成功' });
        } else {
            res.json({ code: 404, msg: '留言不存在' });
        }
    } catch (error) {
        res.json({ code: 500, msg: '获取失败：' + error.message });
    }
});

/**
 * 接口3：POST /api/submitMessage
 * 功能：提交新留言（首页提交功能用）
 */
app.post('/api/submitMessage', (req, res) => {
    try {
        // 获取前端提交的留言数据（用户名、手机号、内容）
        const { username, phone, content } = req.body;
        
        // 构建新留言对象（ID用时间戳，确保唯一）
        const newMessage = {
            id: Date.now(), // 时间戳（毫秒级，唯一标识）
            username: username.trim(),
            phone: phone.trim() || '', // 手机号可选，为空则存空字符串
            content: content.trim(),
            createTime: new Date().toLocaleString() // 本地时间（备用）
        };

        // 读取原有留言，添加新留言，重新写入文件
        const messages = readAllMessages();
        messages.push(newMessage);
        writeAllMessages(messages);

        res.json({ code: 200, msg: '留言提交成功' });
    } catch (error) {
        res.json({ code: 500, msg: '提交失败：' + error.message });
    }
});

/**
 * 接口4：PUT /api/updateMessage
 * 功能：更新留言（后台编辑功能用）
 */
app.put('/api/updateMessage', (req, res) => {
    try {
        // 获取前端提交的更新数据（ID、新用户名、新手机号、新内容）
        const { id, username, phone, content } = req.body;
        
        const messages = readAllMessages();
        // 找到要更新的留言索引
        const targetIndex = messages.findIndex(msg => String(msg.id) === id);
        
        if (targetIndex === -1) {
            res.json({ code: 404, msg: '留言不存在' });
            return;
        }

        // 更新留言数据
        messages[targetIndex] = {
            ...messages[targetIndex], // 保留原有其他字段（如createTime）
            username: username.trim(),
            phone: phone.trim() || '',
            content: content.trim()
        };

        writeAllMessages(messages);
        res.json({ code: 200, msg: '留言修改成功' });
    } catch (error) {
        res.json({ code: 500, msg: '修改失败：' + error.message });
    }
});

/**
 * 接口5：DELETE /api/deleteMessage
 * 功能：删除留言（后台删除功能用）
 */
app.delete('/api/deleteMessage', (req, res) => {
    try {
        const { id } = req.query; // 从请求参数中获取要删除的留言ID
        let messages = readAllMessages();
        
        // 过滤掉要删除的留言（保留其他留言）
        const newMessages = messages.filter(msg => String(msg.id) !== id);
        
        if (messages.length === newMessages.length) {
            res.json({ code: 404, msg: '留言不存在' });
            return;
        }

        writeAllMessages(newMessages);
        res.json({ code: 200, msg: '留言删除成功' });
    } catch (error) {
        res.json({ code: 500, msg: '删除失败：' + error.message });
    }
});

// -------------- 启动服务（课程要求，固定端口3000）--------------
app.listen(port, () => {
    console.log(`✅ 后台服务已启动！访问地址：http://localhost:${port}`);
    console.log(`📌 接口测试：打开浏览器访问 http://localhost:${port}/api/getMessage 可查看留言数据`);
});
