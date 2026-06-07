export interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  route: string;
  manager: string;
  phone: string;
  status: 'normal' | 'warning' | 'problem';
  lastInspectionDate: string;
  score: number;
}

export interface InspectionTask {
  id: string;
  title: string;
  storeId: string;
  storeName: string;
  type: 'price' | 'promotion' | 'comprehensive';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignDate: string;
  deadline: string;
  inspector?: string;
  progress: number;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  standardPrice: number;
  promotionPrice?: number;
  promotionStartDate?: string;
  promotionEndDate?: string;
  unit: string;
  spec: string;
}

export interface PriceCheckRecord {
  id: string;
  taskId: string;
  storeId: string;
  productId: string;
  productName: string;
  barcode: string;
  standardPrice: number;
  actualPrice: number;
  isCorrect: boolean;
  problemType?: 'wrong_price' | 'out_of_stock' | 'no_price_tag';
  remark?: string;
  checkTime: string;
}

export interface PromotionCheckRecord {
  id: string;
  taskId: string;
  storeId: string;
  productId: string;
  productName: string;
  promotionType: string;
  expectedPrice: number;
  actualPrice: number;
  isDisplayed: boolean;
  isCorrect: boolean;
  remark?: string;
  checkTime: string;
}

export interface PhotoEvidence {
  id: string;
  taskId: string;
  storeId: string;
  url: string;
  description: string;
  category: string;
  uploadTime: string;
}

export interface RectificationItem {
  id: string;
  taskId: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  type: 'price' | 'promotion' | 'display' | 'other';
  status: 'pending' | 'processing' | 'replied' | 'verified' | 'closed';
  assignee: string;
  deadline: string;
  createdTime: string;
  replyContent?: string;
  replyTime?: string;
  verifyResult?: 'pass' | 'fail';
  verifyRemark?: string;
  verifyTime?: string;
  points: number;
}

export interface InspectionReport {
  id: string;
  storeId: string;
  storeName: string;
  taskId: string;
  inspector: string;
  inspectionDate: string;
  totalScore: number;
  priceScore: number;
  promotionScore: number;
  problemCount: number;
  rectificationCount: number;
}

export interface User {
  id: string;
  name: string;
  role: 'inspector' | 'manager' | 'admin';
  area: string;
  avatar: string;
}
