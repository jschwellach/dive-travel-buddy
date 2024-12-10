/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

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
    <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ 
      pl: 2,
      '& li': {
        mb: 1,
      },
      '& li:last-child': {
        mb: 0,
      }
    }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Box component="li" sx={{ 
      '& p': { 
        display: 'inline',
        m: 0 
      }
    }}>
      {children}
    </Box>
  ),
  strong: ({ children }) => (
    <Typography component="span" sx={{ fontWeight: 'bold' }}>
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
          <Box sx={{ pr: 6 }}>
            <ReactMarkdown components={MarkdownRenderer}>{title}</ReactMarkdown>
          </Box>
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
        <Box sx={{ 
          '& > *:first-of-type': { mt: 0 },
          '& > ul:first-of-type': { mt: 0 }
        }}>
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
              <Box sx={{ 
                '& > *:first-of-type': { mt: 0 },
                '& > ul:first-of-type': { mt: 0 }
              }}>
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

export default InfoModal;
