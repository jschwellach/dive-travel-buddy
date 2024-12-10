import ReactMarkdown from 'react-markdown';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  additionalInfo?: string;
  isLoading?: boolean;
  error?: string | null;
}

export function InfoModal({
  isOpen,
  onClose,
  title,
  content,
  additionalInfo,
  isLoading,
  error,
}: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2><ReactMarkdown>{title}</ReactMarkdown></h2>
        <div className="modal-body">
          <div className="original-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          <div className="additional-info">
            <h3>Additional Information</h3>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading additional information...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                {error}
              </div>
            ) : additionalInfo ? (
              <ReactMarkdown>{additionalInfo}</ReactMarkdown>
            ) : (
              <p>No additional information available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
