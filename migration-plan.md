# UI Migration Plan

## Current Setup
- Material-UI is already installed (@mui/material v5.15.1)
- @emotion/react and @emotion/styled are installed
- Currently using custom CSS files and basic HTML elements

## Component Migration Plan

### 1. RecommendationCard Component
Convert to use:
- Card, CardContent, CardHeader, CardActions from @mui/material
- IconButton for favorite button
- Button for "More Info"
- Typography for text elements
- Star/StarBorder icons from @mui/icons-material

### 2. InfoModal Component
Convert to use:
- Dialog, DialogTitle, DialogContent from @mui/material
- IconButton for close button
- CircularProgress for loading spinner

### 3. AdditionalPreferences Component
Convert to use:
- Accordion, AccordionSummary, AccordionDetails
- ToggleButtonGroup and ToggleButton for preference selections
- Typography for headings
- Tooltip for preference descriptions

### 4. App.tsx
Convert to use:
- Container for layout
- Typography for headings
- Grid for recommendation layouts
- Button for main action button
- Divider for sections

## Implementation Steps
1. Start with RecommendationCard as it's the most reused component
2. Implement InfoModal next as it's used by RecommendationCard
3. Convert AdditionalPreferences
4. Update App.tsx layout and components
5. Remove unused CSS files after migration