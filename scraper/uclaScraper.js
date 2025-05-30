// Scrapes UCLA Dining menus for every dining hall & meal period across multiple days.
// Captures: name, meal period, dining hall, station / concept heading,
// recipe URL, full nutrition, ingredient list, declared allergens, and logo
// tags (e.g. "Contains Wheat", "Vegetarian"). 
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

// helper: get all available dates from the dropdown
async function getAvailableDates(driver) {
  try {
    const select = await waitFor(driver, '#jump-to-date');
    const options = await select.findElements(By.css('option[value]:not([value=""])'));
    
    const dates = [];
    for (const option of options) {
      const value = await option.getAttribute('value');
      const text = await option.getText();
      if (value) {
        dates.push({ value, text });
      }
    }
    console.log(`Found ${dates.length} available dates`);
    return dates;
  } catch (error) {
    console.warn('Could not find date selector, using current date only');
    return [{ value: null, text: 'Current Date' }];
  }
}

// helper: select a specific date
async function selectDate(driver, dateValue) {
  if (!dateValue) return true; // Current date already selected
  
  try {
    const select = await waitFor(driver, '#jump-to-date');
    await select.findElement(By.css(`option[value="${dateValue}"]`)).click();
    await driver.sleep(1500); // Wait for page to reload with new date
    return true;
  } catch (error) {
    console.warn(`Failed to select date ${dateValue}:`, error.message);
    return false;
  }
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

// helper: logo-tags ("Contains Wheat", etc.) 
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
  let availableDates = []; // Move declaration outside try block

  try {
    // First, get all available dates by visiting any dining hall page
    const firstHall = Object.entries(halls)[0];
    await driver.get(new URL(firstHall[1], baseURL).href);
    await waitFor(driver, '.force-left-full-width');
    
    availableDates = await getAvailableDates(driver);
    
    for (const dateInfo of availableDates) {
      console.log(`\n\n==== SCRAPING FOR: ${dateInfo.text} ====`);
      
      for (const [hall, path] of Object.entries(halls)) {
        console.log(`\n=== ${hall} ===`);
        await driver.get(new URL(path, baseURL).href);
        await waitFor(driver, '.force-left-full-width');
        
        // Select the specific date
        const dateSelected = await selectDate(driver, dateInfo.value);
        if (!dateSelected) {
          console.warn(`Skipping ${hall} for ${dateInfo.text} - could not select date`);
          continue;
        }

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
                date: dateInfo.value || new Date().toISOString().split('T')[0], // Use current date if no value
                date_text: dateInfo.text,
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
    }
  } finally {
    await driver.quit();
  }

  fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nDone! Scraped ${results.length} recipes total across ${availableDates.length} dates → results.json`);
})();
