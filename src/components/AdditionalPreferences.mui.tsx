/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

import { useState } from 'react';
import { DivePreferences } from '../types/diving';
import { waterTemperatureOptions, visibilityOptions, currentStrengthOptions, maxDepthOptions, regionOptions } from '../types/diving';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

interface AdditionalPreferencesProps {
  preferences: DivePreferences;
  onPreferenceChange: (type: keyof DivePreferences, value: string | string[]) => void;
}

interface PreferenceOption {
  [key: string]: string;
}

const PreferenceSection = ({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: PreferenceOption;
  value: string[];
  onChange: (newValue: string[]) => void;
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" gutterBottom>{title}</Typography>
    <ToggleButtonGroup
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      aria-label={title}
      fullWidth
      size="small"
      sx={{ 
        flexWrap: 'wrap',
        '& .MuiToggleButton-root': {
          flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 auto' },
          py: 0.5
        }
      }}
    >
      {Object.entries(options).map(([option, description]) => (
        <Tooltip key={option} title={description} arrow placement="top">
          <ToggleButton value={option}>
            {option}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  </Box>
);

export const AdditionalPreferences: React.FC<AdditionalPreferencesProps> = ({
  preferences,
  onPreferenceChange,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => handleChange(isExpanded)}
      sx={{ width: '100%' }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="additional-preferences-content"
        id="additional-preferences-header"
      >
        <Typography variant="subtitle1">Additional Preferences</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <PreferenceSection
              title="Water Temperature"
              options={waterTemperatureOptions}
              value={preferences.waterTemperature}
              onChange={(newValue) => onPreferenceChange('waterTemperature', newValue)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PreferenceSection
              title="Visibility"
              options={visibilityOptions}
              value={preferences.visibility}
              onChange={(newValue) => onPreferenceChange('visibility', newValue)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PreferenceSection
              title="Current Strength"
              options={currentStrengthOptions}
              value={preferences.currentStrength}
              onChange={(newValue) => onPreferenceChange('currentStrength', newValue)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PreferenceSection
              title="Maximum Depth"
              options={maxDepthOptions}
              value={preferences.maxDepth}
              onChange={(newValue) => onPreferenceChange('maxDepth', newValue)}
            />
          </Grid>
          <Grid item xs={12}>
            <PreferenceSection
              title="Preferred Regions"
              options={regionOptions}
              value={preferences.regions}
              onChange={(newValue) => onPreferenceChange('regions', newValue)}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default AdditionalPreferences;
