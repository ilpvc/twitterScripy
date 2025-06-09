import "dotenv/config"
import fs from 'fs';
import path from 'path';
import {getFileUrl, uploadFile} from "./utils/s3Utils.js";
import "./utils/iLog.js"
import {getOriginPath} from "./utils/urlUtil.js";
import {getTwDetail} from "./services/twitterService.js";

// console.log('环境变量', process.env)
export async function testUploadImage() {
    const filePath = path.resolve('./images/TrumpDailyPosts_1928996246372397291.png'); // 假设有 test.jpg 文件
    const fileBuffer = fs.readFileSync(filePath);
    const key = 'images/TrumpDailyPosts_1928996246372397291.png';
    const contentType = 'image/png';
    await uploadFile({ key, body: fileBuffer, contentType });
    console.ilog('图片上传成功', key);
    const url = await getFileUrl(key);
    console.ilog('图片下载链接', url);
}



const url = 'https://ntxfnkftiidhqgfodgwu.supabase.co/storage/v1/s3/twitter-scripy/images/TrumpDailyPosts_1928996246372397291.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-\n' +
    'Amz-Credential=bcc7d8b5a35184f4b17e646112991bc1%2F20250602%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20250602T065840Z&X-Amz-Expires=3600&X-Amz-Signature=49d6162247d89893c7d40701531929b88482041a0ceb009e09f25b5d37000e82&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject\n'

await getTwDetail('RuiHuang_art', '1931364630024323207', false)

