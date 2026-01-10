import { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Card,
  Button,
  Space,
  Upload,
  Image,
  Switch,
  message,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  PictureOutlined,
  AppstoreOutlined,
  UploadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import RichTextEditor from '../../components/RichTextEditor';
import { uploadImage, uploadMultipleImages, deleteImage } from '../../utils/imageUpload';

const ProductFormModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  form, 
  editingProduct, 
  categories, 
  loading 
}) => {
  const [uploadingImages, setUploadingImages] = useState({});

  return (
    <Modal
      title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={editingProduct ? 'Cập nhật' : 'Thêm'}
      cancelText="Hủy"
      width={900}
      confirmLoading={loading}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" name="productForm">
        {/* Basic Information */}
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[
            { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
            { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' },
          ]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
        >
          <Input.TextArea 
            placeholder="Nhập mô tả chi tiết về sản phẩm..." 
            rows={6}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Giá (đ)"
              rules={[
                { required: true, message: 'Vui lòng nhập giá!' },
                {
                  validator: (_, value) => {
                    if (!value || parseInt(value) > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Giá phải lớn hơn 0!'));
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="stock"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                {
                  type: 'number',
                  min: 0,
                  message: 'Số lượng phải lớn hơn hoặc bằng 0!',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập số lượng"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="categoryId"
          label="Danh mục"
        >
          <Select
            placeholder="Chọn danh mục sản phẩm"
            loading={loading && categories.length === 0}
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Images Section */}
        <Divider orientation="left">
          <PictureOutlined /> Hình ảnh sản phẩm
        </Divider>

        <Form.List name="images">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 8, background: '#fafafa' }}
                  extra={
                    <Space>
                      <Form.Item noStyle shouldUpdate>
                        {() => {
                          const images = form.getFieldValue('images') || [];
                          const publicId = images[name]?.publicId;
                          return publicId ? (
                            <Button
                              type="link"
                              danger
                              size="small"
                              onClick={async () => {
                                const success = await deleteImage(publicId);
                                if (success) {
                                  const images =
                                    form.getFieldValue('images') || [];
                                  images[name] = {
                                    ...images[name],
                                    imageUrl: '',
                                    publicId: '',
                                  };
                                  form.setFieldsValue({ images });
                                }
                              }}
                            >
                              Xóa khỏi Cloudinary
                            </Button>
                          ) : null;
                        }}
                      </Form.Item>
                      <Button
                        type="link"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={16} align="middle">
                    <Col span={14}>
                      <Form.Item
                        {...restField}
                        name={[name, 'imageUrl']}
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng upload hoặc nhập URL ảnh!',
                          },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder="https://res.cloudinary.com/... hoặc upload ảnh"
                          prefix={<PictureOutlined />}
                          disabled={uploadingImages[name]}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Upload
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith('image/');
                          if (!isImage) {
                            message.error('Chỉ được upload file ảnh!');
                            return Upload.LIST_IGNORE;
                          }
                          const isLt4M = file.size / 1024 / 1024 < 4;
                          if (!isLt4M) {
                            message.error(
                              'Ảnh phải nhỏ hơn 4MB (giới hạn Vercel)!'
                            );
                            return Upload.LIST_IGNORE;
                          }

                          setUploadingImages((prev) => ({
                            ...prev,
                            [name]: true,
                          }));
                          uploadImage(file, 'products').then((result) => {
                            setUploadingImages((prev) => ({
                              ...prev,
                              [name]: false,
                            }));
                            if (result) {
                              const images =
                                form.getFieldValue('images') || [];
                              images[name] = {
                                ...images[name],
                                imageUrl: result.url,
                                publicId: result.publicId,
                              };
                              form.setFieldsValue({ images });
                            }
                          });

                          return false;
                        }}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={
                            uploadingImages[name] ? (
                              <LoadingOutlined />
                            ) : (
                              <UploadOutlined />
                            )
                          }
                          loading={uploadingImages[name]}
                          size="small"
                        >
                          Upload
                        </Button>
                      </Upload>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        name={[name, 'isPrimary']}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                      >
                        <Switch
                          checkedChildren="Chính"
                          unCheckedChildren="Phụ"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        initialValue={name}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          placeholder="Thứ tự"
                          min={0}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Preview ảnh */}
                  <Form.Item noStyle shouldUpdate>
                    {() => {
                      const images = form.getFieldValue('images') || [];
                      const imageUrl = images[name]?.imageUrl;
                      return imageUrl ? (
                        <div style={{ marginTop: 8 }}>
                          <Image
                            src={imageUrl}
                            alt="Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: 100,
                              objectFit: 'cover',
                              borderRadius: 4,
                            }}
                            fallback="data:image/png;base64,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"
                          />
                        </div>
                      ) : null;
                    }}
                  </Form.Item>
                </Card>
              ))}
              <Form.Item>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm ảnh thủ công
                  </Button>
                  <Upload
                    multiple
                    beforeUpload={() => false}
                    fileList={[]}
                    onChange={async (info) => {
                      if (info.fileList.length > 0) {
                        const files = info.fileList
                          .map((f) => f.originFileObj)
                          .filter(Boolean);

                        if (files.length === 0) return;

                        // Validate files
                        const validFiles = [];
                        for (const file of files) {
                          const isImage = file.type.startsWith('image/');
                          const isLt5M = file.size / 1024 / 1024 < 5;

                          if (!isImage) {
                            message.error(`${file.name} không phải file ảnh!`);
                            continue;
                          }
                          if (!isLt5M) {
                            message.error(`${file.name} quá lớn (>5MB)!`);
                            continue;
                          }
                          validFiles.push(file);
                        }

                        if (validFiles.length > 0) {
                          message.loading({
                            content: `Đang upload ${validFiles.length} ảnh...`,
                            key: 'uploadMultiple',
                          });

                          const results = await uploadMultipleImages(
                            validFiles,
                            'products'
                          );

                          if (results) {
                            const currentImages =
                              form.getFieldValue('images') || [];
                            form.setFieldsValue({
                              images: [...currentImages, ...results],
                            });
                            message.success({
                              content: `Upload ${results.length} ảnh thành công!`,
                              key: 'uploadMultiple',
                              duration: 2,
                            });
                          } else {
                            message.error({
                              content: 'Upload thất bại!',
                              key: 'uploadMultiple',
                            });
                          }
                        }
                      }
                    }}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button type="primary" block icon={<UploadOutlined />}>
                      Upload nhiều ảnh cùng lúc
                    </Button>
                  </Upload>
                </Space>
              </Form.Item>
            </>
          )}
        </Form.List>

        {/* Variants Section */}
        <Divider orientation="left">
          <AppstoreOutlined /> Biến thể sản phẩm (Variants)
        </Divider>

        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: 8, background: '#f0f5ff' }}
                  title={`Biến thể ${name + 1}`}
                  extra={
                    <Button
                      type="link"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    >
                      Xóa
                    </Button>
                  }
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="Tên biến thể"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên!' },
                    ]}
                  >
                    <Input placeholder="iPhone 15 Pro Max - Blue - 256GB" />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'sku']}
                        label="SKU"
                        rules={[
                          { required: true, message: 'Vui lòng nhập SKU!' },
                        ]}
                      >
                        <Input placeholder="IP15PM-BLUE-256" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        label="Giá (đ)"
                        rules={[
                          { required: true, message: 'Vui lòng nhập giá!' },
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="29990000"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'stock']}
                        label="Số lượng"
                        rules={[
                          {
                            required: true,
                            message: 'Nhập số lượng!',
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="50"
                          min={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'color']}
                        label="Màu sắc"
                      >
                        <Input placeholder="Titan Blue" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'size']}
                        label="Kích thước"
                      >
                        <Input placeholder="256GB" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm biến thể
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
