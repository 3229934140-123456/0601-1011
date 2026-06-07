import React, { useState, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Tag,
  Modal,
  Form,
  Upload,
  message,
  Image,
  Space,
  Popconfirm,
  Divider
} from 'antd';
import {
  CameraOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { PhotoEvidence } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const photoCategories = [
  '货架陈列',
  '价格标签',
  '促销标识',
  '缺货情况',
  '门店环境',
  '其他问题'
];

const PhotoEvidencePage: React.FC = () => {
  const { photos, tasks, addPhoto, currentTask, stores, user } = useAppStore();
  const [selectedTask, setSelectedTask] = useState(currentTask?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [uploadModal, setUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const taskList = tasks.filter(
    (t) => t.status === 'in_progress' && t.inspector === user.name
  );

  const currentTaskData = tasks.find((t) => t.id === selectedTask);
  const currentStore = stores.find((s) => s.id === currentTaskData?.storeId);

  const taskPhotos = photos.filter(
    (p) => p.taskId === selectedTask && (!selectedCategory || p.category === selectedCategory)
  );

  const handleUploadClick = () => {
    if (!selectedTask) {
      message.warning('请先选择巡检任务');
      return;
    }
    setUploadModal(true);
    form.resetFields();
  };

  const handleTakePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
    ];
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    form.setFieldsValue({ imageUrl: randomPhoto });
    message.success('拍照成功');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        form.setFieldsValue({ imageUrl: event.target?.result as string });
        message.success('图片上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    form.validateFields().then((values) => {
      if (!selectedTask || !currentTaskData) return;

      const newPhoto: PhotoEvidence = {
        id: `ph${Date.now()}`,
        taskId: selectedTask,
        storeId: currentTaskData.storeId,
        url: values.imageUrl,
        description: values.description,
        category: values.category,
        uploadTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      addPhoto(newPhoto);
      message.success('照片证据已保存');
      setUploadModal(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    message.success('照片已删除');
  };

  const stats = [
    { label: '照片总数', value: taskPhotos.length, icon: <CameraOutlined />, color: '#1677ff' },
    {
      label: '价格标签',
      value: taskPhotos.filter((p) => p.category === '价格标签').length,
      color: '#faad14'
    },
    {
      label: '促销标识',
      value: taskPhotos.filter((p) => p.category === '促销标识').length,
      color: '#722ed1'
    },
    {
      label: '问题照片',
      value: taskPhotos.filter((p) => p.category === '其他问题').length,
      color: '#ff4d4f'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">拍照取证</h2>
        <Space>
          <Button icon={<CameraOutlined />} type="primary" onClick={handleUploadClick}>
            拍照/上传
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Card className="card-section">
        <div className="filter-bar">
          <span style={{ color: '#666' }}>当前任务：</span>
          <Select
            placeholder="请选择巡检任务"
            value={selectedTask || undefined}
            onChange={(val) => setSelectedTask(val)}
            style={{ width: 300 }}
          >
            {taskList.map((task) => (
              <Option key={task.id} value={task.id}>
                {task.title} - {task.storeName}
              </Option>
            ))}
          </Select>
          {currentStore && <Tag color="blue">{currentStore.name}</Tag>}
          <Select
            placeholder="按分类筛选"
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 160 }}
            allowClear
          >
            {photoCategories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#666' }}>共 {taskPhotos.length} 张照片</span>
        </div>

        <Divider />

        {taskPhotos.length > 0 ? (
          <div className="photo-grid">
            {taskPhotos.map((photo) => (
              <div key={photo.id} className="photo-item">
                <img
                  src={photo.url}
                  alt={photo.description}
                  onClick={() => setPreviewImage(photo.url)}
                />
                <div className="photo-desc">
                  <Tag color="blue" style={{ marginBottom: 4 }}>
                    {photo.category}
                  </Tag>
                  <div style={{ fontSize: 12 }}>{photo.description}</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                    {photo.uploadTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <CameraOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>暂无照片证据</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleUploadClick} style={{ marginTop: 12 }}>
              添加照片
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title="拍照取证"
        open={uploadModal}
        onOk={handleSavePhoto}
        onCancel={() => setUploadModal(false)}
        okText="保存照片"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="imageUrl"
            label="照片"
            rules={[{ required: true, message: '请拍摄或上传照片' }]}
          >
            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <Form.Item noStyle name="imageUrl">
                <div />
              </Form.Item>
              {form.getFieldValue('imageUrl') ? (
                <img
                  src={form.getFieldValue('imageUrl')}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                />
              ) : (
                <div>
                  <UploadOutlined style={{ fontSize: 36, color: '#999', marginBottom: 8 }} />
                  <p style={{ color: '#666', margin: 0 }}>点击拍照或上传图片</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </Form.Item>

          <Space style={{ marginBottom: 16 }}>
            <Button icon={<CameraOutlined />} onClick={handleTakePhoto}>
              模拟拍照
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
              选择图片
            </Button>
          </Space>

          <Form.Item
            name="category"
            label="照片分类"
            rules={[{ required: true, message: '请选择照片分类' }]}
          >
            <Select placeholder="请选择照片分类">
              {photoCategories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="问题说明"
            rules={[{ required: true, message: '请填写问题说明' }]}
          >
            <TextArea
              rows={3}
              placeholder="请描述照片中显示的问题情况"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="照片预览"
        open={!!previewImage}
        footer={null}
        onCancel={() => setPreviewImage(null)}
        width={800}
      >
        {previewImage && (
          <img
            src={previewImage}
            alt="preview"
            style={{ width: '100%', borderRadius: 8 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PhotoEvidencePage;
