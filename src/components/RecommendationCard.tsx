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
        <h3>{title}</h3>
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
        {content}
      </div>
    </div>
  );
}