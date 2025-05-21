import puppeteer from 'puppeteer';
import { extractTweetInfo } from '../utils/twitter.js';
import { insertTweets } from './dbService.js';

export async function getTw(userId) {
    try {
        const browser = await puppeteer.connect({
            browserWSEndpoint: 'ws://localhost:9222/devtools/browser/eb178618-a2fe-4a54-96cd-ab9e7600bb6c', 
            defaultViewport: null
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
        
        console.log('content', content);
        return resultContent;
    } catch (e) {
        console.log(e);
        throw e;
    }
}