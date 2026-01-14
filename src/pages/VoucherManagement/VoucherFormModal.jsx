import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch, Row, Col } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const VoucherFormModal = ({ visible, onCancel, onSubmit, loading, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Format dates for form
        const formattingValues = {
          ...initialValues,
          startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
          endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
        };
        form.setFieldsValue(formattingValues);
      } else {
        form.resetFields();
        // Set default values for new voucher
        form.setFieldsValue({
          type: 'DISCOUNT',
          isActive: true,
          minOrderAmount: 0,
          startDate: dayjs(),
          endDate: dayjs().add(1, 'month')
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Transform values to API format
      const submitData = {
        ...values,
        code: values.code.toUpperCase(),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      onSubmit(submitData);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa Voucher" : "Thêm Voucher mới"}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={700}
      okText={initialValues ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'DISCOUNT',
          isActive: true,
          minOrderAmount: 0
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Mã Voucher"
              rules={[
                { required: true, message: 'Vui lòng nhập mã voucher' },
                { pattern: /^[a-zA-Z0-9]+$/, message: 'Mã chỉ được chứa chữ và số' }
              ]}
            >
              <Input placeholder="VD: SALE10" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Loại Voucher"
              rules={[{ required: true, message: 'Vui lòng chọn loại voucher' }]}
            >
              <Select>
                <Option value="DISCOUNT">Giảm giá (%)</Option>
                <Option value="FREE_SHIP">Miễn phí vận chuyển</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            return (
              <Row gutter={16}>
                {type === 'DISCOUNT' && (
                  <Col span={12}>
                    <Form.Item
                      name="discountPercent"
                      label="Phần trăm giảm (%)"
                      rules={[
                        { required: true, message: 'Vui lòng nhập % giảm giá' },
                        { type: 'number', min: 1, max: 100, message: 'Giá trị từ 1 đến 100' }
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="VD: 10"
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                      />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item
                    name="maxDiscount"
                    label={type === 'FREE_SHIP' ? "Giảm tối đa phí vận chuyển" : "Giảm tối đa"}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="VD: 50000"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Col>
              </Row>
            );
          }}
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minOrderAmount"
              label="Đơn hàng tối thiểu"
              rules={[{ required: true, message: 'Vui lòng nhập giá trị tối thiểu' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="₫"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="usageLimit"
              label="Giới hạn lượt dùng (Để trống = Vô hạn)"
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              dependencies={['startDate']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('startDate') || value.isAfter(getFieldValue('startDate'))) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  },
                }),
              ]}
            >
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} placeholder="Mô tả chi tiết về voucher..." />
        </Form.Item>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default VoucherFormModal;
