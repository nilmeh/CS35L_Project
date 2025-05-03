from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from urllib.parse import urljoin
import re, json, time

# helpers
def wait_for(driver, css, timeout=10):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, css))
    )

def parse_nutrition(driver):
    data = {}
    # single‑column table
    for tr in driver.find_elements(
        By.CSS_SELECTOR,
        "table.nutritive-table:not(.nutritive-table-two-column) tbody tr"
    ):
        tds = tr.find_elements(By.TAG_NAME, "td")
        if len(tds) != 2:
            continue
        label = tds[0].find_element(By.TAG_NAME, "span").text.strip()
        amt = tds[0].text.replace(label, "").strip()
        dv = tds[1].text.strip() or None
        data[label] = {"amount": amt, "dv": dv}

    # two‑column table
    for tr in driver.find_elements(
        By.CSS_SELECTOR,
        "table.nutritive-table-two-column tr"
    ):
        cells = [td.text.strip() for td in tr.find_elements(By.TAG_NAME, "td")]
        for i in range(0, len(cells), 2):
            if i + 1 >= len(cells):
                break
            left, dv = cells[i], cells[i+1]
            m = re.match(r"(.+?)(\d.*)", left)
            if m:
                nut, amt = m.groups()
                data[nut.strip()] = {"amount": amt.strip(), "dv": dv or None}
    return data

def collect_urls_by_header(driver, period_upper):
    """
    Return all detail links under the section starting with the given
    <h2> (BREAKFAST/LUNCH/DINNER). Works whether or not the heading is wrapped
    in .cat-heading-box.
    """
    try:
        hdr = driver.find_element(
            By.XPATH,
            f"//h2[translate(normalize-space(),"
            f"'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"
            f"='{period_upper}']"
        )
    except NoSuchElementException:
        return []

    # Use wrapper if it exists; otherwise stick with the <h2> itself
    try:
        container = hdr.find_element(
            By.XPATH,
            "./ancestor::div[contains(@class,'cat-heading-box')]"
        )
    except NoSuchElementException:
        container = hdr

    urls = []
    for sib in container.find_elements(By.XPATH, "following-sibling::*"):
        if "cat-heading-box" in sib.get_attribute("class"):
            break
        for a in sib.find_elements(By.CSS_SELECTOR, "a.recipe-detail-link"):
            href = a.get_attribute("href")
            if href and href not in urls:
                urls.append(href)
    return urls

def collect_urls_by_nav(driver, nav_id):
    """Fallback search inside nav#<period>-anchor-links."""
    try:
        nav = driver.find_element(By.ID, nav_id)
    except NoSuchElementException:
        return []
    return [
        a.get_attribute("href")
        for a in nav.find_elements(By.CSS_SELECTOR, "a.recipe-detail-link")
        if a.get_attribute("href")
    ]

# config
base_url = "https://dining.ucla.edu/"
halls = {
    "Bruin Plate":              "bruin-plate/",
    "De Neve Dining":           "de-neve-dining/",
    "Epicuria at Covel":        "epicuria-at-covel/",
    "Spice Kitchen at Feast":   "spice-kitchen/",
}

PERIOD_NAV_IDS = {
    "breakfast": "breakfast-anchor-links",
    "lunch":     "lunch-anchor-links",
    "dinner":    "dinner-anchor-links",
}

# scrape
driver  = webdriver.Chrome()
results = []

for hall, ext in halls.items():
    print(f"\n=== {hall} ===")
    driver.get(urljoin(base_url, ext))
    wait_for(driver, "h2")          # page ready

    period_to_urls = {}
    for period, nav_id in PERIOD_NAV_IDS.items():
        urls = collect_urls_by_header(driver, period.upper())
        if not urls:
            urls = collect_urls_by_nav(driver, nav_id)
        if urls:
            period_to_urls[period] = urls
            print(f"  {period.title()}: {len(urls)} recipes")

    for period, urls in period_to_urls.items():
        for link in urls:
            driver.get(link)
            time.sleep(0.3)

            dish = wait_for(driver, "h2.single-name").text.strip()

            try:
                raw = driver.find_element(
                    By.CSS_SELECTOR,
                    "ul.nolispace li strong"
                ).text.strip("()")
                allergens = [x.strip() for x in raw.split(",") if x.strip()]
            except NoSuchElementException:
                allergens = []

            nutrition = parse_nutrition(driver)

            results.append({
                "dining_hall": hall,
                "meal_period": period,
                "url":         link,
                "name":        dish,
                "allergens":   allergens,
                "nutrition":   nutrition,
            })

            driver.back()
            wait_for(driver, "h2")   # back to list page

driver.quit()

# save data inside of json file
with open("ucla_dining.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nDone! Scraped {len(results)} recipes total.")
