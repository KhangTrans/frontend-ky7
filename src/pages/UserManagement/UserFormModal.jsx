import { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Avatar,
  Typography,
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const UserFormModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form, 
  editingUser, 
  loading 
}) => {
  const isEditMode = !!editingUser;

  useEffect(() => {
    if (visible && editingUser) {
      // Populate form with user data when editing
      form.setFieldsValue({
        username: editingUser.username,
        email: editingUser.email,
        fullName: editingUser.fullName,
        role: editingUser.role,
        isActive: editingUser.isActive,
      });
    } else if (visible && !editingUser) {
      // Reset form when creating new user
      form.resetFields();
      // Set default values for new user
      form.setFieldsValue({
        role: 'user',
        isActive: true,
      });
    }
  }, [visible, editingUser, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Nếu đang edit và không có password mới, xóa field password
      if (isEditMode && !values.password) {
        delete values.password;
      }
      
      onSubmit(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <span>{isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</span>
        </div>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={isEditMode ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={600}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical" 
        name="userForm"
        preserve={false}
      >
        {/* Username */}
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[
            { required: !isEditMode, message: 'Vui lòng nhập tên đăng nhập!' },
            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
            { 
              pattern: /^[a-zA-Z0-9_]+$/, 
              message: 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới!' 
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nhập tên đăng nhập"
            disabled={isEditMode} // Không cho sửa username khi edit
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: !isEditMode, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Nhập email"
            disabled={isEditMode} // Không cho sửa email khi edit
          />
        </Form.Item>

        {/* Password */}
        {!isEditMode && (
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            />
          </Form.Item>
        )}

        {/* New Password for Edit Mode */}
        {isEditMode && (
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            help="Để trống nếu không muốn thay đổi mật khẩu"
            rules={[
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
            />
          </Form.Item>
        )}

        {/* Full Name */}
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập họ và tên đầy đủ" />
        </Form.Item>

        {/* Role and Status Row */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Vai trò"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="user">
                  <span>👤 Người dùng</span>
                </Option>
                <Option value="admin">
                  <span>👑 Quản trị viên</span>
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Trạng thái hoạt động"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Hoạt động"
                unCheckedChildren="Vô hiệu"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Info Note */}
        {!isEditMode && (
          <div style={{ 
            padding: '12px', 
            background: '#e6f7ff', 
            borderRadius: '4px', 
            border: '1px solid #91d5ff',
            marginTop: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💡 <strong>Lưu ý:</strong> Username và Email không thể thay đổi sau khi tạo. 
              Người dùng mới sẽ nhận được email thông báo tài khoản.
            </Text>
          </div>
        )}

        {isEditMode && (
          <div style={{ 
            padding: '12px', 
            background: '#fff7e6', 
            borderRadius: '4px', 
            border: '1px solid #ffd591',
            marginTop: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              💡 <strong>Lưu ý:</strong> Username và Email không thể chỉnh sửa. 
              Chỉ nhập mật khẩu mới nếu muốn thay đổi.
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default UserFormModal;
