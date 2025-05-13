// Scrapes UCLA Dining recipe pages for every dining hall + meal period.
// For each dish, collects: name, meal period, dining hall, URL, nutrition table,
// ingredient list, and declared allergens.
// Usage: run the command "node uclaScraper.js"

const fs = require('fs');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { URL } = require('url');

// Helper functions

async function waitFor(driver, selector, timeout = 10_000) {
  await driver.wait(until.elementLocated(By.css(selector)), timeout);
  return driver.findElement(By.css(selector));
}

// Parse both the one‑column and two‑column nutrition tables 
async function parseNutrition(driver) {
  const data = {};

  // Single‑column rows (Total Fat, Cholesterol, etc.)
  const singleRows = await driver.findElements(
    By.css('table.nutritive-table:not(.nutritive-table-two-column) tbody tr')
  );
  for (const tr of singleRows) {
    const tds = await tr.findElements(By.css('td'));
    if (tds.length !== 2) continue;

    const label = (await tds[0].findElement(By.css('span')).getText()).trim();
    const amt   = (await tds[0].getText()).replace(label, '').trim();
    const dv    = (await tds[1].getText()).trim() || null;

    data[label] = { amount: amt, dv };
  }

  // Two‑column rows (Calcium / Iron, etc.)
  const twoRows = await driver.findElements(
    By.css('table.nutritive-table-two-column tr')
  );
  for (const tr of twoRows) {
    const cells = await Promise.all(
      (await tr.findElements(By.css('td'))).map(td => td.getText())
    );

    for (let i = 0; i + 1 < cells.length; i += 2) {
      const left = cells[i].trim();  
      const dv   = cells[i + 1].trim() || null;
      const m    = left.match(/(.+?)(\d.*)/); // split label vs amount
      if (m) {
        const nutrient = m[1].trim();
        const amt      = m[2].trim();
        data[nutrient] = { amount: amt, dv };
      }
    }
  }

  return data;
}

// Switch to the "Ingredients & Allergens" tab, then parse BOTH the ingredient
// list and the declared allergens.
async function parseIngredientsAndAllergens(driver) {
  try {
    const tabBtn = await driver.findElement(
      By.css("button[data-tab-content='ingredient_list']")
    );

    const btnClass = (await tabBtn.getAttribute('class')) || '';
    if (!btnClass.includes('tab-active')) {
      await tabBtn.click();
      await driver.sleep(250); 
    }

    const ingredientDiv = await driver.findElement(By.css('#ingredient_list'));

    // Ingredient list
    const liElems = await ingredientDiv.findElements(By.css('ul.nolispace > li'));
    const ingredients = await Promise.all(liElems.map(li => li.getText()));

    // Allergens
    const blockText = await ingredientDiv.getText();
    let allergensLine = '';
    if (/Allergens\*?:/i.test(blockText)) {
      allergensLine = blockText.split(/Allergens\*?:/i)[1] || '';
      allergensLine = allergensLine.split('\n')[0]; // up to first newline
    }

    const allergens = allergensLine
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return { ingredients, allergens };
  } catch {
    return { ingredients: [], allergens: [] };
  }
}

// headers ("Breakfast", "Lunch", "Dinner").
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
    if (cls.includes('cat-heading-box')) break; // next meal period reached

    for (const a of await sib.findElements(By.css('a.recipe-detail-link'))) {
      const href = await a.getAttribute('href');
      if (href && !urls.includes(href)) urls.push(href);
    }
  }
  return urls;
}

// Config
const baseURL = 'https://dining.ucla.edu/';

const halls = {
  'Bruin Plate':            'bruin-plate/',
  'De Neve Dining':         'de-neve-dining/',
  'Epicuria at Covel':      'epicuria-at-covel/',
  'Spice Kitchen at Feast': 'spice-kitchen/',
};

const PERIODS = ['breakfast', 'lunch', 'dinner'];

// Main flow
(async function main() {
  const options = new chrome.Options()
    .addArguments('--headless')
    .addArguments('--disable-gpu');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const results = [];

  try {
    for (const [hall, path] of Object.entries(halls)) {
      console.log(`\n=== ${hall} ===`);

      await driver.get(new URL(path, baseURL).href);
      await waitFor(driver, 'h2');

      // Gather recipe URLs for each meal period on this page.
      const periodToUrls = {};
      for (const period of PERIODS) {
        const urls = await collectUrlsByHeader(driver, period.toUpperCase());
        if (urls.length) {
          periodToUrls[period] = urls;
          console.log(`  ${period}: ${urls.length} recipes`);
        }
      }

      // Visit every recipe URL we just collected.
      for (const [period, urls] of Object.entries(periodToUrls)) {
        for (const link of urls) {
          await driver.get(link);
          await driver.sleep(300); // allow resources to load

          const name = await (await waitFor(driver, 'h2.single-name')).getText();
          const nutrition = await parseNutrition(driver);
          const { ingredients, allergens } = await parseIngredientsAndAllergens(driver);

          results.push({
            dining_hall: hall,
            meal_period: period,
            url:         link,
            name,
            ingredients,
            allergens,
            nutrition,
          });

          // Navigate back to the hall page to continue.
          await driver.navigate().back();
          await waitFor(driver, 'h2');
        }
      }
    }
  } finally {
    await driver.quit();
  }

  fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDone! Scraped ${results.length} recipes total --> results.json`);
})();
