/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

export const monthOptions = {
  "January-February": "Early year, winter in North / summer in South",
  "March-April": "Spring in North / autumn in South",
  "May-June": "Late spring in North / late autumn in South",
  "July-August": "Summer in North / winter in South",
  "September-October": "Autumn in North / spring in South",
  "November-December": "Early winter in North / early summer in South"
};

// Helper function to get current recommended months based on location
export const getRecommendedMonths = (latitude: number): string[] => {
  const isNorthern = latitude > 0;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  // Return 2-3 month ranges that are optimal for the given hemisphere
  const monthRanges = Object.keys(monthOptions);
  
  if (isNorthern) {
    // Northern hemisphere optimal diving is typically late spring through early autumn
    if (currentMonth >= 4 && currentMonth <= 9) { // May through September
      return monthRanges.slice(2, 4); // May-June, July-August
    } else {
      return [monthRanges[2]]; // Suggest May-June for future planning
    }
  } else {
    // Southern hemisphere optimal diving is typically late spring through early autumn (opposite months)
    if (currentMonth >= 10 || currentMonth <= 3) { // November through March
      return [monthRanges[5], monthRanges[0]]; // Nov-Dec, Jan-Feb
    } else {
      return [monthRanges[5]]; // Suggest Nov-Dec for future planning
    }
  }
};