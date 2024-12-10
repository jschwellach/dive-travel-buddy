import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { InfoModal } from './InfoModal';
import { useOpenAI } from '../hooks/useOpenAI';
import './RecommendationCard.css';

interface RecommendationCardProps {
  title: string;
  content: string;
  imageUrl?: string;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

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
      <div className="recommendation-card">
        <div className="recommendation-card-header">
          <div className="recommendation-card-title">
            <h3><ReactMarkdown>{title}</ReactMarkdown></h3>
          </div>
          <div className="recommendation-card-actions">
            {onToggleFavorite && (
              <button 
                onClick={onToggleFavorite}
                className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '★' : '☆'}
              </button>
            )}
            <button 
              onClick={handleMoreInfo}
              className="more-info-button"
              disabled={isLoading}
              aria-label="Get more information"
            >
              {isLoading ? (
                <>
                  <span className="button-spinner" />
                  Loading...
                </>
              ) : (
                'More Info'
              )}
            </button>
          </div>
        </div>
        {imageUrl && (
          <div className="recommendation-card-image">
            <img src={imageUrl} alt={title} />
          </div>
        )}
        <div className="recommendation-card-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
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
