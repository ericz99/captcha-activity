const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// # logger 
const Logger = require('../logger');

class Instance {
    constructor(email, password, config) {
        this.email = email;
        this.password = password;
        this.proxy = config.proxy;
        this.stopActivityTime = this.setTime(new Date(), config.stopTime);

        // ## LOGGER ##
        this.logger = Logger(email);

        // ## DO NOT MODIFY ##
        this.browser = null;
        this.page = null;
        this.wordBank = ["lorem",
            "coding leetcode",
            "web scrape using puppeteer",
            "what is youtube",
            "code python",
            "youtube channel",
            "how big is a python",
            "python definition",
            "hello world"];

        // ## DEFAULT URL ##
        this.defaultUrl = "https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin";
    }

    setTime(date, minutes) {
        return new Date(date.getTime() + minutes * 60000)
    }

    async spawnInstance() {
        let args;

        if (this._proxy !== "" && this._proxy !== undefined) {
            args = [
                '--no-sandbox',
                `--proxy-server=${this._proxy}`,
                "--ignore-certificate-errors",
                "--disable-setuid-sandbox",
                '--disable-web-security'
            ]
        } else {
            args = [
                '--no-sandbox',
                "--ignore-certificate-errors",
                "--proxy-server='direct://",
                "--proxy-bypass-list=*",
                "--disable-setuid-sandbox",
                '--disable-web-security'
            ]
        }

        // # spawn browser
        this.browser = await puppeteer.launch({
            headless: true,
            args,
            ignoreHTTPSErrors: true,
            devtools: false
        });

        // Create main page
        this.page = await this.browser.newPage();
        // Close first empty page
        (await this.browser.pages())[0].close();
        // # go to page
        this.page.goto(this.defaultUrl, { waitUntil: 'networkidle2' });
        // # wait for navigation to process
        const resp = await this.waitForNavigation();

        if (resp.status() == 200) {
            // # wait for a selector
            const finalResponse = await this.page.waitForSelector("#identifierId");
            // # if selector is visible
            if (finalResponse) {
                // # login to gmail
                await this.loginGmail(true);
                this.logger.yellow("Logging into gmail!")
                // # if successful
                const resp = await this.waitForNavigation();
                if (resp.url().includes("myaccount.google.com")) {
                    this.logger.green("Successfully logged into gmail!");
                    this.logger.blue("Working on magic!");
                    // # do something
                    await this.startActivity();
                }
            }
        }
    }

    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async waitForNavigation() {
        const [resp] = await Promise.all([
            this.page.waitForNavigation({
                timeout: 30000,
                waitUntil: ['networkidle2', 'load', 'domcontentloaded']
            })
        ]);

        return resp;
    }

    // login gmail logic
    async loginGmail(loaded) {
        // fill in credential
        await this.page.type("#identifierId", this.email, { delay: 50 });
        await this.page.click("#identifierNext");
        await this.page.waitForSelector("input[type='password']", { visible: true });
        await this.page.type("input[type='password']", this.password, { delay: 50 });
        await this.page.waitForSelector("#passwordNext", { visible: true });
        await this.page.click("#passwordNext");
    }

    // # start activity
    async startActivity() {
        // # base case
        if (Date.now() > this.stopActivityTime) {
            this.logger.green("Finished activity!");
            await this.browser.close();
            return;
        }

        this.page.goto("https://www.google.com/", { waitUntil: 'networkidle2', timeout: 0 });
        const any = this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
        await this.waitForNavigation();
        await this.page.type('input.gLFyf.gsfi', any, { delay: 150 });
        this.page.keyboard.press('Enter');
        await this.waitForNavigation();
        await this.page.waitForSelector('h3.LC20lb', { timeout: 30000 });
        await this.page.evaluate(() => {
            let elements = document.querySelectorAll('h3.LC20lb')
            // "for loop" will click all element not random
            let randomIndex = Math.floor(Math.random() * elements.length) + 1
            elements[randomIndex].click();
        });

        await this.waitForNavigation();
        const isDone = await this.page.evaluate(this.autoScroll);
        await this.sleep(3000);
        await this.startActivity();
    }

    async autoScroll() {
        await new Promise(resolve => {
            const distance = 100;
            const delay = 100;
            const timer = setInterval(() => {
                document.scrollingElement.scrollBy(0, distance);
                if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
                    clearInterval(timer);
                    resolve(true);
                }
            }, delay);
        });
    }
}

module.exports = Instance;