# Seasonal Festival System

## Overview
The Seasonal Festival System automatically displays festival-related content on the nuti landpage, featuring curated seasonal dishes, cultural significance, and festival traditions. This system enables users to discover traditional foods and learn about different cultural celebrations.

## Features

### 1. Automatic Festival Detection
- **Date-based**: Automatically shows festivals within 60 days (30 days before and after)
- **Smart Timing**: Displays popup after 3 seconds on landpage
- **Status Indicators**: Shows "Today!", "X days away", or "X days ago"

### 2. Curated Seasonal Dishes
- **5-10 Dishes per Festival**: Carefully selected traditional foods
- **Cultural Context**: Each dish includes cultural significance and symbolism
- **Nutritional Info**: Calorie estimates and ingredient lists
- **Categories**: Dessert, Main Dish, Appetizer, Beverage, Fruit, Snack

### 3. Festival Information
- **Cultural Names**: Chinese (中文), Hindi (हिंदी), and English names
- **Descriptions**: Rich cultural context and celebration details
- **Traditions**: Festival activities and customs
- **Theme Colors**: Unique color schemes for each festival

## Current Festivals

### 🧨 Chinese New Year (春节)
- **Date**: February 17, 2026
- **Theme**: Red-Gold
- **Dishes**: Dumplings, Spring Rolls, Nian Gao
- **Significance**: New beginnings, prosperity, good fortune

### 🎄 Christmas
- **Date**: December 25, 2025
- **Theme**: Red-Green
- **Dishes**: Christmas Pudding, Roast Turkey
- **Significance**: Christian celebration, family gathering

## Components

### 1. SeasonalPopup
- **Purpose**: Full-screen popup with festival details
- **Trigger**: Automatically shows after 3 seconds
- **Content**: Dishes, activities, cultural info, call-to-action
- **Dismissal**: "Don't show again" option with localStorage

### 2. SeasonalBanner
- **Purpose**: Compact banner showing current festival
- **Location**: Top of landpage, below header
- **Features**: Auto-rotation for multiple festivals, progress dots
- **Actions**: Quick link to festival recipes

### 3. seasonalData.js
- **Purpose**: Central data store for all festival information
- **Structure**: Organized by festival key with nested dish data
- **Utilities**: Functions for filtering, searching, and date calculations

## Data Structure

### Festival Object
```javascript
{
  name: 'Festival Name',
  chineseName: '中文名称', // Optional
  hindiName: 'हिंदी नाम', // Optional
  date: 'YYYY-MM-DD',
  description: 'Cultural description',
  theme: 'color-scheme',
  dishes: [...],
  activities: [...],
  links: {...}
}
```

### Dish Object
```javascript
{
  name: 'Dish Name (Native Name)',
  description: 'Detailed description',
  image: '/path/to/image.jpg',
  calories: '~X-XX',
  category: 'Category',
  culturalSignificance: 'Symbolic meaning',
  ingredients: ['ingredient1', 'ingredient2']
}
```

### Activity Object
```javascript
{
  icon: '🎊',
  title: 'Activity Title',
  description: 'Activity description'
}
```

## Adding New Festivals

### 1. Update seasonalData.js
```javascript
// Add new festival to seasonalData object
newFestival: {
  name: 'New Festival',
  date: 'YYYY-MM-DD',
  description: 'Description',
  theme: 'new-theme',
  dishes: [...],
  activities: [...]
}
```

### 2. Add Theme Colors
```javascript
// Update getThemeColors function in SeasonalPopup.js
case 'new-theme':
  return {
    primary: 'from-color1-600 to-color2-600',
    secondary: 'from-color1-50 to-color2-50',
    accent: 'color1',
    button: 'bg-color1-600 hover:bg-color1-700'
  };
```

### 3. Add Festival Icon
```javascript
// Update getFestivalIcon function in SeasonalBanner.js
case 'newFestival':
  return '🎊';
```

## Customization Options

