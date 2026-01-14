import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown, Button, List, Empty, Space, Typography, Spin, Tooltip } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../redux/slices/notificationSlice';
import './NotificationBell.css';

const { Text } = Typography;

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount, loading } = useSelector(state => state.notifications);
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleOpenChange = (flag) => {
    setOpen(flag);
    if (flag) {
      dispatch(fetchNotifications());
    }
  };

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleClearRead = () => {
    dispatch(clearReadNotifications());
  };

  const handleItemClick = (item) => {
    // Mark as read if unread
    if (!item.isRead) {
      handleMarkAsRead(item._id || item.id);
    }
    
    // Navigate if orderId exists
    if (item.orderId) {
      navigate(`/orders/${item.orderId}`);
      setOpen(false); // Close dropdown
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      order: '🛒',
      product: '📦',
      user: '👤',
      system: '⚙️',
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };
    return iconMap[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: 16 }}>
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </Text>
          <Space size="small">
            {unreadCount > 0 && (
              <Tooltip title="Đánh dấu tất cả đã đọc">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={handleMarkAllAsRead}
                />
              </Tooltip>
            )}
            {items.some(n => n.isRead) && (
              <Tooltip title="Xóa thông báo đã đọc">
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClearRead}
                />
              </Tooltip>
            )}
          </Space>
        </Space>
      </div>

      <div className="notification-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            style={{ padding: 40 }}
          />
        ) : (
          <List
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                key={item._id || item.id}
                className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => handleItemClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  avatar={
                    <span style={{ fontSize: 24 }}>
                      {getNotificationIcon(item.type)}
                    </span>
                  }
                  title={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      {!item.isRead && (
                        <Badge status="processing" color="blue" />
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {item.message}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {getTimeAgo(item.createdAt)}
                        </Text>
                      </div>
                    </div>
                  }
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id || item.id);
                  }}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {items.length > 0 && (
        <div className="notification-footer">
          <Button type="link" block>
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      dropdownRender={() => notificationMenu}
      trigger={['click']}
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
    >
      <Badge count={unreadCount} offset={[-5, 5]} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ height: 40, width: 40 }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
