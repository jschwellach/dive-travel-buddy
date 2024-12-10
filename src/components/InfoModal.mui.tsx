import { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import ReactMarkdown, { Components } from 'react-markdown';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  additionalInfo?: string;
  isLoading?: boolean;
  error?: string | null;
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

export function InfoModal({
  isOpen,
  onClose,
  title,
  content,
  additionalInfo,
  isLoading,
  error,
}: InfoModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <ReactMarkdown components={MarkdownRenderer}>{title}</ReactMarkdown>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="large"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <ReactMarkdown components={MarkdownRenderer}>{content}</ReactMarkdown>
        </Box>
        {(isLoading || additionalInfo || error) && (
          <Box sx={{ mt: 3 }}>
            {isLoading ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={24} />
                <Typography>Loading additional information...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : additionalInfo ? (
              <Box>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                <ReactMarkdown components={MarkdownRenderer}>{additionalInfo}</ReactMarkdown>
              </Box>
            ) : null}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {/* Additional actions can be added here if needed */}
      </DialogActions>
    </Dialog>
  );
}
