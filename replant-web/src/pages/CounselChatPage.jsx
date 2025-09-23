import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tokens } from '../design/tokens';
import { Button } from '../components/ui';
import MessageBubble from '../components/counsel/MessageBubble';
import { counselService } from '../services/counselService';
import { PageTitle, ScreenReaderOnly } from '../components/ui/ScreenReaderOnly';

const CounselChatPage = () => {
  const [searchParams] = useSearchParams();

  const providerType = searchParams.get('type') || 'chatbot';
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const mockResponses = {
    counselor: [
      "안녕하세요. 오늘 어떤 일로 상담을 받으러 오셨나요?",
      "그런 일이 있으셨군요. 그때 어떤 기분이 드셨나요?",
      "충분히 그렇게 느끼실 수 있겠어요. 더 자세히 말씀해주시겠어요?",
      "좋은 방법이네요. 그런 상황에서는 어떻게 대처하시는 게 좋을까요?",
      "많이 힘드셨을 것 같아요. 지금은 어떤 기분이신가요?",
    ],
    chatbot: [
      "안녕하세요! 저는 Replant AI 상담봇이에요. 어떤 고민이 있으신지 편하게 말씀해주세요 😊",
      "그런 상황이시군요. 그럴 때는 정말 힘들 것 같아요. 어떤 부분이 가장 어려우신가요?",
      "이해해요. 비슷한 경험을 하신 분들이 많아요. 혹시 이런 방법은 어떠세요?",
      "좋은 생각이에요! 작은 변화부터 시작하는 것도 도움이 될 수 있어요 🌱",
      "잘 하고 계세요. 자신을 돌보는 것도 중요하답니다. 오늘 하루 어떠셨나요?",
    ]
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSessionId = counselService.generateSessionId();
        setSessionId(newSessionId);
        
        const existingMessages = await counselService.getSessionMessages(newSessionId);
        
        if (existingMessages.length > 0) {
          const formattedMessages = existingMessages.map(msg => ({
            id: msg.id,
            message: msg.message,
            isUser: msg.is_user,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formattedMessages);
                  } else {
            const welcomeMessage = {
            message: providerType === 'counselor' 
              ? "안녕하세요. 전문 상담사 김민지입니다. 편안하게 대화해보세요."
              : "안녕하세요! Replant AI 상담봇입니다. 어떤 고민이든 편하게 말씀해주세요 😊",
            isUser: false
          };
          
          const savedMessage = await counselService.saveMessage(newSessionId, welcomeMessage.message, false);
          
          setMessages([{
            id: savedMessage.id,
            message: savedMessage.message,
            isUser: savedMessage.is_user,
            timestamp: new Date(savedMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (error) {
        const welcomeMessage = {
          id: 1,
          message: providerType === 'counselor' 
            ? "안녕하세요. 전문 상담사 김민지입니다. 편안하게 대화해보세요."
            : "안녕하세요! Replant AI 상담봇입니다. 어떤 고민이든 편하게 말씀해주세요 😊",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([welcomeMessage]);
      }
    };
    
    initializeSession();
  }, [providerType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    try {
      const savedUserMessage = await counselService.saveMessage(sessionId, inputMessage, true);
      
      const userMessage = {
        id: savedUserMessage.id,
        message: savedUserMessage.message,
        isUser: true,
        timestamp: new Date(savedUserMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      // AI 응답 생성 및 저장
      setTimeout(async () => {
        try {
          const responses = mockResponses[providerType];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          const savedBotMessage = await counselService.saveMessage(sessionId, randomResponse, false);
          
          const botMessage = {
            id: savedBotMessage.id,
            message: savedBotMessage.message,
            isUser: false,
            timestamp: new Date(savedBotMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          const responses = mockResponses[providerType];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          const botMessage = {
            id: Date.now() + 1,
            message: randomResponse,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => [...prev, botMessage]);
        } finally {
          setIsLoading(false);
        }
      }, 1000 + Math.random() * 2000);
      
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colors.background.primary,
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    borderBottom: `1px solid ${tokens.colors.border.light}`,
    position: 'sticky',
    top: 0,
    zIndex: tokens.zIndex.sticky,
  };



  const headerTitleStyle = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  };

  const headerSubtitleStyle = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing[1],
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacing[4]} 0`,
    backgroundColor: tokens.colors.background.secondary,
  };

  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background.primary,
    borderTop: `1px solid ${tokens.colors.border.light}`,
    gap: tokens.spacing[2],
  };

  const inputStyle = {
    flex: 1,
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border.light}`,
    fontSize: tokens.typography.fontSize.sm,
    backgroundColor: tokens.colors.background.primary,
    color: tokens.colors.text.primary,
    caretColor: tokens.colors.text.primary,
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    outline: 'none',
  };

  const sendButtonStyle = {
    minWidth: '60px',
  };

  return (
    <div style={pageStyle} role="main" aria-label="상담 채팅">
      <PageTitle title="상담 채팅" />
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={headerTitleStyle}>
            {providerType === 'counselor' ? '전문 상담사' : 'AI 챗봇'}
          </div>
          <div style={headerSubtitleStyle}>
            {providerType === 'counselor' ? '김민지 상담사' : 'Replant AI 상담봇'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        style={messagesContainerStyle}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="false"
        id="chat-log"
      >
        {messages.map((msg, index) => (
          <MessageBubble
            key={`${msg.id ?? 'msg'}-${index}`}
            message={msg.message}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            providerType={providerType}
          />
        ))}
        {isLoading && (
          <MessageBubble
            message="메시지를 입력 중..."
            isUser={false}
            providerType={providerType}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputContainerStyle}>
        <label htmlFor="chat-input">
          <ScreenReaderOnly>메시지</ScreenReaderOnly>
        </label>
        <textarea
          id="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          style={inputStyle}
          rows={1}
          aria-describedby="chat-help"
        />
        <ScreenReaderOnly id="chat-help">
          Enter 키로 전송하고, 줄바꿈은 Shift + Enter를 사용하세요.
        </ScreenReaderOnly>
        <Button
          variant="primary"
          size="base"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          style={sendButtonStyle}
          aria-label="메시지 전송"
          aria-controls="chat-log"
        >
          전송
        </Button>
      </div>
    </div>
  );
};

export default CounselChatPage;