import {
  Store,
  InspectionTask,
  Product,
  PriceCheckRecord,
  PromotionCheckRecord,
  PhotoEvidence,
  RectificationItem,
  InspectionReport,
  User
} from '../types';

export const mockUser: User = {
  id: 'u001',
  name: '张督导',
  role: 'inspector',
  area: '华东一区',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inspector'
};

export const mockStores: Store[] = [
  {
    id: 's001',
    name: '南京东路旗舰店',
    code: 'SH-001',
    address: '上海市黄浦区南京东路100号',
    area: '华东一区',
    route: '路线A',
    manager: '王店长',
    phone: '13800138001',
    status: 'normal',
    lastInspectionDate: '2024-01-15',
    score: 92
  },
  {
    id: 's002',
    name: '陆家嘴中心店',
    code: 'SH-002',
    address: '上海市浦东新区陆家嘴环路1000号',
    area: '华东一区',
    route: '路线A',
    manager: '李店长',
    phone: '13800138002',
    status: 'warning',
    lastInspectionDate: '2024-01-10',
    score: 78
  },
  {
    id: 's003',
    name: '徐家汇港汇店',
    code: 'SH-003',
    address: '上海市徐汇区虹桥路1号',
    area: '华东一区',
    route: '路线B',
    manager: '陈店长',
    phone: '13800138003',
    status: 'normal',
    lastInspectionDate: '2024-01-18',
    score: 88
  },
  {
    id: 's004',
    name: '人民广场店',
    code: 'SH-004',
    address: '上海市黄浦区人民大道200号',
    area: '华东一区',
    route: '路线B',
    manager: '刘店长',
    phone: '13800138004',
    status: 'problem',
    lastInspectionDate: '2024-01-08',
    score: 65
  },
  {
    id: 's005',
    name: '静安寺店',
    code: 'SH-005',
    address: '上海市静安区南京西路1688号',
    area: '华东一区',
    route: '路线A',
    manager: '赵店长',
    phone: '13800138005',
    status: 'normal',
    lastInspectionDate: '2024-01-20',
    score: 95
  },
  {
    id: 's006',
    name: '五角场店',
    code: 'SH-006',
    address: '上海市杨浦区邯郸路600号',
    area: '华东一区',
    route: '路线C',
    manager: '孙店长',
    phone: '13800138006',
    status: 'warning',
    lastInspectionDate: '2024-01-12',
    score: 82
  },
  {
    id: 's007',
    name: '中山公园店',
    code: 'SH-007',
    address: '上海市长宁区长宁路1018号',
    area: '华东一区',
    route: '路线C',
    manager: '周店长',
    phone: '13800138007',
    status: 'normal',
    lastInspectionDate: '2024-01-19',
    score: 90
  },
  {
    id: 's008',
    name: '南京路步行街店',
    code: 'SH-008',
    address: '上海市黄浦区南京东路300号',
    area: '华东一区',
    route: '路线A',
    manager: '吴店长',
    phone: '13800138008',
    status: 'normal',
    lastInspectionDate: '2024-01-22',
    score: 87
  }
];

