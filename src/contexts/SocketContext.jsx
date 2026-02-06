import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { API_CONFIG } from '../utils/constants';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  // Add notification hook
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // Only connect if user is authenticated and has token
    if (isAuthenticated && token) {
      // Determine Socket URL
      // Use configured socket URL or fallback to window origin for relative path
      // Note: API_CONFIG should be imported or defined values used directly
       const socketUrl = import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:5000';
      
      console.log('Initializing socket connection to:', socketUrl);

      const newSocket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      // Listen for notifications
      newSocket.on('new_notification', (data) => {
        console.log('Received notification:', data);
        
        // Show local notification toast
        api.open({
          message: data.title || 'Thông báo mới',
          description: data.message,
          icon: <BellOutlined style={{ color: '#108ee9' }} />,
          placement: 'topRight',
          duration: 5,
          onClick: () => {
            if (data.link) {
              window.location.href = data.link;
            }
          },
          style: {
            cursor: 'pointer'
          }
        });

        // Optional: Dispatch action to update redux notification count
        // dispatch(incrementNotificationCount());
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    } else {
        // If logged out, ensure socket is closed
        if(socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {contextHolder}
      {children}
    </SocketContext.Provider>
  );
};
