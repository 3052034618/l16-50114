import type { Student, Parent, Admin, KitchenStaff } from '../types';

export const mockStudents: Student[] = [
  {
    id: 'stu-001',
    role: 'student',
    username: '202401001',
    password: '123456',
    name: '张小明',
    studentNo: '202401001',
    className: '高一(1)班',
    grade: '高一',
    balance: 568.5,
    parentId: 'par-001',
  },
  {
    id: 'stu-002',
    role: 'student',
    username: '202401002',
    password: '123456',
    name: '李小红',
    studentNo: '202401002',
    className: '高一(1)班',
    grade: '高一',
    balance: 320.0,
    parentId: 'par-002',
  },
  {
    id: 'stu-003',
    role: 'student',
    username: '202402001',
    password: '123456',
    name: '王小强',
    studentNo: '202402001',
    className: '高一(2)班',
    grade: '高一',
    balance: 890.5,
  },
];

export const mockParents: Parent[] = [
  {
    id: 'par-001',
    role: 'parent',
    username: '13800138000',
    password: '123456',
    name: '张伟',
    phone: '13800138000',
    boundStudents: ['stu-001'],
  },
  {
    id: 'par-002',
    role: 'parent',
    username: '13900139000',
    password: '123456',
    name: '李芳',
    phone: '13900139000',
    boundStudents: ['stu-002'],
  },
];

export const mockAdmins: Admin[] = [
  {
    id: 'admin-001',
    role: 'admin',
    username: 'admin001',
    password: '123456',
    name: '刘管理',
    staffNo: 'ADM001',
  },
];

export const mockKitchenStaff: KitchenStaff[] = [
  {
    id: 'kitchen-001',
    role: 'kitchen',
    username: 'chef001',
    password: '123456',
    name: '陈大厨',
    staffNo: 'CHEF001',
  },
];

export const allUsers = [...mockStudents, ...mockParents, ...mockAdmins, ...mockKitchenStaff];
