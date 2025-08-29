import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Avatar,
  Paper,
  CircularProgress,
  styled,
  Alert,
  Skeleton,
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon, SmartToy as AIIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { aiService } from '../services/aiService';
import DOMPurify from 'dompurify';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  overflowY: 'auto',
  flexGrow: 1,
}));

const Message = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: '80%',
  borderRadius: theme.shape.borderRadius * 2,
}));

const UserMessage = styled(Message)(({ theme }) => ({
  alignSelf: 'flex-end',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const AIMessage = styled(Message)(({ theme }) => ({
  alignSelf: 'flex-start',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '& img': {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    display: 'block',
    height: 'auto',
  },
  '& .db-object': {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  '& pre': {
    backgroundColor: 'rgba(31, 184, 170, 0.1)',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    overflowX: 'auto',
    width: '100%',
  },
}));

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  image?: string; // Optional base64 image
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onHighlightInvoice: (id: string) => void;
}

/**
 * Image component with fallback for loading errors
 */
const ImageWithFallback: React.FC<{ src: string; alt: string; style?: React.CSSProperties }> = ({
  src,
  alt,
  style,
}) => {
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Failed to load image visualization
      </Alert>
    );
  }

  return (
    <>
      {loading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          animation="wave"
          sx={{ borderRadius: 2 }}
        />
      )}
      <img
        src={src}
        alt={alt}
        style={{
          ...style,
          display: loading ? 'none' : 'block',
        }}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
};

/**
 * Chat drawer component for AI assistant
 */
const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onClose, onHighlightInvoice }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add click event listeners to db-object spans
  useEffect(() => {
    if (!messageContainerRef.current) return;

    const container = messageContainerRef.current;
    const dbObjects = container.querySelectorAll('.db-object');

    dbObjects.forEach((obj) => {
      obj.addEventListener('click', () => {
        const id = obj.getAttribute('data-id');
        if (id) {
          onHighlightInvoice(id);
        }
      });
    });

    return () => {
      dbObjects.forEach((obj) => {
        const id = obj.getAttribute('data-id');
        if (id) {
          obj.removeEventListener('click', () => onHighlightInvoice(id));
        }
      });
    };
  }, [messages, onHighlightInvoice]);

  // Render HTML content safely
  const renderMessageContent = (content: string) => {
    // Ensure we're not trying to render null or undefined
    if (!content) return null;

    const sanitizedContent = DOMPurify.sanitize(content);
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  };

  // Check if the response contains a valid base64 image string
  const isValidBase64Image = (str: string | undefined): boolean => {
    if (!str) return false;

    return true;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.askAboutData({ query: input });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.error || response.response,
        isUser: false,
        timestamp: new Date(),
        image: isValidBase64Image(response.image) ? response.image : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: 500,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 500,
          boxSizing: 'border-box',
        },
      }}>
      <DrawerHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="inherit" />
          <Typography variant="h6" fontWeight="bold">
            AI Assistant
          </Typography>
        </Box>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <MessageContainer ref={messageContainerRef}>
          {messages.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                opacity: 0.7,
                textAlign: 'center',
                p: 3,
              }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 60,
                  height: 60,
                  mb: 2,
                }}>
                AI
              </Avatar>
              <Typography variant="body1" gutterBottom>
                I can help you analyze your invoice data.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try asking something like "Show me overdue invoices" or "Which vendor has the
                highest total billed amount?"
              </Typography>
            </Box>
          )}

          {messages.map((message) =>
            message.isUser ? (
              <UserMessage key={message.id} elevation={0}>
                <Typography variant="body1">{message.content}</Typography>
              </UserMessage>
            ) : (
              <AIMessage key={message.id} elevation={0}>
                {message.content && renderMessageContent(message.content)}
                {message.image && (
                  <Box sx={{ mt: message.content ? 2 : 0 }}>
                    <ImageWithFallback
                      src={message.image}
                      alt="AI generated visualization"
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  </Box>
                )}
              </AIMessage>
            ),
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} color="primary" />
            </Box>
          )}

          <div ref={messagesEndRef} />
        </MessageContainer>

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: theme.spacing(1) }}>
            <TextField
              fullWidth
              placeholder="Ask me about your invoices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              variant="outlined"
              size="small"
              disabled={isLoading}
              InputProps={{
                sx: {
                  borderRadius: theme.shape.borderRadius * 2,
                },
              }}
            />
            <Button
              type="submit"
              variant="text"
              color="primary"
              disabled={!input.trim() || isLoading}
              sx={{
                minWidth: 'auto',
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SendIcon />
            </Button>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;