export const mockTasks: InspectionTask[] = [
  {
    id: 't001',
    title: '1月价格专项检查',
    storeId: 's001',
    storeName: '南京东路旗舰店',
    type: 'price',
    status: 'pending',
    priority: 'high',
    assignDate: '2024-01-20',
    deadline: '2024-01-25',
    progress: 0
  },
  {
    id: 't002',
    title: '春节促销活动核验',
    storeId: 's002',
    storeName: '陆家嘴中心店',
    type: 'promotion',
    status: 'in_progress',
    priority: 'high',
    assignDate: '2024-01-18',
    deadline: '2024-01-23',
    inspector: '张督导',
    progress: 45
  },
  {
    id: 't003',
    title: '月度综合巡检',
    storeId: 's003',
    storeName: '徐家汇港汇店',
    type: 'comprehensive',
    status: 'completed',
    priority: 'medium',
    assignDate: '2024-01-10',
    deadline: '2024-01-20',
    inspector: '张督导',
    progress: 100
  },
  {
    id: 't004',
    title: '年货促销专项检查',
    storeId: 's004',
    storeName: '人民广场店',
    type: 'promotion',
    status: 'pending',
    priority: 'high',
    assignDate: '2024-01-22',
    deadline: '2024-01-28',
    progress: 0
  },
  {
    id: 't005',
    title: '价格标签合规检查',
    storeId: 's005',
    storeName: '静安寺店',
    type: 'price',
    status: 'in_progress',
    priority: 'medium',
    assignDate: '2024-01-15',
    deadline: '2024-01-24',
    inspector: '张督导',
    progress: 70
  },
  {
    id: 't006',
    title: '季度综合评估',
    storeId: 's006',
    storeName: '五角场店',
    type: 'comprehensive',
    status: 'overdue',
    priority: 'low',
    assignDate: '2024-01-05',
    deadline: '2024-01-15',
    progress: 30
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p001',
    barcode: '6901234567890',
    name: '农夫山泉天然水550ml',
    category: '饮料',
    standardPrice: 2.5,
    promotionPrice: 1.99,
    promotionStartDate: '2024-01-15',
    promotionEndDate: '2024-02-15',
    unit: '瓶',
    spec: '550ml'
  },
  {
    id: 'p002',
    barcode: '6902345678901',
    name: '康师傅红烧牛肉面',
    category: '方便食品',
    standardPrice: 4.5,
    unit: '袋',
    spec: '108g'
  },
  {
    id: 'p003',
    barcode: '6903456789012',
    name: '伊利纯牛奶250ml',
    category: '乳制品',
    standardPrice: 3.8,
    promotionPrice: 2.99,
    promotionStartDate: '2024-01-20',
    promotionEndDate: '2024-02-05',
    unit: '盒',
    spec: '250ml'
  },
  {
    id: 'p004',
    barcode: '6904567890123',
    name: '乐事薯片原味',
    category: '休闲食品',
    standardPrice: 8.9,
    promotionPrice: 6.9,
    promotionStartDate: '2024-01-10',
    promotionEndDate: '2024-01-30',
    unit: '袋',
    spec: '75g'
  },
  {
    id: 'p005',
    barcode: '6905678901234',
    name: '可口可乐330ml',
    category: '饮料',
    standardPrice: 3.5,
    unit: '罐',
    spec: '330ml'
  },
  {
    id: 'p006',
    barcode: '6906789012345',
    name: '三只松鼠坚果大礼包',
    category: '休闲食品',
    standardPrice: 99.0,
    promotionPrice: 69.9,
    promotionStartDate: '2024-01-18',
    promotionEndDate: '2024-02-10',
    unit: '盒',
    spec: '1000g'
  },
  {
    id: 'p007',
    barcode: '6907890123456',
    name: '海天酱油500ml',
    category: '调味品',
    standardPrice: 12.5,
    unit: '瓶',
    spec: '500ml'
  },
  {
    id: 'p008',
    barcode: '6908901234567',
    name: '维达抽纸3层100抽',
    category: '纸品',
    standardPrice: 6.9,
    promotionPrice: 4.99,
    promotionStartDate: '2024-01-12',
    promotionEndDate: '2024-02-12',
    unit: '包',
    spec: '100抽*3层'
  }
];

export const mockPriceRecords: PriceCheckRecord[] = [
  {
    id: 'pr001',
    taskId: 't002',
    storeId: 's002',
    productId: 'p001',
    productName: '农夫山泉天然水550ml',
    barcode: '6901234567890',
    standardPrice: 2.5,
    actualPrice: 2.5,
    isCorrect: true,
    checkTime: '2024-01-20 10:30:00'
  },
  {
    id: 'pr002',
    taskId: 't002',
    storeId: 's002',
    productId: 'p003',
    productName: '伊利纯牛奶250ml',
    barcode: '6903456789012',
    standardPrice: 3.8,
    actualPrice: 3.5,
    isCorrect: false,
    problemType: 'wrong_price',
    remark: '标价签未更新，仍显示旧价格',
    checkTime: '2024-01-20 10:35:00'
  }
];

