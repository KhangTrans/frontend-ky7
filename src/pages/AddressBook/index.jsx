import { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Button, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addressAPI } from '../../api';
import HomeNavbar from '../../components/HomeNavbar';
import './AddressBook.css';

const { Title } = Typography;

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAll();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Không thể tải sổ địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-book-page">
      <HomeNavbar />
      <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card 
            title={<Title level={3}>Sổ địa chỉ</Title>} 
            bordered={false}
            extra={<Button type="primary" icon={<PlusOutlined />}>Thêm địa chỉ mới</Button>}
        >
            <List
              loading={loading}
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={addresses}
              renderItem={item => (
                <List.Item>
                  <Card 
                    title={item.fullName} 
                    size="small" 
                    extra={item.isDefault ? <Tag color="red">Mặc định</Tag> : null}
                    actions={[
                        <Button type="text" icon={<EditOutlined />} key="edit">Sửa</Button>,
                        <Button type="text" danger icon={<DeleteOutlined />} key="delete">Xóa</Button>
                    ]}
                  >
                    <p><strong>SĐT:</strong> {item.phoneNumber}</p>
                    <p><strong>Địa chỉ:</strong> {item.address}, {item.ward}, {item.district}, {item.city}</p>
                  </Card>
                </List.Item>
              )}
            />
            {addresses.length === 0 && !loading && <div style={{textAlign: 'center', padding: 20}}>Bạn chưa có địa chỉ nào.</div>}
        </Card>
      </div>
    </div>
  );
};

export default AddressBook;
