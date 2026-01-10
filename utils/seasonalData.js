// Seasonal and Festival Food Data
// Curated seasonal dishes and activities for different cultural festivals.

export const seasonalData = {
  // Chinese New Year (春节) - February
  lunarNewYear: {
    name: 'Chinese New Year',
    chineseName: '春节',
    date: '2026-02-17',
    description: 'The most important festival in Chinese culture, celebrating new beginnings',
    theme: 'red-gold',
    dishes: [
      {
        name: 'Dumplings (饺子)',
        description: 'Symbolic of wealth and prosperity, shaped like ancient Chinese gold ingots',
        image: '/images/Dumplings.jpg',
        calories: '~200-300',
        category: 'Main Dish',
        culturalSignificance: 'Symbolizes wealth and good fortune',
        ingredients: ['flour', 'ground pork', 'cabbage', 'garlic', 'ginger']
      },
      {
        name: 'Spring Rolls (春卷)',
        description: 'Crispy rolls filled with vegetables and meat, symbolizing wealth',
        image: '/images/Spring%20rolls.jpg',
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

  // Christmas - December
  christmas: {
    name: 'Christmas',
    date: '2025-12-25',
    description: 'Christian celebration of the birth of Jesus Christ',
    theme: 'red-green',
    dishes: [
      {
        name: 'Christmas Pudding',
        description: 'Rich fruit pudding served with brandy sauce',
        image: '/images/pudding.png',
        calories: '~300-400',
        category: 'Dessert',
        culturalSignificance: 'Traditional British Christmas dessert',
        ingredients: ['dried fruits', 'breadcrumbs', 'suet', 'brandy', 'spices']
      },
      {
        name: 'Roast Turkey',
        description: 'Traditional roasted turkey with stuffing and gravy',
        image: '/images/turkey.png',
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

// Day-level difference ignoring time-of-day
function daysBetweenCalendarDates(startDate, endDate) {
  const a = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const b = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

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
    const daysFromNowThisYear = daysBetweenCalendarDates(now, thisYearDate);
    if (daysFromNowThisYear < -30) {
      targetDate = new Date(now.getFullYear() + 1, baseDate.getMonth(), baseDate.getDate());
    }

    const daysDiff = daysBetweenCalendarDates(now, targetDate);

    // Show festivals within [-30, 90] day window relative to now
    // Always include Chinese New Year regardless of window
    if ((daysDiff >= -30 && daysDiff <= 90) || key === 'lunarNewYear') {
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

  // Sort: future first (ascending), then past (ascending by absolute)
  upcomingFestivals.sort((a, b) => {
    const aFuture = a.daysUntil >= 0;
    const bFuture = b.daysUntil >= 0;
    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    return aFuture ? a.daysUntil - b.daysUntil : Math.abs(a.daysUntil) - Math.abs(b.daysUntil);
  });

  return upcomingFestivals;
}

// Get festival by key
export function getFestivalByKey(key) {
  return seasonalData[key] || null;
}

// Get seasonal dishes by category
export function getSeasonalDishesByCategory(category) {
  const allDishes = [];
  for (const [festivalKey, festival] of Object.entries(seasonalData)) {
    for (const dish of festival.dishes) {
      if (dish.category === category) {
        allDishes.push({
          ...dish,
          festival: festival.name,
          festivalKey
        });
      }
    }
  }
  return allDishes;
}

// Get dishes by season
export function getDishesBySeason(season) {
  const seasonMap = {
    spring: [2, 3, 4],   // Mar, Apr, May
    summer: [5, 6, 7],   // Jun, Jul, Aug
    autumn: [8, 9, 10],  // Sep, Oct, Nov
    winter: [11, 0, 1]   // Dec, Jan, Feb
  };

  const seasonMonths = seasonMap[season] || [];
  const seasonalDishes = [];

  for (const [key, festival] of Object.entries(seasonalData)) {
    const festivalDate = new Date(festival.date);
    const festivalMonthIndex = festivalDate.getMonth();
    if (seasonMonths.includes(festivalMonthIndex)) {
      seasonalDishes.push({
        ...festival,
        key
      });
    }
  }

  return seasonalDishes;
} 