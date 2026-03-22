import React, { useState, useEffect } from 'react';
import { 
    Modal, Form, Input, InputNumber, DatePicker, 
    Upload, Button, message, Space, Select, Tag
} from 'antd';
import { 
    PlusOutlined, UploadOutlined, 
    DeleteOutlined, PictureOutlined,
    ShoppingOutlined, SortAscendingOutlined
} from '@ant-design/icons';
import { bannerAPI, productAPI } from '../../api';
import { uploadImage, deleteImage } from '../../utils/imageUpload';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const BannerFormModal = ({ visible, onCancel, onSuccess, editingBanner, mode }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [publicId, setPublicId] = useState('');
    const [uploading, setUploading] = useState(false);

    // Fetch products for selection
    const fetchProducts = async () => {
        try {
            setFetchingProducts(true);
            const res = await productAPI.getAll(); // Assuming getAll returns all products needed
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setFetchingProducts(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchProducts();
            if (editingBanner) {
                form.setFieldsValue({
                    title: editingBanner.title,
                    description: editingBanner.description,
                    discountPercent: editingBanner.discountPercent,
                    order: editingBanner.order || 0,
                    products: editingBanner.products?.map(p => p._id || p) || [],
                    period: [dayjs(editingBanner.startDate), dayjs(editingBanner.endDate)]
                });
                setImageUrl(editingBanner.imageUrl);
                setPublicId(editingBanner.publicId);
            } else {
                form.resetFields();
                setImageUrl('');
                setPublicId('');
            }
        }
    }, [visible, editingBanner, form]);

    const handleUpload = async (file) => {
        const result = await uploadImage(file, 'banners', (isUploading) => setUploading(isUploading));
        if (result) {
            setImageUrl(result.url);
            setPublicId(result.publicId);
        }
        return false;
    };

    const handleRemoveImage = async () => {
        setImageUrl('');
        setPublicId('');
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (!imageUrl) {
                message.error('Vui lòng tải lên ảnh banner!');
                return;
            }

            const payload = {
                title: values.title,
                description: values.description,
                discountPercent: values.discountPercent,
                order: values.order,
                products: values.products,
                imageUrl,
                publicId,
                startDate: values.period[0].toISOString(),
                endDate: values.period[1].toISOString(),
            };

            setLoading(true);
            let res;
            if (editingBanner) {
                res = await bannerAPI.update(editingBanner._id, payload);
            } else {
                res = await bannerAPI.create(payload);
            }

            if (res.success) {
                message.success(`${editingBanner ? 'Cập nhật' : 'Thêm'} banner thành công!`);
                onSuccess();
            } else {
                message.error(res.message || 'Thao tác thất bại');
            }
        } catch (error) {
            console.error('Submit failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isViewMode = mode === 'view';

    return (
        <Modal
            title={
                <Space>
                    <PictureOutlined />
                    <span>{editingBanner ? (isViewMode ? 'Chi tiết Banner' : 'Chỉnh sửa Banner') : 'Thêm Banner mới'}</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={850}
            okText={editingBanner ? 'Cập nhật' : 'Thêm mới'}
            cancelText="Hủy"
            maskClosable={false}
            footer={isViewMode ? [
                <Button key="close" onClick={onCancel}>Đóng</Button>
            ] : undefined}
        >
            <Form
                form={form}
                layout="vertical"
                disabled={isViewMode}
                initialValues={{ discountPercent: 10, order: 0 }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                    <div>
                        <Form.Item
                            name="title"
                            label="Tiêu đề banner"
                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                        >
                            <Input placeholder="Nhập tiêu đề hấp dẫn... (VD: Siêu Sale Mùa Hè)" />
                        </Form.Item>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="discountPercent"
                                label="Phần trăm giảm giá (%)"
                                rules={[{ required: true, message: 'Vui lòng nhập mức giảm!' }]}
                            >
                                <InputNumber 
                                    min={0} 
                                    max={100} 
                                    style={{ width: '100%' }} 
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="order"
                                label={<Space><SortAscendingOutlined />Thứ tự hiển thị</Space>}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Mặc định: 0" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="period"
                            label="Thời hạn áp dụng"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                        >
                            <RangePicker 
                                style={{ width: '100%' }} 
                                format="DD/MM/YYYY"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="products"
                            label={<Space><ShoppingOutlined />Sản phẩm áp dụng</Space>}
                            tooltip="Các sản phẩm được gắn vào banner này sẽ hiển thị mức giảm giá tương ứng"
                        >
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="Chọn sản phẩm áp dụng giảm giá..."
                                loading={fetchingProducts}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={products.map(p => ({
                                    label: `${p.name} (${p.price?.toLocaleString()}đ)`,
                                    value: p._id
                                }))}
                                maxTagCount="responsive"
                            />
                        </Form.Item>
                    </div>

                    <div>
                        <Form.Item label="Hình ảnh banner (Bắt buộc)" required>
                            <div className="upload-container">
                                {imageUrl ? (
                                    <div style={{ position: 'relative' }}>
                                        <img 
                                            src={imageUrl} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, border: '1px solid #d9d9d9' }} 
                                        />
                                        {!isViewMode && (
                                            <Button 
                                                type="primary" 
                                                danger 
                                                shape="circle" 
                                                icon={<DeleteOutlined />} 
                                                size="small"
                                                style={{ position: 'absolute', top: 12, right: 12 }}
                                                onClick={handleRemoveImage}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <Upload.Dragger
                                        accept="image/*"
                                        beforeUpload={handleUpload}
                                        showUploadList={false}
                                        disabled={uploading}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            {uploading ? <PlusOutlined spin /> : <UploadOutlined />}
                                        </p>
                                        <p className="ant-upload-text">Nhấp để tải hoặc kéo thả ảnh</p>
                                        <p className="ant-upload-hint">Tỉ lệ 16:9 hoặc 21:9 là tốt nhất</p>
                                    </Upload.Dragger>
                                )}
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả ngắn"
                        >
                            <TextArea rows={4} placeholder="Mô tả nội dung chương trình khuyến mãi..." />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default BannerFormModal;
