import {isDev} from "../utils/appUtil.js";

export default function addIsDevField(req, res, next) {
    const originalJson = res.json;

    res.json = function (data) {
        // 如果 data 是对象，我们才注入字段
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            data.isDev = isDev();
        }
        return originalJson.call(this, data);
    };

    next();
}