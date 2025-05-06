// uclaScraper.js
const fs = require('fs');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { URL } = require('url');
const re = require('re');

// helpers
async function waitFor(driver, css, timeout = 10000) {
  await driver.wait(until.elementLocated(By.css(css)), timeout);
  return driver.findElement(By.css(css));
}

async function parseNutrition(driver) {
  const data = {};
  // single-column table
  const singleRows = await driver.findElements(
    By.css('table.nutritive-table:not(.nutritive-table-two-column) tbody tr')
  );
  for (const tr of singleRows) {
    const tds = await tr.findElements(By.css('td'));
    if (tds.length !== 2) continue;
    const label  = (await tds[0].findElement(By.css('span')).getText()).trim();
    const amt    = (await tds[0].getText()).replace(label, '').trim();
    const dv     = (await tds[1].getText()).trim() || null;
    data[label] = { amount: amt, dv };
  }
  // two-column table
  const twoRows = await driver.findElements(
    By.css('table.nutritive-table-two-column tr')
  );
  for (const tr of twoRows) {
    const texts = await Promise.all(
      (await tr.findElements(By.css('td'))).map(td => td.getText())
    );
    for (let i = 0; i + 1 < texts.length; i += 2) {
      const left = texts[i].trim();
      const dv   = texts[i+1].trim() || null;
      const m    = left.match(/(.+?)(\d.*)/);
      if (m) {
        const nut = m[1].trim();
        const amt = m[2].trim();
        data[nut] = { amount: amt, dv };
      }
    }
  }
  return data;
}

async function collectUrlsByHeader(driver, periodUpper) {
  let hdr;
  try {
    hdr = await driver.findElement(
      By.xpath(
        `//h2[translate(normalize-space(),` +
        `'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')` +
        `='${periodUpper}']`
      )
    );
  } catch {
    return [];
  }
  let container;
  try {
    container = await hdr.findElement(
      By.xpath(`./ancestor::div[contains(@class,'cat-heading-box')]`)
    );
  } catch {
    container = hdr;
  }
  const urls = [];
  const sibs = await container.findElements(By.xpath('following-sibling::*'));
  for (const sib of sibs) {
    const cls = (await sib.getAttribute('class')) || '';
    if (cls.includes('cat-heading-box')) break;
    for (const a of await sib.findElements(By.css('a.recipe-detail-link'))) {
      const href = await a.getAttribute('href');
      if (href && !urls.includes(href)) urls.push(href);
    }
  }
  return urls;
}

async function collectUrlsByNav(driver, navId) {
  let nav;
  try {
    nav = await driver.findElement(By.id(navId));
  } catch {
    return [];
  }
  const anchors = await nav.findElements(By.css('a.recipe-detail-link'));
  return Promise.all(anchors.map(a => a.getAttribute('href')));
}

// config
const baseURL = 'https://dining.ucla.edu/';
const halls = {
  'Bruin Plate':            'bruin-plate/',
  'De Neve Dining':         'de-neve-dining/',
  'Epicuria at Covel':      'epicuria-at-covel/',
  'Spice Kitchen at Feast': 'spice-kitchen/',
};
const PERIOD_NAV_IDS = {
  breakfast: 'breakfast-anchor-links',
  lunch:     'lunch-anchor-links',
  dinner:    'dinner-anchor-links',
};

// main IIFE
(async function main() {
  // set Chrome headless properly
  const options = new chrome.Options()
    .addArguments('--headless')
    .addArguments('--disable-gpu');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const results = [];
  try {
    for (const [hall, ext] of Object.entries(halls)) {
      console.log(`\n=== ${hall} ===`);
      await driver.get(new URL(ext, baseURL).href);
      await waitFor(driver, 'h2');

      // gather URLs per period
      const periodToUrls = {};
      for (const [period, navId] of Object.entries(PERIOD_NAV_IDS)) {
        let urls = await collectUrlsByHeader(driver, period.toUpperCase());
        if (!urls.length) urls = await collectUrlsByNav(driver, navId);
        if (urls.length) {
          periodToUrls[period] = urls;
          console.log(`  ${period}: ${urls.length} recipes`);
        }
      }

      // scrape each recipe
      for (const [period, urls] of Object.entries(periodToUrls)) {
        for (const link of urls) {
          await driver.get(link);
          await driver.sleep(300);

          const dish = await (await waitFor(driver, 'h2.single-name')).getText();

          let allergens = [];
          try {
            const raw = await driver
              .findElement(By.css('ul.nolispace li strong'))
              .getText();
            allergens = raw
              .replace(/[()]/g, '')
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
          } catch {}

          const nutrition = await parseNutrition(driver);

          results.push({
            dining_hall: hall,
            meal_period: period,
            url:         link,
            name:        dish,
            allergens,
            nutrition,
          });

          await driver.navigate().back();
          await waitFor(driver, 'h2');
        }
      }
    }
  } finally {
    await driver.quit();
  }

  fs.writeFileSync(
    'ucla_dining_info.json',
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log(`\nDone! Scraped ${results.length} recipes total.`);
})();  
