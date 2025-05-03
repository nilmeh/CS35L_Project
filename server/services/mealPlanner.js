export function generateMealPlan(userPreferences, menuData) {
    const { targetCalories, minProtein, maxSugar, maxFat, vegetarian, location } = userPreferences;

    const filteredMenu = menuData.filter(item => {
        const matchesDiet = !vegetarian || item.tags.includes("vegetarian");
        const matchesLocation = item.location == location;
        return matchesDiet && matchesLocation;
    })

    const scoredMenu = filteredMenu.map(item => ({...item, score: item.protein / item.calories})).sort((a, b) => b.score - a.score);

    const selected = [];
    const totals = {calories: 0, protein: 0, fat: 0, sugar: 0};

    for (const item of scoredMenu) {
        if (totals.sugar + item.sugar > maxSugar || totals.fat + item.fat > maxFat) continue;
        selected.push(item.name)
        totals.calories += item.calories
        totals.protein += item.protein
        totals.fat += item.fat
        totals.sugar += item.sugar

        if (totals.calories >= targetCalories && totals.protein >= minProtein) {
            break;
        }
    }

    return {
        selected,
        totals
    };
  }
