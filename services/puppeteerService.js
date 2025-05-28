import puppeteer from "puppeteer";

let browser = null;

export async function getBrowser() {
    if (browser) {
        return browser;
    }
    console.log('start Browser');
    browser = await puppeteer.launch({
        headless: false,
        userDataDir: 'C:\\temp\\chrome-debug'
    });
    return browser;
}


export async function closeBrowser() {
    await browser.close();
    console.log('browser closed');
}