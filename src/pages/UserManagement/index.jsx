import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Space,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Select,
  Avatar,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearError,
} from '../../redux/slices/userSlice';
import UserFormModal from './UserFormModal';
import './UserManagement.css';

const { Option } = Select;
const { Title } = Typography;

const UserManagement = () => {
  const dispatch = useDispatch();
  const { items: users, loading, error, pagination } = useSelector((state) => state.users);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  // Active filters
  const [activeKeyword, setActiveKeyword] = useState('');
  const [activeRole, setActiveRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  // Load users function
  const loadUsers = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    
    if (activeKeyword) params.keyword = activeKeyword;
    if (activeRole) params.role = activeRole;
    
    dispatch(fetchUsers(params));
  }, [currentPage, pageSize, activeKeyword, activeRole, dispatch]);

  // Load users when component mount or filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle errors
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const showModal = (user = null) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update user
        await dispatch(updateUser({ 
          userId: editingUser._id, 
          userData: values 
        })).unwrap();
        message.success('Cập nhật người dùng thành công!');
      } else {
        // Create new user
        await dispatch(createUser(values)).unwrap();
        message.success('Thêm người dùng mới thành công!');
      }
      
      handleCancel();
      loadUsers();
    } catch (error) {
      message.error(error || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      message.success('Xóa người dùng thành công!');
      loadUsers();
    } catch (error) {
      message.error(error || 'Không thể xóa người dùng!');
    }
  };

  const handleSearch = () => {
    setActiveKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value) => {
    setSelectedRole(value);
    setActiveRole(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setSelectedRole('');
    setActiveKeyword('');
    setActiveRole('');
    setCurrentPage(1);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      align: 'center',
      render: (avatar, record) => (
        <Avatar 
          size={40}
          src={avatar}
          icon={<UserOutlined />}
          style={{ 
            backgroundColor: record.role === 'admin' ? '#ff4d4f' : '#1890ff' 
          }}
        >
          {!avatar && record.username?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.role === 'admin' && (
            <Tag icon={<CrownOutlined />} color="gold" style={{ marginTop: 4 }}>
              Admin
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      render: (text) => text || <span style={{ color: '#999' }}>Chưa cập nhật</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => (
        <Tooltip title={email}>
          <Space>
            <MailOutlined style={{ color: '#1890ff' }} />
            <span>{email}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      align: 'center',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      render: (role) => {
        const config = {
          admin: { color: 'red', text: '👑 Admin' },
          user: { color: 'blue', text: '👤 User' },
        };
        const { color, text } = config[role] || config.user;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Card>
        <div className="page-header">
          <Title level={2}>
            <UserOutlined /> Quản lý người dùng
          </Title>
        </div>

        {/* Toolbar */}
        <div className="user-management-toolbar">
          <Input
            placeholder="Tìm theo username, email hoặc tên..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            size="large"
            className="toolbar-search"
          />
          <Select
            placeholder="Lọc theo vai trò"
            value={selectedRole}
            onChange={handleRoleFilter}
            allowClear
            size="large"
            className="toolbar-select"
          >
            <Option value="">Tất cả</Option>
            <Option value="admin">👑 Admin</Option>
            <Option value="user">👤 User</Option>
          </Select>
          <Button 
            icon={<SearchOutlined />} 
            onClick={handleSearch} 
            type="primary"
            size="large"
            className="toolbar-btn-search"
          >
            Tìm kiếm
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            size="large"
            className="toolbar-btn-reset"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            size="large"
            className="toolbar-btn-add"
          >
            Thêm người dùng
          </Button>
        </div>

        {/* Stats Row */}
        <div style={{ 
          padding: '12px 16px', 
          background: '#f0f2f5', 
          borderRadius: '4px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Space size="large" wrap>
            <span>
              <strong>Tổng số:</strong> {pagination.total} người dùng
            </span>
            <span>
              <strong>Trang:</strong> {pagination.page}/{pagination.totalPages}
            </span>
          </Space>
          {(activeKeyword || activeRole) && (
            <Tag color="blue">
              Đang lọc: {activeKeyword && `"${activeKeyword}"`} 
              {activeKeyword && activeRole && ' - '}
              {activeRole && `Vai trò: ${activeRole}`}
            </Tag>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1200 }}
          bordered
        />
      </Card>

      {/* Modal */}
      <UserFormModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        editingUser={editingUser}
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;
