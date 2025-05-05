export function generateMealPlan(userPreferences, menuData) {
    const { targetCalories, minProtein, maxSugar, maxFat, vegetarian, allowedTags = [], disallowedTags = [], diningHall, mealTime } = userPreferences;

    const MAX_SERVINGS = 2;
    const CATEGORY_LIMIT = {
        "Dessert": 1,
        "Main Course" : 3,
        "Side" : 2,
        "Soup" : 2
    };

    const filteredMenu = menuData.filter(item => {
        const isVeg = !vegetarian || item.tags.includes("vegetarian");
        const matchesLocation = item.location === diningHall;
        const matchesTime = item.mealTime === mealTime;
        const hasAllowedTags = allowedTags.length === 0 || allowedTags.some(tag => item.tags.includes(tag));
        const hasNoDisallowedTags = !item.tags.some(tag => disallowedTags.includes(tag));
        return isVeg && matchesLocation && matchesTime && hasAllowedTags && hasNoDisallowedTags;
    })

    const scored = filteredMenu.map(item => {
        const score = 
        0.6 * (item.protein / item.calories) -
        0.25 * (item.sugar / item.calories) -
        0.15 * (item.fat / item.calories);
        return { ...item, score };
    }).sort((a, b) => b.score - a.score);

    const selectedItems = [];
    const totals = {
        calories: 0,
        protein: 0,
        sugar: 0,
        fat: 0
    };

    const tagCount = {};
    const itemCount = {};

    for (const item of scored) {
        let servings = 0;
        const tagCapExceeded = item.tags.some(tag =>
            CATEGORY_LIMIT[tag] && (tagCount[tag] || 0) >= CATEGORY_LIMIT[tag]
        );
        if (tagCapExceeded) continue;
    
        while (
            servings < MAX_SERVINGS &&
            totals.calories + item.calories <= targetCalories &&
            totals.protein + item.protein <= 2 * minProtein
        ) {
            if (
                totals.sugar + item.sugar > maxSugar ||
                totals.fat + item.fat > maxFat
            ) break;
    
            servings++;
            totals.calories += item.calories;
            totals.protein += item.protein;
            totals.sugar += item.sugar;
            totals.fat += item.fat;
        }
    
        if (servings > 0) {
            itemCount[item.name] = servings;
            item.tags.forEach(tag =>
                tagCount[tag] = (tagCount[tag] || 0) + servings
            );
            selectedItems.push(`${item.name} x${servings}`);
        }
    
        if (totals.calories >= targetCalories && totals.protein >= minProtein) break;
    }
    
    return {
        selectedItems,
        totals,
        tagCount,
        message: `Meal plan generated with ${selectedItems.length} items across ${Object.keys(tagCount).length} categories`
    };
}
