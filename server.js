// load the things we need
var puppeteer = require("puppeteer");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('pages/index');
});

app.post('/search', async function(req, res) {
    let search = req.body.search;
    let value1 = await getGivensandcompany(search);
    let value3 = await getGourmetgiftbaskets(search);
    let value2 = await getWinecountrygiftbaskets(search);
    res.render('pages/search', {value1, value2, value3});
});


app.listen(8080);
console.log('8080 is the magic port');
//------------------------------------------------------------------------------------------------

const getQuotes = async (search) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
    page.setDefaultTimeout(1000000);
  
    await page.goto(`https://www.givensandcompany.com/search-results?q=${search}`, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll(".sERPSMg");
  
        return Array.from(quoteList).map((quote) => {
            const title = quote.querySelector(".sil_d4M").innerText;
            const link = quote.querySelector(".sil_d4M").href;
            return { title, link };
        });
    });
  
    await browser.close();
    return quotes;
};

const getProduct = async (link) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(1000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let title = document.querySelector("._2qrJF").innerText;
        let sku = document.querySelector("._1rwRc").innerText;
        let price = document.querySelector("._26qxh > span").innerText;
        let discription = document.querySelector(".WncCi > p").innerText;
        return { title, sku, price, discription };
    });
  
    await browser.close();
    return quotes;
}

const getGivensandcompany = async (search) => {
    let products = await getQuotes(search);
    console.log(products);
    let total = new Array(products.length);
    for (let product of Array.from(products)) {
        // Assuming getProduct() returns a Promise
        let productData = await getProduct(product.link);
        console.log(productData);
        total.push(productData);
    }

    return total;
}

//------------------------------------------------------------------------------------------------

const getGourmetgiftbaskets = async (search) => {
    let products = await getGourmetgifts(search);
    console.log(products);
    let total = new Array(products.length);
    for (let product of Array.from(products)) {
        // Assuming getProduct() returns a Promise
        let productData = await getGourmetgift(product.link);
        console.log(productData);
        total.push(productData);
    }

    return total;
}


const getGourmetgifts = async (search) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();

    page.setDefaultTimeout(1000000);
  
    await page.goto(`https://www.gourmetgiftbaskets.com/search.aspx?keyword=${search}`, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("div.SingleProductDisplayName.recordname>a");
  
        return Array.from(quoteList).map((quote) => {
            const title = quote.innerText;
            const link = quote.href;
            return { title, link };
        });
    });
  
    await browser.close();
    return quotes;
}

const getGourmetgift = async (link) => {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(1000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let title = document.querySelector("span#ctl00_MainContentHolder_lblName").innerText;
        let sku = document.querySelector("span#ctl00_MainContentHolder_lblSku").innerText;
        let price = document.querySelector("span#ctl00_MainContentHolder_lblSitePrice").innerText;
        let discription = document.querySelector("span#ctl00_MainContentHolder_lblDescription").innerText;
        return { title, sku, price, discription };
    });
  
    await browser.close();
    return quotes;
}

//------------------------------------------------------------------------------------------------
const getWinecountrygiftbaskets = async (search) => {
    let products = await getWineGifts(search);
    console.log(products);
    let total = new Array(products.length);
    for (let product of Array.from(products)) {
        // Assuming getProduct() returns a Promise
        let productData = await getWineGift(product.link);
        console.log(productData);
        total.push(productData);
    }

    return total;
}

const getWineGifts = async (search) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(1000000);

    // Go to the desired webpage
    await page.goto('https://www.winecountrygiftbaskets.com/');
    console.log('input');
    // Fill in the form fields
    await page.type('#header-bar-left-search-input', search);

    await page.evaluate(() => {
        const form = document.querySelector('#main_search');
        form.method = 'POST';
        form.action = 'https://www.winecountrygiftbaskets.com/product/giftbasketsearch';
        form.submit();
    });
    console.log('submit');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll(".productDetailLink1");
  
        return Array.from(quoteList).map((quote) => {
            const title = quote.getAttribute('aria-label');
            const link = quote.href;
            return { title, link };
        });
    });
  
    await browser.close();
    return quotes;
}

const getWineGift = async (link) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(10000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let title = document.querySelector("h1#desc").innerText;
        let sku = document.querySelector("div.fcwcgrey.fssmall.align_right").innerText;
        let price = document.querySelector("div.p_price>div.ftfDosisB").innerText;
        let discription = document.querySelector("div#up_desc").innerText;
        return { title, sku, price, discription };
    });
  
    await browser.close();
    return quotes;
}