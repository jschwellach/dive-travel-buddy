import ReactMarkdown from 'react-markdown';

interface RecommendationCardProps {
  title: string;
  content: string;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function RecommendationCard({ 
  title, 
  content, 
  onToggleFavorite, 
  isFavorite 
}: RecommendationCardProps) {
  return (
    <div className="recommendation-card">
      <div className="recommendation-card-header">
        <div className="recommendation-card-title">
          <h3><ReactMarkdown>{title}</ReactMarkdown></h3>
        </div>
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <div className="recommendation-card-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
