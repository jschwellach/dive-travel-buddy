import { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ReactMarkdown, { Components } from 'react-markdown';
import { useState } from 'react';
import { InfoModal } from './InfoModal.mui';
import { useOpenAI } from '../hooks/useOpenAI';

interface RecommendationCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

// Custom renderer for ReactMarkdown to use MUI Typography
const MarkdownRenderer: Components = {
  p: ({ children }) => (
    <Typography variant="body1" paragraph>
      {children}
    </Typography>
  ),
  h1: ({ children }) => (
    <Typography variant="h4" gutterBottom>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" gutterBottom>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" gutterBottom>
      {children}
    </Typography>
  ),
};

export function RecommendationCard({ 
  title, 
  content, 
  imageUrl,
  onToggleFavorite, 
  isFavorite 
}: RecommendationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getAdditionalInfo, isLoading, error, streamedResponse } = useOpenAI();

  const handleMoreInfo = async () => {
    setIsModalOpen(true);
    await getAdditionalInfo(title, content);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={<ReactMarkdown components={MarkdownRenderer}>{title}</ReactMarkdown>}
          action={
            onToggleFavorite && (
              <IconButton
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                color="primary"
              >
                {isFavorite ? <Star /> : <StarBorder />}
              </IconButton>
            )
          }
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
            }}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <ReactMarkdown components={MarkdownRenderer}>
            {content}
          </ReactMarkdown>
        </CardContent>
        <CardActions>
          <Button
            onClick={handleMoreInfo}
            disabled={isLoading}
            variant="contained"
            color="primary"
            fullWidth
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {isLoading ? 'Loading...' : 'More Info'}
          </Button>
        </CardActions>
      </Card>
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        content={content}
        additionalInfo={streamedResponse}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
