// logger.js
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';

const logRoot = path.join(process.cwd(), 'logs');
const accessLogDir = path.join(logRoot, 'access');
const errorLogDir = path.join(logRoot, 'error');

// 确保目录存在
fs.mkdirSync(accessLogDir, { recursive: true });
fs.mkdirSync(errorLogDir, { recursive: true });

// 创建 access.log 流（按天分文件）
const accessLogStream = rfs.createStream((time) => {
    if (!time) return 'access.log';
    const date = time.toISOString().slice(0, 10);
    return `${date}.log`;
}, {
    interval: '1d',
    path: accessLogDir,
    compress: 'gzip'
});

// 创建 error.log 流（按天分文件）
const errorLogStream = rfs.createStream((time) => {
    if (!time) return 'error.log';
    const date = time.toISOString().slice(0, 10);
    return `${date}-error.log`;
}, {
    interval: '1d',
    path: errorLogDir,
    compress: 'gzip'
});

// // 替换 console.error（可选）
// const originalConsoleError = console.error;
// console.error = (...args) => {
//     errorLogStream.write(`[${new Date().toISOString()}] ` + args.join(' ') + '\n');
//     originalConsoleError(...args);
// };

export const loggerMiddleware = morgan('combined', { stream: accessLogStream });
export const errorLogStreamInstance = errorLogStream;
