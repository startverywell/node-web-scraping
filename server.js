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
    let results = await getResult(req.body.search);
    

    value1 = [].concat(...results.value1);
    value2 = [].concat(...results.value2);
    value3 = [].concat(...results.value3);

    console.log({results});
    res.render('pages/search', {value1, value2, value3});
});


app.listen(8081);
console.log('8081 is the magic port');
//------------------------------------------------------------------------------------------------

const getResult = async (search) => {
    let searchs = search.split(',');
    let value1 = [];
    let value2 = [];
    let value3 = [];
    let value4 = [];

    await Promise.all(searchs.map(async (search) => {
        const trimmedSearch = search.trim();
        const type = trimmedSearch.split('-')[0];
        const sku = trimmedSearch.split('-')[1];

        let results;
        switch (type) {
            case 'GC':
                results = await getGivensandcompany(sku);
                value1.push(results);
                break;
            case 'WC':
                results = await getWinecountrygiftbaskets(sku);
                value2.push(results);
                break;
            case 'GGB':
                results = await getGourmetgiftbaskets(sku);
                value3.push(results);
                break;
            case 'CPB':
                results = await getCapalbosAll(sku);
                value4.push(results);
                break;
            default:
                break;
        }
    }));

    return { value1, value2, value3, value4 };
}

//------------------------------------------------------------------------------------------------

const getQuotes = async (search) => {
    const browser = await puppeteer.launch({
        headless: true,
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
            const link = quote.querySelector(".sil_d4M").href;
            return { link };
        });
    });
  
    await browser.close();
    return quotes;
};

const getProduct = async (link,search) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(1000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let titleObj = document.querySelector("._2qrJF");
        if (titleObj) {
            let title = document.querySelector("._2qrJF").innerText ?? "";
            let sku = document.querySelector("._1rwRc").innerText ?? "";
            let price = (document.querySelector("._26qxh > span").innerText.split("$")[1]) * 0.8;
            let discription = document.querySelector(".WncCi > p").innerText ?? "";

            price = Math.round(price * 100) / 100;
            return { title, sku, price, discription };
        } else {
            return null;
        }
    });
  
    await browser.close();
    return quotes ?? {sku:search,title:'no product found'};
}

const getGivensandcompany = async (search) => {
    let products = await getQuotes(search);
    console.log(products);
    let total = new Array(products.length);
    for (let product of Array.from(products)) {
        // Assuming getProduct() returns a Promise
        let productData = await getProduct(product.link, search);
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
        let productData = await getGourmetgift(product.link, search);
        console.log(productData);
        total.push(productData);
    }
    return total;
}


const getGourmetgifts = async (search) => {
    const browser = await puppeteer.launch({
        headless: true,
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
            const link = quote.href;
            return { link };
        });
    });
  
    await browser.close();
    return quotes;
}

const getGourmetgift = async (link, search) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(1000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let titleObj = document.querySelector("span#ctl00_MainContentHolder_lblName");

        if(titleObj) {
            let title = document.querySelector("span#ctl00_MainContentHolder_lblName").innerText ?? "";
            let sku = document.querySelector("span#ctl00_MainContentHolder_lblSku").innerText ?? "";
            let price = (document.querySelector("span#ctl00_MainContentHolder_lblSitePrice").innerText.split("$")[1]) * 0.75;;
            let discription = document.querySelector("span#ctl00_MainContentHolder_lblDescription").innerText ?? "";
            
            price = Math.round(price * 100) / 100;
            return { title, sku, price, discription };
        } else 
            return null;
    });
  
    await browser.close();
    return quotes ?? {sku:search,title:'no product found'};
}

//------------------------------------------------------------------------------------------------

const getWinecountrygiftbaskets = async (search) => {
    
    let total = [];
    let productData = await getWineGift(search);
    console.log(productData);
    total.push(productData);

    return total;
}

const getWineGift = async (search) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });

    let link = `https://www.winecountrygiftbaskets.com/gift-baskets/organic-deluxe-fruit-collection-gift-baskets/${search}?formskw=${search}&ts=y`;
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(10000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let titleObj = document.querySelector("div#desc>h1");
        if (titleObj) {
            let title = titleObj.innerText ?? "";
            let sku = document.querySelector("div.fcwcgrey.fssmall.align_right").innerText ?? "";
            let price = (document.querySelector("div.p_price>div.ftfDosisB").innerText.split("$")[1]) * 0.75;
            let discription = document.querySelector("div#up_desc").innerText ?? "";

            price = Math.round(price * 100) / 100;
            return { title, sku, price, discription };
        } else {
            return null;
        }
        
    });
  
    await browser.close();
    return quotes ?? {sku:search,title:'no product found'};
}

//------------------------https://www.capalbosonline.com/search?keywords=search-----------------------------


const getCapalbosAll = async (search) => {
    let products = await getCapalbos(search);
    console.log(products);
    let total = new Array(products.length);
    for (let product of Array.from(products)) {
        // Assuming getProduct() returns a Promise
        let productData = await getCapalbosProduct(product.link, search);
        console.log(productData);
        total.push(productData);
    }
    return total;
}

const getCapalbos = async (search) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(10000000);
    await page.goto(`https://www.capalbosonline.com/search?keywords=${search}`, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        const quoteList = document.querySelectorAll("div.product-item");
  
        return Array.from(quoteList).map((quote) => {
            const link = quote.querySelector("a").href;
            return { link };
        });
    });
  
    await browser.close();
    return quotes;
}

const getCapalbosProduct = async (link,search) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
    });
  
    const page = await browser.newPage();
  
    page.setDefaultTimeout(1000000);
    await page.goto(link, {
        waitUntil: "domcontentloaded",
    });
  
    const quotes = await page.evaluate(() => {
        let titleObj = document.querySelector("span#ctl00_MainContentHolder_lblName");

        if(titleObj) {
            let title = document.querySelector("span#ctl00_MainContentHolder_lblName").innerText ?? "";
            let sku = document.querySelector("span#ctl00_MainContentHolder_lblSku").innerText ?? "";
            let price = (document.querySelector("span#ctl00_MainContentHolder_lblSitePrice").innerText.split("$")[1]) * 0.75;;
            let discription = document.querySelector("span#ctl00_MainContentHolder_lblDescription").innerText ?? "";
            
            price = Math.round(price * 100) / 100;
            return { title, sku, price, discription };
        } else 
            return null;
    });
  
    await browser.close();
    return quotes ?? {sku:search,title:'no product found'};
}