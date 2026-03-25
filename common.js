// 全局变量：后台接口基础地址（所有页面共用，修改时仅需改此处）
const baseUrl = 'http://localhost:3000/api';

// 页面加载完成后执行公共逻辑
window.onload = function() {
    // 通用：关闭所有模态框（点击关闭按钮）
    const closeModalBtns = document.querySelectorAll('.close-modal');
    if (closeModalBtns.length > 0) {
        closeModalBtns.forEach(btn => {
            btn.onclick = function() {
                // 找到当前按钮所在的模态框，隐藏它
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            };
        });
    }

    // 通用：点击模态框遮罩层关闭弹窗
    const modalMasks = document.querySelectorAll('.modal-mask');
    if (modalMasks.length > 0) {
        modalMasks.forEach(mask => {
            mask.onclick = function() {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            };
        });
    }
};

// 通用：格式化时间（首页留言列表+后台管理页共用，将时间戳转为标准格式）
function formatTime(timestamp) {
    const date = new Date(timestamp);
    // 补零函数：确保数字为两位数（如1→01）
    const padZero = num => num.toString().padStart(2, '0');
    // 格式：年-月-日 时:分:秒
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}
