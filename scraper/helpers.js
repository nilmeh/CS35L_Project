// helpers.js 

function grams(str = '0g') {
  // Ensure str is a string before using replace
  if (typeof str !== 'string') {
    return parseFloat(str) || 0;
  }
  return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
}

const regexFromList = arr => new RegExp(`\\b(${arr.join('|')})\\b`, 'i');

const DRINK_WORDS   = regexFromList([
  'water','juice','milk','tea','coffee','latte','mocha','soda','cola',
  'lemonade','kombucha','smoothie','chai','matcha','espresso'
]);

const DESSERT_WORDS = regexFromList([
  'cookie','brownie','cake','cupcake','pie','cobbler','muffin','donut',
  'pudding','gelato','sorbet','ice cream','frosting','cheesecake','tart'
]);

const SOUP_WORDS    = regexFromList(['soup','broth','bisque','chowder','gazpacho']);
const MAIN_WORDS    = regexFromList([
  'burger','sandwich','wrap','burrito','taco','pizza','pasta','lasagna',
  'enchilada','curry','stir ?fry','steak','chicken','beef','pork','tofu',
  'salmon','fish','shrimp','bowl','plate','loaf','cutlet'
]);

const SIDE_WORDS    = regexFromList([
  'fries','wedge','mashed','rice','pilaf','quinoa','beans','lentils','salad',
  'slaw','coleslaw','spinach','kale','broccoli','corn','carrots','potatoes',
  'side','chips','toast','bread','roll'
]);

function determineCategory(name, ingredients, nutrition) {
  const text = (name + ' ' + ingredients.join(' ')).toLowerCase();

  const protein = grams(nutrition.protein);
  const fat     = grams(nutrition.fat);
  const sugar   = grams(nutrition.sugar);
  const carbs   = grams(nutrition.carbs);
  const caloriesGuess = carbs * 4 + protein * 4 + fat * 9;

  // beverage 

  const looksLikeDrink =
    DRINK_WORDS.test(text) &&
    protein <= 5 && fat <= 5 && caloriesGuess < 250;

  if (looksLikeDrink) return 'Beverage';

  // dessert
  const looksLikeDessert =
    DESSERT_WORDS.test(text) ||
    (sugar >= 15 && protein <= 5 && !SOUP_WORDS.test(text));

  if (looksLikeDessert) return 'Dessert';

  // soup
  if (SOUP_WORDS.test(text)) return 'Soup';

  // side
  const looksLikeSide =
    SIDE_WORDS.test(text) ||
    (caloriesGuess && caloriesGuess < 300 && protein < 10);

  // main course
  const looksLikeMain =
    MAIN_WORDS.test(text) || protein >= 15;

  if (looksLikeMain && !looksLikeDessert) return 'Main Course';
  if (looksLikeSide) return 'Side';

  return 'Other';
}

module.exports = {determineCategory};