(function () {
    if (!console.ilog) {
        console.ilog = function (...args) {
            if (args.length === 0) {
                throw new Error('参数错误');
            }
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
            const coloredTime = `\x1b[32m${timeStr}\x1b[0m`; // 绿色
            const text = args[0];
            const coloredText = `\x1b[37m${text}\x1b[0m`;
            if (args.length > 1) {
                console.log(`${coloredTime}  |  ${coloredText}`, ...args.slice(1));
            } else {
                console.log(`${coloredTime}  |  ${coloredText}`);
            }
        }
    }
    if (!console.ierror) {
        console.ierror = function (...args) {
            if (args.length === 0) {
                throw new Error('参数错误');
            }
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
            const coloredTime = `\x1b[32m${timeStr}\x1b[0m`; // 绿色
            const text = args[0];
            const coloredText = `\x1b[31m${text}\x1b[0m`; // 红色
            if (args.length > 1) {
                console.log(`${coloredTime}  |  ${coloredText}`, ...args.slice(1));
            } else {
                console.log(`${coloredTime}  |  ${coloredText}`);
            }
        }
    }
})();