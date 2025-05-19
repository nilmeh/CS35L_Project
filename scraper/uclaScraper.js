// Scrapes UCLA Dining menus for every dining hall & meal period.
// Captures: name, meal period, dining hall, station / concept heading,
// recipe URL, full nutrition, ingredient list, declared allergens, and logo
// tags (e.g. “Contains Wheat”, “Vegetarian”). 
// Run with:  node uclaScraper.js

const fs     = require('fs');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { URL } = require('url');

// helper: wait for an element
async function waitFor(driver, css, timeout = 20000) {
  await driver.wait(until.elementLocated(By.css(css)), timeout);
  return driver.findElement(By.css(css));
}

// helper: parse nutrition tables
async function parseNutrition(driver) {
  const data = {};

  /* single-column rows */
  for (const tr of await driver.findElements(
    By.css('table.nutritive-table:not(.nutritive-table-two-column) tbody tr')
  )) {
    const tds = await tr.findElements(By.css('td'));
    if (tds.length !== 2) continue;

    const label = (await tds[0].findElement(By.css('span')).getText()).trim();
    const amt = (await tds[0].getText()).replace(label, '').trim();
    const dv = (await tds[1].getText()).trim() || null;

    data[label] = { amount: amt, dv };
  }

  /* two-column rows */
  for (const tr of await driver.findElements(
    By.css('table.nutritive-table-two-column tr')
  )) {
    const cells = await Promise.all(
      (await tr.findElements(By.css('td'))).map(td => td.getText())
    );
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const left = cells[i].trim();
      const dv = cells[i + 1].trim() || null;
      const m = left.match(/(.+?)(\d.*)/);
      if (m) {
        data[m[1].trim()] = { amount: m[2].trim(), dv };
      }
    }
  }
  return data;
}

// helper: ingredients + allergens
async function parseIngredientsAndAllergens(driver) {
  try {
    const tabBtn = await driver.findElement(
      By.css("button[data-tab-content='ingredient_list']")
    );
    if (!(await tabBtn.getAttribute('class')).includes('tab-active')) {
      await tabBtn.click();
      await driver.sleep(250);
    }
    const div = await driver.findElement(By.css('#ingredient_list'));

    const ingredients = await Promise.all(
      (await div.findElements(By.css('ul.nolispace > li'))).map(li => li.getText())
    );

    const txt = await div.getText();
    const allergensLine = (txt.match(/Allergens\*?:\s*([^\n]+)/i) || [,''])[1];
    const allergens = allergensLine.split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return { ingredients, allergens };
  } catch {
    return { ingredients: [], allergens: [] };
  }
}

// helper: logo-tags (“Contains Wheat”, etc.) 
async function parseMetadataTags(driver) {
  const tags = [];
  for (const el of await driver.findElements(By.css('.single-metadata-item-wrapper'))) {
    const t = (await el.getText()).trim();
    if (t) tags.push(t);
  }
  return tags;
}

// helper: collect recipe links + station names for one meal period
async function collectRecipes(driver, period) {
  const blocks = await driver.findElements(
    By.css(`div.force-left-full-width[id^='${period}-']`)
  );
  const recs = [];
  const seen = new Set();

  for (const blk of blocks) {
    // station name
    let station = 'unknown';
    try {
      station = (await blk.findElement(By.css('.category-heading h2')).getText()).trim();
    } catch {
      station = (await blk.getAttribute('id'))
        .replace(`${period}-`, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    // links
    for (const a of await blk.findElements(By.css('a.recipe-detail-link'))) {
      const href = await a.getAttribute('href');
      if (href && !seen.has(href)) {
        seen.add(href);
        recs.push({ url: href, station });
      }
    }
  }
  return recs;
}

// configuration
const baseURL = 'https://dining.ucla.edu/';
const halls = {
  'Bruin Plate':            'bruin-plate/',
  'De Neve Dining':         'de-neve-dining/',
  'Epicuria at Covel':      'epicuria-at-covel/',
  'Spice Kitchen at Feast': 'spice-kitchen/',
};
const PERIODS = ['breakfast', 'lunch', 'dinner'];

// main
(async function main() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments('--headless', '--disable-gpu'))
    .build();

  const results = [];

  try {
    for (const [hall, path] of Object.entries(halls)) {
      console.log(`\n=== ${hall} ===`);
      await driver.get(new URL(path, baseURL).href);
      await waitFor(driver, '.force-left-full-width');   // page ready

      const periodToLinks = {};
      for (const p of PERIODS) {
        const recs = await collectRecipes(driver, p);
        periodToLinks[p] = recs;
        console.log(`  ${p}: ${recs.length} recipes`);
      }

      for (const [period, recs] of Object.entries(periodToLinks)) {
        for (const { url, station } of recs) {
          try {
            await driver.get(url);
            await driver.sleep(800);

            const name = await (await waitFor(driver, 'h2.single-name', 30_000)).getText();
            const nutrition = await parseNutrition(driver);
            const { ingredients, allergens }  = await parseIngredientsAndAllergens(driver);
            const tags = await parseMetadataTags(driver);

            results.push({
              dining_hall: hall,
              meal_period: period,
              station,
              url,
              name,
              ingredients,
              allergens,
              nutrition,
              tags
            });
          } catch (err) {
            console.warn(`skipped (${err.name})  ${url}`);
          } finally {
            try {
              await driver.navigate().back();
              await waitFor(driver, '.force-left-full-width', 10_000);
            } catch { /* ignore */ }
          }
        }
      }
    }
  } finally {
    await driver.quit();
  }

  fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDone! Scraped ${results.length} recipes total → results.json`);
})();
