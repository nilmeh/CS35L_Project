// Test scraper for UCLA Dining - scrapes ONE dining hall on ONE date
// Saves results to test.json for debugging nutrition parsing
// Run with: node test-scraper.js

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
  console.log('\n=== PARSING NUTRITION TABLES ===');

  try {
    /* single-column rows */
    const singleRows = await driver.findElements(
      By.css('table.nutritive-table:not(.nutritive-table-two-column) tbody tr')
    );
    console.log(`Found ${singleRows.length} single-column nutrition rows`);
    
    for (const tr of singleRows) {
      const tds = await tr.findElements(By.css('td'));
      if (tds.length !== 2) continue;

      const label = (await tds[0].findElement(By.css('span')).getText()).trim();
      const amt = (await tds[0].getText()).replace(label, '').trim();
      const dv = (await tds[1].getText()).trim() || null;

      console.log(`  ${label}: ${amt} (${dv}% DV)`);
      data[label] = { amount: amt, dv };
    }

    /* two-column rows */
    const twoColRows = await driver.findElements(
      By.css('table.nutritive-table-two-column tr')
    );
    console.log(`Found ${twoColRows.length} two-column nutrition rows`);
    
    for (const tr of twoColRows) {
      const cells = await Promise.all(
        (await tr.findElements(By.css('td'))).map(td => td.getText())
      );
      for (let i = 0; i + 1 < cells.length; i += 2) {
        const left = cells[i].trim();
        const dv = cells[i + 1].trim() || null;
        const m = left.match(/(.+?)(\d.*)/);
        if (m) {
          console.log(`  ${m[1].trim()}: ${m[2].trim()} (${dv}% DV)`);
          data[m[1].trim()] = { amount: m[2].trim(), dv };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing nutrition:', error.message);
  }

  console.log(`Total nutrition fields parsed: ${Object.keys(data).length}`);
  return data;
}

// helper: get the calories
async function parseCalories(driver) {
  try {
    console.log('\n=== PARSING CALORIES ===');
    const selector = By.css('p.single-calories');
    await driver.wait(until.elementLocated(selector), 10_000);
    let fullText = await driver.findElement(selector).getText();
    
    console.log('Raw calories text:', fullText);
    
    // More specific regex to extract just the number after "Calories"
    const match = fullText.match(/Calories\s*(\d+)/i);
    const calories = match ? parseInt(match[1], 10) : 0;
    
    console.log('Parsed calories:', calories);
    return calories;
  } catch (error) {
    console.warn('Could not parse calories:', error.message);
    return 0; 
  }
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

// TEST CONFIGURATION
const baseURL = 'https://dining.ucla.edu/';
const TEST_HALL = 'Bruin Plate';           // Change this to test different halls
const TEST_HALL_PATH = 'bruin-plate/';     // Corresponding path
const TEST_DATE_INDEX = 0;                 // 0 = first available date, 1 = second, etc.
const MAX_RECIPES_PER_PERIOD = 3;          // Limit recipes to test
const PERIODS = ['breakfast', 'lunch', 'dinner'];

// main test function
(async function testScraper() {
  console.log(`🧪 TEST MODE: Scraping ${TEST_HALL} only`);
  console.log(`📅 Will use date index: ${TEST_DATE_INDEX}`);
  console.log(`🔢 Max recipes per period: ${MAX_RECIPES_PER_PERIOD}`);
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments('--headless', '--disable-gpu'))
    .build();

  const results = [];
  let availableDates = [];

  try {
    // Get available dates
    await driver.get(new URL(TEST_HALL_PATH, baseURL).href);
    await waitFor(driver, '.force-left-full-width');
    
    availableDates = await getAvailableDates(driver);
    
    // Use specified date index
    const dateInfo = availableDates[TEST_DATE_INDEX] || availableDates[0];
    console.log(`\n🎯 TESTING DATE: ${dateInfo.text}`);
    
    // Select the date
    const dateSelected = await selectDate(driver, dateInfo.value);
    if (!dateSelected) {
      throw new Error(`Could not select date: ${dateInfo.text}`);
    }

    // Collect recipes for all periods
    const periodToLinks = {};
    for (const period of PERIODS) {
      const allRecs = await collectRecipes(driver, period);
      // Limit recipes for testing
      periodToLinks[period] = allRecs.slice(0, MAX_RECIPES_PER_PERIOD);
      console.log(`📋 ${period}: ${periodToLinks[period].length} recipes (limited from ${allRecs.length})`);
    }

    // Scrape each recipe with detailed logging
    for (const [period, recs] of Object.entries(periodToLinks)) {
      console.log(`\n🍽️ === SCRAPING ${period.toUpperCase()} ===`);
      
      for (let i = 0; i < recs.length; i++) {
        const { url, station } = recs[i];
        console.log(`\n📖 Recipe ${i + 1}/${recs.length}: ${station}`);
        console.log(`🔗 URL: ${url}`);
        
        try {
          await driver.get(url);
          await driver.sleep(800);

          const name = await (await waitFor(driver, 'h2.single-name', 30_000)).getText();
          console.log(`📝 Name: ${name}`);
          
          const calories = await parseCalories(driver);
          const nutrition = await parseNutrition(driver);
          const { ingredients, allergens } = await parseIngredientsAndAllergens(driver);
          const tags = await parseMetadataTags(driver);

          console.log(`✅ Parsed: ${ingredients.length} ingredients, ${allergens.length} allergens, ${tags.length} tags`);

          results.push({
            date: dateInfo.value || new Date().toISOString().split('T')[0],
            date_text: dateInfo.text,
            dining_hall: TEST_HALL,
            meal_period: period,
            station,
            url,
            name,
            ingredients,
            allergens,
            nutrition,
            calories,
            tags
          });
          
        } catch (err) {
          console.warn(`❌ FAILED: ${err.name} - ${url}`);
          console.warn(`   Error: ${err.message}`);
        } finally {
          try {
            await driver.navigate().back();
            await waitFor(driver, '.force-left-full-width', 10_000);
          } catch { /* ignore */ }
        }
      }
    }
  } finally {
    await driver.quit();
  }

  // Save test results
  fs.writeFileSync('test.json', JSON.stringify(results, null, 2), 'utf8');
  
  console.log(`\n🎉 TEST COMPLETE!`);
  console.log(`📊 Scraped ${results.length} recipes from ${TEST_HALL}`);
  console.log(`📁 Results saved to: test.json`);
  
  // Summary stats
  const withCalories = results.filter(r => r.calories > 0).length;
  const withNutrition = results.filter(r => Object.keys(r.nutrition).length > 0).length;
  const withIngredients = results.filter(r => r.ingredients.length > 0).length;
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Recipes with calories: ${withCalories}/${results.length}`);
  console.log(`   Recipes with nutrition: ${withNutrition}/${results.length}`);
  console.log(`   Recipes with ingredients: ${withIngredients}/${results.length}`);
})();