// Seasonal and Festival Food Data
// Curated seasonal dishes and activities for different cultural festivals.

export const seasonalData = {
  // Mid-Autumn Festival (中秋节) - October
  moonFestival: {
    name: 'Mid-Autumn Festival',
    chineseName: '中秋节',
    date: 'October 17, 2024',
    description: 'A time for family reunions, moon gazing, and enjoying traditional foods',
    theme: 'purple-blue',
    dishes: [
      {
        name: 'Mooncakes (月饼)',
        description: 'Traditional round pastries filled with sweet bean paste, lotus seed paste, or salted egg yolks',
        image: '/images/mooncake.jpg',
        calories: '~300-400',
        category: 'Dessert',
        culturalSignificance: 'Symbolizes the full moon and family unity',
        ingredients: ['glutinous rice flour', 'sweet bean paste', 'lotus seed paste', 'salted egg yolk']
      },
      {
        name: 'Osmanthus Rice Wine (桂花酒)',
        description: 'Fragrant rice wine infused with sweet osmanthus flowers',
        image: '/images/Osmanthus Rice Wine.png',
        calories: '~150-200',
        category: 'Beverage',
        culturalSignificance: 'Represents the sweet fragrance of autumn',
        ingredients: ['rice wine', 'osmanthus flowers', 'honey']
      },
      {
        name: 'Pomelo (柚子)',
        description: 'Large citrus fruit symbolizing abundance and good fortune',
        image: '/images/pomelo.jpg',
        calories: '~60-80',
        category: 'Fruit',
        culturalSignificance: 'Symbolizes prosperity and family togetherness',
        ingredients: ['pomelo']
      },
      {
        name: 'Tea Eggs (茶叶蛋)',
        description: 'Hard-boiled eggs steeped in tea and spices, representing family unity',
        image: '/images/Tea%20eggs.jpg',
        calories: '~80-100',
        category: 'Snack',
        culturalSignificance: 'Symbolizes the strength and unity of family bonds',
        ingredients: ['eggs', 'black tea', 'soy sauce', 'star anise', 'cinnamon']
      },
      {
        name: 'Sweet Rice Balls (汤圆)',
        description: 'Glutinous rice balls in sweet soup, symbolizing family togetherness',
        image: '/images/Sweet%20rice%20balls.jpg',
        calories: '~120-150',
        category: 'Dessert',
        culturalSignificance: 'Represents the roundness of the moon and family unity',
        ingredients: ['glutinous rice flour', 'sesame paste', 'sweet red bean paste', 'brown sugar']
      }
    ],
    activities: [
      {
        icon: '🌕',
        title: 'Moon Gazing',
        description: 'Admire the full moon with family and friends'
      },
      {
        icon: '🏮',
        title: 'Lantern Display',
        description: 'Light colorful lanterns to guide the way'
      },
      {
        icon: '👨‍👩‍👧‍👦',
        title: 'Family Reunion',
        description: 'Share a special meal with loved ones'
      }
    ],
    links: {
      recipes: '/what-can-i-cook?season=autumn&festival=moon',
      mealPlanner: '/meal-planner?theme=festival',
      culturalInfo: '/country/chinese?festival=moon'
    }
  },

  // Lunar New Year (春节) - February
  lunarNewYear: {
    name: 'Lunar New Year',
    chineseName: '春节',
    date: 'February 10, 2024',
    description: 'The most important festival in Chinese culture, celebrating new beginnings',
    theme: 'red-gold',
    dishes: [
      {
        name: 'Dumplings (饺子)',
        description: 'Symbolic of wealth and prosperity, shaped like ancient Chinese gold ingots',
        image: '/images/landpage/dumplings.jpg',
        calories: '~200-300',
        category: 'Main Dish',
        culturalSignificance: 'Symbolizes wealth and good fortune',
        ingredients: ['flour', 'ground pork', 'cabbage', 'garlic', 'ginger']
      },
      {
        name: 'Spring Rolls (春卷)',
        description: 'Crispy rolls filled with vegetables and meat, symbolizing wealth',
        image: '/images/landpage/spring-rolls.jpg',
        calories: '~150-200',
        category: 'Appetizer',
        culturalSignificance: 'Represents the coming of spring and new opportunities',
        ingredients: ['rice paper', 'vegetables', 'shrimp', 'pork', 'vermicelli']
      },
      {
        name: 'Nian Gao (年糕)',
        description: 'Sweet sticky rice cake, symbolizing higher achievements in the new year',
        image: '/images/landpage/nian-gao.jpg',
        calories: '~250-300',
        category: 'Dessert',
        culturalSignificance: 'Symbolizes progress and advancement',
        ingredients: ['glutinous rice flour', 'brown sugar', 'red dates']
      }
    ],
    activities: [
      {
        icon: '🧨',
        title: 'Fireworks',
        description: 'Drive away evil spirits with loud celebrations'
      },
      {
        icon: '🧧',
        title: 'Red Envelopes',
        description: 'Give and receive lucky money for good fortune'
      },
      {
        icon: '🏮',
        title: 'Lantern Festival',
        description: 'Celebrate with colorful lantern displays'
      }
    ]
  },

  // Diwali (Festival of Lights) - November
  diwali: {
    name: 'Diwali',
    hindiName: 'दीपावली',
    date: 'November 12, 2024',
    description: 'The festival of lights celebrating the victory of light over darkness',
    theme: 'orange-yellow',
    dishes: [
      {
        name: 'Gulab Jamun',
        description: 'Sweet milk solids soaked in rose-flavored sugar syrup',
        image: '/images/landpage/gulab-jamun.jpg',
        calories: '~200-250',
        category: 'Dessert',
        culturalSignificance: 'Symbolizes sweetness and celebration',
        ingredients: ['milk solids', 'flour', 'sugar syrup', 'rose water', 'cardamom']
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        image: '/images/landpage/samosa.jpg',
        calories: '~250-300',
        category: 'Snack',
        culturalSignificance: 'Represents the triumph of good over evil',
        ingredients: ['flour', 'potatoes', 'peas', 'spices', 'oil']
      }
    ],
    activities: [
      {
        icon: '🪔',
        title: 'Light Diyas',
        description: 'Light oil lamps to dispel darkness'
      },
      {
        icon: '🎆',
        title: 'Fireworks',
        description: 'Celebrate with colorful fireworks displays'
      },
      {
        icon: '🛍️',
        title: 'Shopping',
        description: 'Buy new clothes and gifts for loved ones'
      }
    ]
  },

  // Christmas - December
  christmas: {
    name: 'Christmas',
    date: 'December 25, 2024',
    description: 'Christian celebration of the birth of Jesus Christ',
    theme: 'red-green',
    dishes: [
      {
        name: 'Christmas Pudding',
        description: 'Rich fruit pudding served with brandy sauce',
        image: '/images/landpage/christmas-pudding.jpg',
        calories: '~300-400',
        category: 'Dessert',
        culturalSignificance: 'Traditional British Christmas dessert',
        ingredients: ['dried fruits', 'breadcrumbs', 'suet', 'brandy', 'spices']
      },
      {
        name: 'Roast Turkey',
        description: 'Traditional roasted turkey with stuffing and gravy',
        image: '/images/landpage/roast-turkey.jpg',
        calories: '~300-400',
        category: 'Main Dish',
        culturalSignificance: 'Centerpiece of Christmas dinner',
        ingredients: ['turkey', 'herbs', 'butter', 'stuffing', 'gravy']
      }
    ],
    activities: [
      {
        icon: '🎄',
        title: 'Christmas Tree',
        description: 'Decorate the tree with ornaments and lights'
      },
      {
        icon: '🎁',
        title: 'Gift Exchange',
        description: 'Share presents with family and friends'
      },
      {
        icon: '🎵',
        title: 'Caroling',
        description: 'Sing traditional Christmas songs'
      }
    ]
  }
};