### 1. Timing
- **Popup Delay**: Change `3000` in SeasonalPopup.js
- **Banner Rotation**: Modify `5000` in SeasonalBanner.js
- **Festival Window**: Adjust days in `getCurrentSeasonalData()`

### 2. Content
- **Dish Count**: Add/remove dishes from festival data
- **Categories**: Create new dish categories
- **Cultural Info**: Expand descriptions and significance

### 3. Styling
- **Theme Colors**: Customize gradient schemes
- **Layout**: Modify component structure and spacing
- **Animations**: Adjust transition timings and effects

## User Experience Features

### 1. Smart Display
- **Contextual**: Only shows relevant festivals
- **Non-intrusive**: Banner is subtle, popup is dismissible
- **Persistent**: Remembers user preferences

### 2. Interactive Elements
- **Clickable Dishes**: Link to detailed food information
- **Recipe Links**: Direct access to festival recipes
- **Meal Planning**: Integration with meal planner

### 3. Cultural Education
- **Multilingual**: Native language names and descriptions
- **Symbolism**: Cultural significance explanations
- **Traditions**: Festival activity descriptions

## Integration Points

### 1. Recipe System
- **URL Parameters**: `?season=autumn&festival=moon`
- **Filtering**: Seasonal and festival-based recipe search
- **Collections**: Curated festival recipe sets

### 2. Meal Planner
- **Theme Support**: `?theme=festival&festival=moon`
- **Seasonal Menus**: Pre-planned festival meal suggestions
- **Cultural Context**: Traditional meal planning

### 3. Food Database
- **Detailed Info**: Nutritional facts, ingredients, preparation
- **Cultural Context**: Historical and symbolic information
- **Related Foods**: Similar dishes and alternatives

## Future Enhancements

### 1. Additional Festivals
- **Global Celebrations**: More cultural festivals
- **Seasonal Events**: Harvest festivals, solstices
- **Religious Observances**: Various faith-based celebrations

### 2. Enhanced Content
- **Video Content**: Festival preparation videos
- **Audio**: Traditional music and sounds
- **Interactive Maps**: Festival origins and spread

### 3. User Engagement
- **Festival Countdown**: Real-time countdown timers
- **User Stories**: Community festival experiences
- **Recipe Sharing**: User-submitted festival recipes

## Technical Implementation

### 1. State Management
- **Local Storage**: User preferences and dismissal settings
- **React State**: Component visibility and data management
- **Effects**: Automatic timing and data fetching

### 2. Performance
- **Lazy Loading**: Images and heavy content
- **Memoization**: Optimized re-renders
- **Efficient Updates**: Minimal DOM manipulation

### 3. Accessibility
- **Screen Readers**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Accessible color schemes

## Best Practices

### 1. Content Creation
- **Cultural Accuracy**: Verify information with cultural experts
- **Inclusive Language**: Respectful and accurate terminology
- **Balanced Representation**: Diverse cultural perspectives

### 2. User Experience
- **Progressive Disclosure**: Information hierarchy and flow
- **Clear Actions**: Obvious next steps and call-to-actions
- **Responsive Design**: Mobile-first approach

### 3. Maintenance
- **Regular Updates**: Keep festival dates and information current
- **Content Review**: Periodic accuracy and relevance checks
- **User Feedback**: Incorporate user suggestions and improvements

## Support and Troubleshooting

### 1. Common Issues
- **Popup Not Showing**: Check localStorage settings and timing
- **Missing Images**: Verify image paths and fallback handling
- **Date Calculations**: Ensure proper date formatting

### 2. Debug Mode
```javascript
// Enable console logging
console.log('Current festivals:', getCurrentSeasonalData());
console.log('Festival data:', seasonalData);
```

### 3. Testing
- **Date Testing**: Test with different dates and timezones
- **Content Testing**: Verify all festival information displays correctly
- **User Flow**: Test popup dismissal and banner interactions

This seasonal festival system creates an engaging, educational experience that celebrates cultural diversity and helps users discover traditional foods from around the world. 