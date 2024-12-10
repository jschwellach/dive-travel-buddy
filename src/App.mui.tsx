import { useState, useEffect } from "react";
import { useInitialRecommendations } from "./hooks/useInitialRecommendations";
import { useOpenAI } from "./hooks/useOpenAI";
import { useRecommendationHistory } from "./hooks/useRecommendationHistory";
import { useFavoriteDestinations } from "./hooks/useFavoriteDestinations";
import { RecommendationCard } from "./components/RecommendationCard.mui";
import { DivePreferences, ProcessedResponse } from './types/diving';
import { monthOptions } from './config/seasons';
import { AdditionalPreferences } from "./components/AdditionalPreferences.mui";

// Material-UI imports
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface ExperienceLevels {
  [key: string]: string;
}

function App() {
  const [preferences, setPreferences] = useState<DivePreferences>({
    experienceLevel: "",
    interests: [],
    season: [],
    waterTemperature: [],
    visibility: [],
    currentStrength: [],
    maxDepth: [],
    regions: []
  });

  const { isLoading: isOpenAILoading, error, streamedResponse, getRecommendations } = useOpenAI();
  const { history, addToHistory, clearHistory } = useRecommendationHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoriteDestinations();
  const { isLoading: isCacheLoading, cachedRecommendations } = useInitialRecommendations(getRecommendations);

  const isLoading = isOpenAILoading || isCacheLoading;
  const displayedResponse = streamedResponse || cachedRecommendations;

  useEffect(() => {
    if (streamedResponse && streamedResponse.trim() !== "" && !isOpenAILoading) {
      addToHistory({ ...preferences }, streamedResponse);
    }
  }, [streamedResponse, isOpenAILoading, preferences, addToHistory]);

  useEffect(() => {
    if (streamedResponse && !isOpenAILoading) {
      localStorage.setItem('initialRecommendations', JSON.stringify({
        recommendations: streamedResponse,
        timestamp: Date.now()
      }));
    }
  }, [streamedResponse, isOpenAILoading]);

  const experienceLevels: ExperienceLevels = {
    "Beginner": "No diving certification. Want to do OpenWater course)",
    "Open Water": "Basic certification (PADI/SSI Open Water Diver or equivalent)",
    "Advanced": "Advanced certification (PADI/SSI Advanced Open Water or equivalent)",
    "Rescue": "Rescue Diver certification (PADI/SSI Rescue Diver or equivalent)",
    "Professional": "Professional level (Divemaster/Instructor or equivalent)",
    "Technical": "Technical diving certification (TDI/PADI Tec certifications)"
  };

  const handlePreferenceChange = (type: keyof DivePreferences, value: string | string[]): void => {
    setPreferences((prev) => {
      if (Array.isArray(prev[type])) {
        if (Array.isArray(value)) {
          return { ...prev, [type]: value };
        }
        const currentArray = prev[type] as string[];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];
        return { ...prev, [type]: newArray };
      }
      return { ...prev, [type]: value };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !preferences.experienceLevel ||
      preferences.interests.length === 0 ||
      preferences.season.length === 0
    ) {
      alert("Please select all preferences");
      return;
    }
    await getRecommendations(preferences);
  };

  const handleToggleFavorite = (title: string, content: string) => {
    const favorite = favorites.find(f => f.title === title);
    if (favorite) {
      removeFromFavorites(favorite.id);
    } else {
      addToFavorites(title, content);
    }
  };

  const processLocations = (text: string): ProcessedResponse => {
    const sections = text.split('---').map(section => section.trim());
    const title = sections[0]?.replace(/^##\s*/, '').trim() || '';
    const locations = sections
      .filter(section => section.startsWith('### '))
      .map(section => {
        const titleMatch = section.match(/### \d+\.\s*([^\n]+)/);
        const locationTitle = titleMatch ? titleMatch[1].trim() : '';
        const content = section
          .replace(/### \d+\.\s*[^\n]+/, '')
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n');
        return { title: locationTitle, content: content };
      })
      .filter(location => location.title && location.content);
    const summary = sections[sections.length - 1]?.replace(/^(#*|\*).?Summary(\**)?:?/, '').trim() || '';
    return { title, locations, summary };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component="header" sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Dive Travel Buddy
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Find your perfect diving destination
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Experience Level</Typography>
          <ToggleButtonGroup
            value={preferences.experienceLevel}
            exclusive
            onChange={(_, value) => handlePreferenceChange("experienceLevel", value)}
            fullWidth
            sx={{ flexWrap: 'wrap' }}
          >
            {Object.entries(experienceLevels).map(([level, description]) => (
              <Tooltip key={level} title={description} arrow>
                <ToggleButton value={level} sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}>
                  {level}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Diving Interests</Typography>
          <ToggleButtonGroup
            value={preferences.interests}
            onChange={(_, value) => handlePreferenceChange("interests", value)}
            multiple
            fullWidth
            sx={{ flexWrap: 'wrap' }}
          >
            {["Coral Reefs", "Wreck Diving", "Marine Life", "Cave Diving"].map((interest) => (
              <ToggleButton
                key={interest}
                value={interest}
                sx={{ flex: { xs: '1 1 50%', sm: '1 1 auto' } }}
              >
                {interest}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Travel Season</Typography>
          <ToggleButtonGroup
            value={preferences.season}
            onChange={(_, value) => handlePreferenceChange("season", value)}
            multiple
            fullWidth
            sx={{ flexWrap: 'wrap' }}
          >
            {Object.entries(monthOptions).map(([months, description]) => (
              <Tooltip key={months} title={description} arrow>
                <ToggleButton value={months} sx={{ flex: { xs: '1 1 50%', sm: '1 1 auto' } }}>
                  {months}
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>

        <AdditionalPreferences
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSubmit}
        disabled={isLoading}
        sx={{ mb: 4 }}
        startIcon={isLoading && <CircularProgress size={24} color="inherit" />}
      >
        {isLoading ? "Finding Perfect Destinations..." : "Find My Perfect Destination"}
      </Button>

      {displayedResponse && displayedResponse.trim() !== "" && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom align="center">
            {processLocations(displayedResponse).title}
          </Typography>
          <Grid container spacing={3}>
            {processLocations(displayedResponse).locations.map((location, index) => (
              location.title && location.content && (
                <Grid item xs={12} md={6} key={index}>
                  <RecommendationCard
                    title={location.title}
                    content={location.content}
                    isFavorite={isFavorite(location.title)}
                    onToggleFavorite={() => handleToggleFavorite(location.title, location.content)}
                  />
                </Grid>
              )
            ))}
          </Grid>
          {processLocations(displayedResponse).summary && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>Summary</Typography>
              <Typography>{processLocations(displayedResponse).summary}</Typography>
            </Box>
          )}
        </Box>
      )}

      {favorites && favorites.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>Favorite Destinations</Typography>
          <Grid container spacing={3}>
            {favorites.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <RecommendationCard
                  title={item.title}
                  content={item.content}
                  isFavorite={true}
                  onToggleFavorite={() => removeFromFavorites(item.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {history && history.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Previous Recommendations</Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearHistory}
            >
              Clear History
            </Button>
          </Box>
          {history.map((item) => (
            <Paper key={item.id} elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" display="block" gutterBottom>
                  {item.timestamp}
                </Typography>
                <Typography><strong>Experience:</strong> {item.preferences.experienceLevel}</Typography>
                <Typography><strong>Interests:</strong> {item.preferences.interests.join(", ")}</Typography>
                <Typography><strong>Season:</strong> {item.preferences.season.join(", ")}</Typography>
                {item.preferences.waterTemperature.length > 0 && (
                  <Typography><strong>Water Temperature:</strong> {item.preferences.waterTemperature.join(", ")}</Typography>
                )}
                {item.preferences.visibility.length > 0 && (
                  <Typography><strong>Visibility:</strong> {item.preferences.visibility.join(", ")}</Typography>
                )}
                {item.preferences.currentStrength.length > 0 && (
                  <Typography><strong>Current:</strong> {item.preferences.currentStrength.join(", ")}</Typography>
                )}
                {item.preferences.maxDepth.length > 0 && (
                  <Typography><strong>Max Depth:</strong> {item.preferences.maxDepth.join(", ")}</Typography>
                )}
                {item.preferences.regions.length > 0 && (
                  <Typography><strong>Regions:</strong> {item.preferences.regions.join(", ")}</Typography>
                )}
              </Box>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h5" gutterBottom>
                {processLocations(item.recommendation).title}
              </Typography>
              <Grid container spacing={3}>
                {processLocations(item.recommendation).locations.map((location, index) => (
                  location.title && location.content && (
                    <Grid item xs={12} md={6} key={index}>
                      <RecommendationCard
                        title={location.title}
                        content={location.content}
                        isFavorite={isFavorite(location.title)}
                        onToggleFavorite={() => handleToggleFavorite(location.title, location.content)}
                      />
                    </Grid>
                  )
                ))}
              </Grid>
              {processLocations(item.recommendation).summary && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Typography>{processLocations(item.recommendation).summary}</Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default App;