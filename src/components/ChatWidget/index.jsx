import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Avatar, Tooltip, message, Popconfirm, Card, Tag, Typography, Divider } from 'antd';
const { Text } = Typography;
import { 
  RobotOutlined, 
  UserOutlined, 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined,
  DeleteOutlined,
  CustomerServiceOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { chatbotAPI } from '../../api';
import './ChatWidget.css';

const SESSION_KEY = 'chatbot_session_v1';
const MESSAGES_KEY = 'chatbot_messages_v1';

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ... (keep parseOrderData and OrderInfoCard as is) ...
const parseOrderData = (text) => {
    if (!text || typeof text !== 'string') return null;
    
    // Check if text looks like order info
    if (!text.includes('tra cứu thông tin đơn hàng') && !text.includes('Order ID:')) return null;

    try {
        const orderIdMatch = text.match(/\*\*([A-Za-z0-9]+)\*\*/); // Matches **ORD...**
        const statusMatch = text.match(/Trạng thái.*:\*\* (.*?)(?:\.|$)/i) || text.match(/Trạng thái.*:\*\* (.*?)$/m);
        const totalMatch = text.match(/Tổng tiền.*:\*\* (.*?)(?:đ|\.|$)/i);
        const dateMatch = text.match(/Ngày đặt.*:\*\* (.*?)(?:\.|$)/i);
        const paymentMatch = text.match(/Thanh toán.*:\*\* (.*?)(?:\.|$)/i);
        const productMatch = text.match(/Sản phẩm.*:\*\* (.*?)(?:\.|$)/i);

        if (orderIdMatch) {
            return {
                orderId: orderIdMatch[1],
                status: statusMatch ? statusMatch[1].replace(/\*\*/g, '').trim() : 'Không xác định',
                total: totalMatch ? totalMatch[1].trim() : '0',
                date: dateMatch ? dateMatch[1].trim() : '',
                payment: paymentMatch ? paymentMatch[1].replace(/\*\*/g, '').trim() : '',
                products: productMatch ? productMatch[1].trim() : ''
            };
        }
    } catch (e) {
        return null;
    }
    return null;
};

const OrderInfoCard = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ 
            width: '100%', 
            minWidth: '260px', /* Prevent squashing */
            maxWidth: '100%',
            marginTop: 12, 
            marginBottom: 4,
            borderRadius: 12, 
            overflow: 'hidden', 
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            backgroundColor: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        }}>
            {/* Header: ID & Status */}
            <div style={{ 
                background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)', 
                padding: '10px 14px', 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 8
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                    <ShoppingOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                    <Text strong style={{ color: '#0050b3', fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {data.orderId}
                    </Text>
                </div>
                <Tag color={data.status.includes('Chờ') ? 'orange' : 'green'} style={{ margin: 0, fontSize: 11, borderRadius: 10, px: 8 }}>
                    {data.status.split('(')[0].trim()} {/* Shorten status text if long */}
                </Tag>
            </div>

            {/* Body: Product Info */}
            <div style={{ padding: '12px 14px' }}>
                <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Sản phẩm</div>
                    <Text style={{ fontSize: 13, color: '#262626', lineHeight: '1.4', display: 'block' }}>
                        {data.products}
                    </Text>
                </div>
                
                <Divider style={{ margin: '8px 0' }} />

                {/* Footer Info: Price, Date, Payment */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                    <div>
                         {data.date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                                <CalendarOutlined /> {data.date}
                            </div>
                        )}
                        {data.payment && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8c8c8c' }}>
                                <CreditCardOutlined /> {data.payment}
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 2 }}>Tổng tiền</div>
                        <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
                            {data.total}đ
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Session & Load History
  useEffect(() => {
     let storedSession = localStorage.getItem(SESSION_KEY);
     if (!storedSession) {
         storedSession = generateUUID();
         localStorage.setItem(SESSION_KEY, storedSession);
     }
     setSessionId(storedSession);

     // Load messages from local storage
     const storedMessages = localStorage.getItem(MESSAGES_KEY);
     if (storedMessages) {
         try {
             setMessages(JSON.parse(storedMessages));
         } catch (e) {
             console.error("Failed to parse stored messages");
         }
     }
  }, []);

  // Fetch Suggestions when opened (or session ready)
  useEffect(() => {
      if (sessionId) {
          fetchSuggestions();
      }
  }, [sessionId]);

  // Persist messages to local storage whenever they change
  useEffect(() => {
      if (messages.length > 0) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
      scrollToBottom();
  }, [messages, isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
      if (isOpen && inputRef.current) {
          setTimeout(() => inputRef.current.focus(), 100);
      }
  }, [isOpen]);

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSuggestions = async () => {
      try {
          const res = await chatbotAPI.getSuggestions();
          if (res.success && res.data) {
              setSuggestions(res.data);
          }
      } catch (error) {
          // Silent fail for suggestions
      }
  };

  const handleSendMessage = async (msgText = input) => {
      if (!msgText.trim()) return;

      const userMsg = { role: 'user', content: msgText };
      const newMessages = [...messages, userMsg];
      
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      // Map history for API: 'ai' -> 'model', 'user' -> 'user'
      const history = messages.map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          content: msg.content || ''
      }));

      console.log("Sending payload:", { message: msgText, sessionId, history });

      try {
          const res = await chatbotAPI.sendMessage(msgText, sessionId, history);
          if (res.success && res.data) {
              const aiMsg = { role: 'ai', content: res.data.message }; 
              setMessages(prev => [...prev, aiMsg]);
          } else {
              message.error('Không thể nhận phản hồi từ AI');
          }
      } catch (error) {
          console.error("Send message error details:", error.response?.data || error);
          const errorMsg = { role: 'ai', content: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' };
          setMessages(prev => [...prev, errorMsg]);
      } finally {
          setLoading(false);
      }
  };

  const handleClearHistory = () => {
      setMessages([]);
      localStorage.removeItem(MESSAGES_KEY);
      message.success('Đã xóa lịch sử chat');
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          handleSendMessage();
      }
  };

  return (
    <div className="chat-widget-container">
       {/* Chat Window */}
       <div className={`chat-window ${isOpen ? 'open' : ''}`}>
           {/* Header */}
           <div className="chat-header">
               <div className="header-info">
                   <div className="ai-avatar-header">
                       <RobotOutlined style={{ fontSize: 18 }} />
                   </div>
                   <div className="chat-title">
                       <h3>Trợ Lý Ảo AI</h3>
                       <div className="chat-status">
                           <div className="status-dot"></div>
                           Online
                       </div>
                   </div>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                    <Popconfirm 
                        title="Xóa lịch sử trò chuyện?" 
                        onConfirm={handleClearHistory}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="bottomRight"
                    >
                        <Tooltip title="Xóa lịch sử">
                            <Button type="text" icon={<DeleteOutlined />} style={{ color: 'white' }} />
                        </Tooltip>
                    </Popconfirm>
                    <Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} style={{ color: 'white' }} />
               </div>
           </div>

           {/* Messages List */}
           <div className="chat-messages">
               {messages.length === 0 && (
                   <div style={{ textAlign: 'center', color: '#999', marginTop: 40, padding: '0 20px' }}>
                       <CustomerServiceOutlined style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }} />
                       <p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>
                   </div>
               )}
               

               {messages.map((msg, index) => (
                   <div key={index} className={`message-wrapper ${msg.role}`}>
                       {msg.role === 'ai' && (
                           <div className="avatar ai">
                               <RobotOutlined />
                           </div>
                       )}
                       <div className="message-content">
                           {(() => {
                               // Check for Order Info Card in AI messages
                               const orderData = msg.role === 'ai' ? parseOrderData(msg.content) : null;
                               
                               if (orderData) {
                                   const introText = msg.content.split('tra cứu thông tin đơn hàng')[0];
                                   const outroText = msg.content.match(/Nếu bạn cần hỗ trợ.*/)?.[0] || '';

                                   return (
                                       <>
                                           <div>{introText}tra cứu thông tin đơn hàng <b>{orderData.orderId}</b>:</div>
                                           <OrderInfoCard data={orderData} />
                                           {outroText && <div style={{ marginTop: 8, fontSize: 13, borderTop:'1px dashed #ddd', paddingTop: 4 }}>{outroText}</div>}
                                       </>
                                   );
                               }
                               return msg.content;
                           })()}
                       </div>
                       {msg.role === 'user' && (
                           <div className="avatar user">
                               <UserOutlined />
                           </div>
                       )}
                   </div>
               ))}
               
               {loading && (
                   <div className="message-wrapper ai">
                        <div className="avatar ai">
                               <RobotOutlined />
                        </div>
                        <div className="message-content" style={{ minWidth: 40 }}>
                             <div className="chat-loader">
                                 <div className="dot"></div>
                                 <div className="dot"></div>
                                 <div className="dot"></div>
                             </div>
                        </div>
                   </div>
               )}
               <div ref={messagesEndRef} />
           </div>

           {/* Suggestions */}
           {suggestions.length > 0 && !loading && (
               <div className="suggestions-container">
                   {suggestions.map((sug, idx) => (
                       <div key={idx} className="suggestion-chip" onClick={() => handleSendMessage(sug)}>
                           {sug}
                       </div>
                   ))}
               </div>
           )}

           {/* Input Area */}
           <div className="chat-input-area">
               <input 
                   ref={inputRef}
                   type="text" 
                   className="chat-input" 
                   placeholder="Nhập tin nhắn..." 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={handleKeyDown}
                   disabled={loading}
               />
               <button 
                   className="send-btn" 
                   onClick={() => handleSendMessage()}
                   disabled={!input.trim() || loading}
               >
                   <SendOutlined />
               </button>
           </div>
       </div>

       {/* Toggle Button */}
       <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
           {isOpen ? <CloseOutlined /> : <MessageOutlined />}
       </button>
    </div>
  );
};

export default ChatWidget;
