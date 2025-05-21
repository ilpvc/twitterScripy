import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTweetInfo } from '../utils/twitter.js';
import { insertTweets } from './dbService.js';

export async function getTw(userId) {
    try {
        // const browser = await puppeteer.connect({
        //     browserWSEndpoint: 'ws://localhost:9222/devtools/browser/eb178618-a2fe-4a54-96cd-ab9e7600bb6c',
        //     defaultViewport: null
        // });
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: 'C:\\temp\\chrome-debug'
        });

        const page = await browser.newPage();
        let content = '';
        let contentIds = [];
        let max = '';
        let resultContent = [];

        page.on('response', async (response) => {
            const status = response.status();
            if (status >= 300 && status < 400) {
                console.log(`重定向响应，跳过获取内容: ${response.url()}`);
                return;
            }

            const url = response.url();
            if (url.includes('UserTweets')) {
                const json = await response.json();
                console.log('JSON 响应:', json.data.user.result);
                const instruction = json.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                content = instruction ? instruction.entries : [];

                content.forEach(element => {
                    contentIds.push(element.entryId.split('-')[1]);
                });

                max = contentIds.reduce((a, b) => a.length > b.length || (a.length === b.length && a > b) ? a : b);
                resultContent = extractTweetInfo(content);
                await insertTweets(resultContent);
                console.log('max', max);
            }
        });

        await page.goto(`https://x.com/${userId}`);
        await page.setViewport({ width: 1080, height: 1024 });

        await new Promise((resolve) => {
            setTimeout(async () => {
                await page.close();
                resolve();
            }, 10000);
        });

        console.log('content数量：', content.length);
        await browser.close();
        return resultContent;
    } catch (e) {
        console.log(e);
        throw e;
    }
}



export async function getTwDetail(userId, tweetId) {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: 'C:\\temp\\chrome-debug'
        });

        const page = await browser.newPage();
        await page.goto(`https://x.com/${userId}/status/${tweetId}`);
        // await page.setViewport({ width: 1080, height: 1024 });
        await page.waitForSelector('article[data-testid="tweet"]');
        // await new Promise((resolve) => {
        //     setTimeout(async () => {
        //         await page.close();
        //         resolve();
        //     }, 3000);
        // });
        const article = await page.$('article[data-testid="tweet"]');
        console.log('article', article);
        if (article) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            // const __dirname = new URL(import.meta.url).pathname;
            console.log('__dirname', __dirname);
            const screenshotPath = path.join(__dirname, '../images', `${userId}_${tweetId}.png`);
            console.log('screenshotPath', screenshotPath);
            await article.screenshot({ path: screenshotPath });
            console.log(`截图已保存到: ${screenshotPath}`);
        }


        await browser.close();
    } catch (e) {
        console.log(e);
        throw e;
    }
}