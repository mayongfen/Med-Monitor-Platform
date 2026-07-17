// 机构版 · 患者与入院数据

export type Gender = '男' | '女'
export type AdmissionType = 'emergency' | 'outpatient' | 'transfer'
export type AdmissionStatus = 'admitted' | 'discharged'

export interface Patient {
  id: string
  name: string
  gender: Gender
  age: number
  idCard: string
  contact: string
  phone: string
  allergy?: string
  history?: string
}

export interface Admission {
  patientId: string
  admissionNo: string
  serialNo: string
  inAt: string
  outAt?: string
  diagnosis: string
  doctor: string
  type: AdmissionType
  insurance?: string
  bedId?: string
  deviceId?: string
  status: AdmissionStatus
}

export const PATIENTS: Patient[] = [
  { id: 'P001', name: '张伟', gender: '男', age: 58, idCard: '3101**********0011', contact: '张明', phone: '138****1102', allergy: '青霉素', history: '高血压 5 年' },
  { id: 'P002', name: '李秀英', gender: '女', age: 67, idCard: '3101**********0028', contact: '李军', phone: '139****3344', history: '糖尿病 2 型' },
  { id: 'P003', name: '王强', gender: '男', age: 45, idCard: '3101**********0035', contact: '王丽', phone: '137****5566', history: '冠心病' },
  { id: 'P004', name: '刘敏', gender: '女', age: 39, idCard: '3101**********0042', contact: '刘洋', phone: '136****7788', allergy: '磺胺类' },
  { id: 'P005', name: '陈杰', gender: '男', age: 72, idCard: '3101**********0059', contact: '陈静', phone: '135****9900', history: '慢阻肺' },
  { id: 'P006', name: '赵丽', gender: '女', age: 54, idCard: '3101**********0066', contact: '赵磊', phone: '134****1122' },
  { id: 'P007', name: '孙浩', gender: '男', age: 61, idCard: '3101**********0073', contact: '孙倩', phone: '133****3344', history: '房颤' },
  { id: 'P008', name: '周芳', gender: '女', age: 48, idCard: '3101**********0080', contact: '周强', phone: '132****5566' },
  { id: 'P009', name: '吴敏', gender: '女', age: 33, idCard: '3101**********0097', contact: '吴刚', phone: '131****7788' },
  { id: 'P010', name: '郑国', gender: '男', age: 70, idCard: '3101**********0103', contact: '郑华', phone: '130****9900', history: '脑梗后遗症' },
  { id: 'P011', name: '冯雷', gender: '男', age: 50, idCard: '3101**********0110', contact: '冯雪', phone: '138****0011', history: '肺炎' },
  { id: 'P012', name: '韩梅', gender: '女', age: 44, idCard: '3101**********0128', contact: '韩峰', phone: '139****2233' },
]

export const ADMISSIONS: Admission[] = [
  { patientId: 'P001', admissionNo: 'AD-20260701-001', serialNo: 'S-001', inAt: '2026-07-01 09:20', diagnosis: '急性心肌梗死', doctor: '张主任', type: 'emergency', insurance: '城镇职工医保', bedId: 'W01-01', deviceId: 'D001', status: 'admitted' },
  { patientId: 'P002', admissionNo: 'AD-20260703-008', serialNo: 'S-008', inAt: '2026-07-03 14:05', diagnosis: '糖尿病酮症', doctor: '李主任', type: 'outpatient', insurance: '城镇职工医保', bedId: 'W01-02', deviceId: 'D002', status: 'admitted' },
  { patientId: 'P003', admissionNo: 'AD-20260705-012', serialNo: 'S-012', inAt: '2026-07-05 10:30', diagnosis: '冠心病复查', doctor: '张主任', type: 'outpatient', bedId: 'W01-03', deviceId: 'D003', status: 'admitted' },
  { patientId: 'P004', admissionNo: 'AD-20260708-021', serialNo: 'S-021', inAt: '2026-07-08 16:12', diagnosis: '心律失常', doctor: '李主任', type: 'emergency', insurance: '新农合', bedId: 'W01-04', deviceId: 'D004', status: 'admitted' },
  { patientId: 'P005', admissionNo: 'AD-20260710-030', serialNo: 'S-030', inAt: '2026-07-10 08:40', diagnosis: '慢阻肺急性加重', doctor: '张主任', type: 'emergency', bedId: 'W01-05', deviceId: 'D005', status: 'admitted' },
  { patientId: 'P006', admissionNo: 'AD-20260711-035', serialNo: 'S-035', inAt: '2026-07-11 11:25', diagnosis: '高血压急症', doctor: '王主任', type: 'emergency', insurance: '城镇职工医保', bedId: 'W02-01', deviceId: 'D006', status: 'admitted' },
  { patientId: 'P007', admissionNo: 'AD-20260712-040', serialNo: 'S-040', inAt: '2026-07-12 09:00', diagnosis: '心房颤动', doctor: '王主任', type: 'outpatient', bedId: 'W02-02', deviceId: 'D007', status: 'admitted' },
  { patientId: 'P008', admissionNo: 'AD-20260713-047', serialNo: 'S-047', inAt: '2026-07-13 15:50', diagnosis: '贫血查因', doctor: '李主任', type: 'transfer', bedId: 'W02-04', deviceId: 'D008', status: 'admitted' },
  { patientId: 'P009', admissionNo: 'AD-20260714-051', serialNo: 'S-051', inAt: '2026-07-14 10:15', diagnosis: '上呼吸道感染', doctor: '陈医生', type: 'outpatient', insurance: '新农合', bedId: 'W03-01', deviceId: 'D009', status: 'admitted' },
  { patientId: 'P010', admissionNo: 'AD-20260715-058', serialNo: 'S-058', inAt: '2026-07-15 13:30', diagnosis: '脑梗康复', doctor: '陈医生', type: 'outpatient', bedId: 'W03-03', deviceId: 'D010', status: 'admitted' },
  { patientId: 'P011', admissionNo: 'AD-20260620-088', serialNo: 'S-088', inAt: '2026-06-20 09:00', outAt: '2026-06-28 10:30', diagnosis: '社区获得性肺炎', doctor: '张主任', type: 'outpatient', insurance: '城镇职工医保', status: 'discharged' },
  { patientId: 'P012', admissionNo: 'AD-20260615-072', serialNo: 'S-072', inAt: '2026-06-15 14:20', outAt: '2026-06-25 09:00', diagnosis: '甲亢复查', doctor: '李主任', type: 'outpatient', status: 'discharged' },
]

export const ADMISSION_TYPE_LABEL: Record<AdmissionType, string> = {
  emergency: '急诊',
  outpatient: '门诊',
  transfer: '转院',
}

export const ADMISSION_STATUS_LABEL: Record<AdmissionStatus, string> = {
  admitted: '在院',
  discharged: '已出院',
}

export function patientName(id?: string) {
  if (!id) return '—'
  return PATIENTS.find((p) => p.id === id)?.name ?? id
}

export function activeAdmissions() {
  return ADMISSIONS.filter((a) => a.status === 'admitted')
}
