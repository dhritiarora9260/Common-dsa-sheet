let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");

let args = minimist(process.argv);


let configjson = fs.readFileSync(args.source,"utf-8");
let configjso = JSON.parse(configjson);

async function run(){
    let browser = await puppeteer.launch({headless:false,
    args:[
        '--start-maximized'
    ],defaultViewport:null});

    let pages = await browser.pages();
    let page = pages[0];
    await page.goto(args.url);


    //click on the first login
    await page.waitForSelector("a[href='https://www.hackerrank.com/access-account/']");
    await page.click("a[href='https://www.hackerrank.com/access-account/']");

    await page.waitForNavigation(1000)

    //click on the second login
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");
    
    // await page.waitForNavigation(4000);

    //filing username
    await page.waitForSelector("input[name='username']");
    // await page.click("input[name='username']");
    await page.type("input[name='username']",configjso.userid,{delay:10});

    //filling password
    await page.waitForSelector("input[placeholder='Your password']");
    // await page.click("input[name='password']");
    await page.type("input[placeholder='Your password']",configjso.password,{delay:10});

    //clicking on third login
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    //clicking on compete
    await page.waitForSelector("a.nav-link.contests");
    await page.click("a.nav-link.contests");

    //clicking on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

   async function MakeModerator(ctab,fullUrl){
    await ctab.goto(fullUrl);
    await page.waitForTimeout(1000);
     //clicking on moderator on nav-bar
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");
    await ctab.waitForTimeout(1000);
    //filling the id of the moderator
    await ctab.waitForSelector("input#moderator");
    await ctab.type("input#moderator",configjso.moderatorid,{delay:10});
    await ctab.keyboard.press("Enter");
   }


    //getting the urls of all the contests
    await page.waitForSelector("a.backbone.block-center");
    let ContestUrls =  await page.$$eval("a.backbone.block-center",function(AllContesttags){
        let urls=[];
        for(let i=0;i<AllContesttags.length;i++){
            let url = AllContesttags[i].getAttribute('href');
            urls.push(url);
        }
        return urls;
    });

   
    //opening the contests urls in seperate tabs

    for(let i=0;i<ContestUrls.length;i++){
        let curl = ContestUrls[i];
        let ctab = await browser.newPage();
        await ctab.bringToFront();
       await MakeModerator(ctab,args.url+curl);
        await ctab.close();
        await page.waitForTimeout(1000);
    }


    await browser.close();
}

run();

// node AutomationScript.js --source=configuration.json --url=https://www.hackerrank.com
