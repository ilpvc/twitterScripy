import { uploadFile } from './s3Utils.js';
import path from 'path';
import {fileURLToPath} from "url";

export default {
    async save({ userId, tweetId, element, storageType }) {
        const saveHandlers = {
            local: async () => {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const screenshotPath = path.join(__dirname, '../images', `${userId}_${tweetId}.png`);
                await element.screenshot({ path: screenshotPath });
                console.ilog('截图保存成功', screenshotPath);
                return screenshotPath;
            },
            s3: async () => {
                const buffer = await element.screenshot({ encoding: 'binary' });
                const key = `twitter/screenshot/${userId}/${tweetId}.png`;
                const res = await uploadFile({
                    key,
                    body: buffer,
                    contentType: 'image/png'
                });
                if (res){
                    console.ilog('图片上传s3成功', key);
                }
                return key;
            }
        };

        return saveHandlers[storageType]?.();
    }
};