export const mockPromotionRecords: PromotionCheckRecord[] = [
  {
    id: 'pm001',
    taskId: 't002',
    storeId: 's002',
    productId: 'p004',
    productName: '乐事薯片原味',
    promotionType: '直降',
    expectedPrice: 6.9,
    actualPrice: 6.9,
    isDisplayed: true,
    isCorrect: true,
    checkTime: '2024-01-20 10:40:00'
  },
  {
    id: 'pm002',
    taskId: 't002',
    storeId: 's002',
    productId: 'p006',
    productName: '三只松鼠坚果大礼包',
    promotionType: '直降',
    expectedPrice: 69.9,
    actualPrice: 99.0,
    isDisplayed: false,
    isCorrect: false,
    remark: '未按促销价执行，且无促销标识',
    checkTime: '2024-01-20 10:45:00'
  }
];

export const mockPhotos: PhotoEvidence[] = [
  {
    id: 'ph001',
    taskId: 't002',
    storeId: 's002',
    url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
    description: '饮料区货架整体照',
    category: '货架陈列',
    uploadTime: '2024-01-20 10:32:00'
  },
  {
    id: 'ph002',
    taskId: 't002',
    storeId: 's002',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    description: '牛奶价格标签特写',
    category: '价格标签',
    uploadTime: '2024-01-20 10:38:00'
  }
];

export const mockRectifications: RectificationItem[] = [
  {
    id: 'r001',
    taskId: 't003',
    storeId: 's003',
    storeName: '徐家汇港汇店',
    title: '牛奶促销价未执行',
    description: '伊利纯牛奶促销价2.99元未执行，系统显示3.8元',
    type: 'price',
    status: 'pending',
    assignee: '陈店长',
    deadline: '2024-01-25',
    createdTime: '2024-01-20 11:00:00',
    points: 5
  },
  {
    id: 'r002',
    taskId: 't002',
    storeId: 's002',
    storeName: '陆家嘴中心店',
    title: '坚果礼包促销标识缺失',
    description: '三只松鼠坚果大礼包未展示促销价签，顾客不知晓优惠',
    type: 'promotion',
    status: 'processing',
    assignee: '李店长',
    deadline: '2024-01-24',
    createdTime: '2024-01-20 14:30:00',
    points: 3
  },
  {
    id: 'r003',
    taskId: 't003',
    storeId: 's003',
    storeName: '徐家汇港汇店',
    title: '薯片堆头陈列不规范',
    description: '乐事薯片促销堆头摆放凌乱，影响品牌形象',
    type: 'display',
    status: 'replied',
    assignee: '陈店长',
    deadline: '2024-01-22',
    createdTime: '2024-01-18 09:00:00',
    replyContent: '已安排员工重新整理堆头，按标准陈列',
    replyTime: '2024-01-21 16:00:00',
    points: 2
  },
  {
    id: 'r004',
    taskId: 't003',
    storeId: 's003',
    storeName: '徐家汇港汇店',
    title: '饮料区缺货严重',
    description: '可口可乐330ml罐装缺货，货架空置',
    type: 'other',
    status: 'verified',
    assignee: '陈店长',
    deadline: '2024-01-19',
    createdTime: '2024-01-15 10:00:00',
    replyContent: '已联系供应商补货，当日下午到货',
    replyTime: '2024-01-18 14:00:00',
    verifyResult: 'pass',
    verifyRemark: '已到货并陈列完整',
    verifyTime: '2024-01-19 11:00:00',
    points: 4
  }
];

export const mockReports: InspectionReport[] = [
  {
    id: 'rpt001',
    storeId: 's003',
    storeName: '徐家汇港汇店',
    taskId: 't003',
    inspector: '张督导',
    inspectionDate: '2024-01-20',
    totalScore: 88,
    priceScore: 85,
    promotionScore: 90,
    problemCount: 5,
    rectificationCount: 3
  },
  {
    id: 'rpt002',
    storeId: 's005',
    storeName: '静安寺店',
    taskId: 't005',
    inspector: '张督导',
    inspectionDate: '2024-01-19',
    totalScore: 95,
    priceScore: 96,
    promotionScore: 94,
    problemCount: 2,
    rectificationCount: 1
  },
  {
    id: 'rpt003',
    storeId: 's007',
    storeName: '中山公园店',
    taskId: 't007',
    inspector: '张督导',
    inspectionDate: '2024-01-18',
    totalScore: 90,
    priceScore: 92,
    promotionScore: 88,
    problemCount: 4,
    rectificationCount: 2
  }
];

export const routes = ['路线A', '路线B', '路线C'];
