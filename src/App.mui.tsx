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

const PreferenceSection = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>{title}</Typography>
    {children}
  </Box>
);

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
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);

  const { isLoading: isOpenAILoading, error, streamedResponse, getRecommendations } = useOpenAI();
  const { history, addToHistory, clearHistory } = useRecommendationHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoriteDestinations();
  const { isLoading: isCacheLoading, cachedRecommendations } = useInitialRecommendations(getRecommendations);

  const isLoading = isOpenAILoading || isCacheLoading;
  const displayedResponse = streamedResponse || cachedRecommendations;

  useEffect(() => {
    if (!isOpenAILoading && streamedResponse) {
      setIsStreamingComplete(true);
    } else if (isOpenAILoading) {
      setIsStreamingComplete(false);
    }
  }, [isOpenAILoading, streamedResponse]);

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
    <Box sx={{ py: 4 }}>
      <Container maxWidth="xl">
        <Box component="header" sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Dive Travel Buddy
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Find your perfect diving destination
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Search Preferences */}
          <Grid item xs={12} lg={3}>
            <Box 
              sx={{ 
                position: 'sticky', 
                top: 16, 
                height: 'calc(100vh - 32px)',
                overflowY: 'auto'
              }}
            >
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Search Preferences</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <PreferenceSection title="Experience Level">
                      <ToggleButtonGroup
                        value={preferences.experienceLevel}
                        exclusive
                        onChange={(_, value) => handlePreferenceChange("experienceLevel", value)}
                        fullWidth
                        size="small"
                        sx={{ 
                          flexWrap: 'wrap',
                          '& .MuiToggleButton-root': {
                            flex: '1 1 100%',
                            py: 0.5
                          }
                        }}
                      >
                        {Object.entries(experienceLevels).map(([level, description]) => (
                          <Tooltip key={level} title={description} arrow>
                            <ToggleButton value={level}>
                              {level}
                            </ToggleButton>
                          </Tooltip>
                        ))}
                      </ToggleButtonGroup>
                    </PreferenceSection>
                  </Grid>

                  <Grid item xs={12}>
                    <PreferenceSection title="Diving Interests">
                      <ToggleButtonGroup
                        value={preferences.interests}
                        onChange={(_, value) => handlePreferenceChange("interests", value)}
                        fullWidth
                        size="small"
                        sx={{ 
                          flexWrap: 'wrap',
                          '& .MuiToggleButton-root': {
                            flex: '1 1 100%',
                            py: 0.5
                          }
                        }}
                      >
                        {["Coral Reefs", "Wreck Diving", "Marine Life", "Cave Diving"].map((interest) => (
                          <ToggleButton key={interest} value={interest}>
                            {interest}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </PreferenceSection>
                  </Grid>

                  <Grid item xs={12}>
                    <PreferenceSection title="Travel Season">
                      <ToggleButtonGroup
                        value={preferences.season}
                        onChange={(_, value) => handlePreferenceChange("season", value)}
                        fullWidth
                        size="small"
                        sx={{ 
                          flexWrap: 'wrap',
                          '& .MuiToggleButton-root': {
                            flex: '1 1 100%',
                            py: 0.5
                          }
                        }}
                      >
                        {Object.entries(monthOptions).map(([months, description]) => (
                          <Tooltip key={months} title={description} arrow>
                            <ToggleButton value={months}>
                              {months}
                            </ToggleButton>
                          </Tooltip>
                        ))}
                      </ToggleButtonGroup>
                    </PreferenceSection>
                  </Grid>

                  <Grid item xs={12}>
                    <AdditionalPreferences
                      preferences={preferences}
                      onPreferenceChange={handlePreferenceChange}
                    />
                  </Grid>

                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleSubmit}
                      disabled={isLoading}
                      startIcon={isLoading && <CircularProgress size={24} color="inherit" />}
                    >
                      {isLoading ? "Finding Perfect Destinations..." : "Find My Perfect Destination"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>

          {/* Middle Column - Recommendations */}
          <Grid item xs={12} lg={6} sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
            {displayedResponse && displayedResponse.trim() !== "" && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Recommendations</Typography>
                <Typography variant="h5" gutterBottom align="center">
                  {processLocations(displayedResponse).title}
                </Typography>

                {/* Only show summary when streaming is complete */}
                {isStreamingComplete && processLocations(displayedResponse).summary && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Summary</Typography>
                    <Typography>{processLocations(displayedResponse).summary}</Typography>
                  </Box>
                )}

                {/* Show loading animation while streaming */}
                {!isStreamingComplete && isLoading && (
                  <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography>Generating Summary...</Typography>
                  </Box>
                )}

                <Grid container spacing={3}>
                  {processLocations(displayedResponse).locations.map((location, index) => (
                    location.title && location.content && (
                      <Grid item xs={12} key={index}>
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
              </Paper>
            )}

            {history && history.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Previous Recommendations</Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearHistory}
                    size="small"
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
                          <Grid item xs={12} key={index}>
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
              </Paper>
            )}
          </Grid>

          {/* Right Column - Favorites */}
          <Grid item xs={12} lg={3}>
            {favorites && favorites.length > 0 && (
              <Box 
                sx={{ 
                  position: 'sticky', 
                  top: 16,
                  height: 'calc(100vh - 32px)',
                  overflowY: 'auto'
                }}
              >
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Favorite Destinations</Typography>
                  <Grid container spacing={2}>
                    {favorites.map((item) => (
                      <Grid item xs={12} key={item.id}>
                        <RecommendationCard
                          title={item.title}
                          content={item.content}
                          isFavorite={true}
                          onToggleFavorite={() => removeFromFavorites(item.id)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