// Get current seasonal data based on date
export function getCurrentSeasonalData() {
  const now = new Date();

  // Check for upcoming festivals in the next 3 months (and recent past 30 days)
  const upcomingFestivals = [];

  Object.entries(seasonalData).forEach(([key, festival]) => {
    const baseDate = new Date(festival.date);

    // Compute this year's occurrence based on month/day of the base date
    const thisYearDate = new Date(now.getFullYear(), baseDate.getMonth(), baseDate.getDate());

    // If the date is far in the past (more than 30 days ago), check next year as the next occurrence
    let targetDate = thisYearDate;
    const daysFromNowThisYear = Math.ceil((thisYearDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysFromNowThisYear < -30) {
      targetDate = new Date(now.getFullYear() + 1, baseDate.getMonth(), baseDate.getDate());
    }

    const daysDiff = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    // Show festivals within [-30, 90] day window relative to now
    if (daysDiff >= -30 && daysDiff <= 90) {
      upcomingFestivals.push({
        ...festival,
        key,
        date: targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        daysUntil: daysDiff,
        isToday: daysDiff === 0,
        isPast: daysDiff < 0
      });
    }
  });

  // Sort by closest date
  upcomingFestivals.sort((a, b) => Math.abs(a.daysUntil) - Math.abs(b.daysUntil));

  return upcomingFestivals;
}

// Get festival by key
export function getFestivalByKey(key) {
  return seasonalData[key] || null;
}

// Get seasonal dishes by category
export function getSeasonalDishesByCategory(category) {
  const allDishes = [];
  
  Object.values(seasonalData).forEach(festival => {
    festival.dishes.forEach(dish => {
      if (dish.category === category) {
        allDishes.push({
          ...dish,
          festival: festival.name,
          festivalKey: Object.keys(seasonalData).find(key => seasonalData[key] === festival)
        });
      }
    });
  });
  
  return allDishes;
}

// Get dishes by season
export function getDishesBySeason(season) {
  const seasonMap = {
    spring: ['march', 'april', 'may'],
    summer: ['june', 'july', 'august'],
    autumn: ['september', 'october', 'november'],
    winter: ['december', 'january', 'february']
  };
  
  const currentSeason = seasonMap[season] || [];
  const seasonalDishes = [];
  
  Object.entries(seasonalData).forEach(([key, festival]) => {
    const festivalDate = new Date(festival.date);
    const festivalMonth = festivalDate.toLocaleString('en', { month: 'long' }).toLowerCase();
    
    if (currentSeason.includes(festivalMonth)) {
      seasonalDishes.push({
        ...festival,
        key
      });
    }
  });
  
  return seasonalDishes;
} 