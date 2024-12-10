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
  <Box sx={{ my: 2 }}>
    <Typography variant="h6" gutterBottom>{title}</Typography>
    <ToggleButtonGroup
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      aria-label={title}
      multiple
      fullWidth
      sx={{ 
        flexWrap: 'wrap',
        '& .MuiToggleButton-root': {
          flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.33% - 8px)' },
          m: 0.5,
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
        <Typography variant="h5">Additional Preferences</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 2 }}>
          <PreferenceSection
            title="Water Temperature"
            options={waterTemperatureOptions}
            value={preferences.waterTemperature}
            onChange={(newValue) => onPreferenceChange('waterTemperature', newValue)}
          />

          <PreferenceSection
            title="Visibility"
            options={visibilityOptions}
            value={preferences.visibility}
            onChange={(newValue) => onPreferenceChange('visibility', newValue)}
          />

          <PreferenceSection
            title="Current Strength"
            options={currentStrengthOptions}
            value={preferences.currentStrength}
            onChange={(newValue) => onPreferenceChange('currentStrength', newValue)}
          />

          <PreferenceSection
            title="Maximum Depth"
            options={maxDepthOptions}
            value={preferences.maxDepth}
            onChange={(newValue) => onPreferenceChange('maxDepth', newValue)}
          />

          <PreferenceSection
            title="Preferred Regions"
            options={regionOptions}
            value={preferences.regions}
            onChange={(newValue) => onPreferenceChange('regions', newValue)}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};