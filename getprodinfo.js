const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

async function getData(url, page) {
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url);

  const h1 = await page.$eval('.product_main h1', h1 => h1.textContent);
  const price = await page.$eval('.price_color', price => price.textContent);
  const instock = await page.$eval('.instock.availability', instock => instock.innerText);

  return {
    title: h1,
    price: price,
    instock: instock
  }
};

async function goGetter() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto('http://books.toscrape.com/');

  const links = await page.$$eval('.product_pod .image_container a', allAs => allAs.map(a => a.href));

  await browser.close();
  return links;
}

async function indexFunc() {
  const allLinks = await goGetter();
  // console.log(allLinks)
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const scrapedData = [];

  for (let link of allLinks) {
    const data = await getData(link, page)
    const secondToWait = (Math.floor(Math.random() * 4) + 1) * 1000;
    await page.waitFor(secondToWait);
    scrapedData.push(data);
  }

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(scrapedData);
  xlsx.utils.book_append_sheet(workbook,worksheet);
  xlsx.writeFile(workbook, 'books.xlsx');

   await browser.close();
}

indexFunc();