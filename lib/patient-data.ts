// 机构版 · 患者与入院数据

export type Gender = '男' | '女'
export type AdmissionType = 'emergency' | 'outpatient' | 'transfer'
export type AdmissionStatus = 'admitted' | 'discharged'

export type ContactRelation = 'spouse' | 'father' | 'mother' | 'child' | 'sibling' | 'friend' | 'other'

export const CONTACT_RELATION_LABEL: Record<ContactRelation, string> = {
  spouse: '配偶',
  father: '父亲',
  mother: '母亲',
  child: '子女',
  sibling: '兄弟姐妹',
  friend: '朋友',
  other: '其他',
}

export interface Contact {
  name: string
  phone: string
  relation?: ContactRelation
}

export interface Patient {
  id: string
  name: string
  gender: Gender
  age: number
  idCard: string
  contacts: Contact[]
  allergy?: string
  history?: string
}

export type Outcome = 'cured' | 'improved' | 'unchanged' | 'transferred' | 'deceased'

export const OUTCOME_LABEL: Record<Outcome, string> = {
  cured: '治愈',
  improved: '好转',
  unchanged: '未愈',
  transferred: '转院',
  deceased: '死亡',
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
  outcome?: Outcome
  archivedAt?: string
}

export const PATIENTS: Patient[] = [
  { id: 'P001', name: '张伟', gender: '男', age: 58, idCard: '3101**********0011', contacts: [{ name: '张明', phone: '138****1102', relation: 'child' }, { name: '李华', phone: '137****0001', relation: 'spouse' }], allergy: '青霉素', history: '高血压 5 年' },
  { id: 'P002', name: '李秀英', gender: '女', age: 67, idCard: '3101**********0028', contacts: [{ name: '李军', phone: '139****3344', relation: 'child' }], history: '糖尿病 2 型' },
  { id: 'P003', name: '王强', gender: '男', age: 45, idCard: '3101**********0035', contacts: [{ name: '王丽', phone: '137****5566', relation: 'spouse' }], history: '冠心病' },
  { id: 'P004', name: '刘敏', gender: '女', age: 39, idCard: '3101**********0042', contacts: [{ name: '刘洋', phone: '136****7788', relation: 'sibling' }], allergy: '磺胺类' },
  { id: 'P005', name: '陈杰', gender: '男', age: 72, idCard: '3101**********0059', contacts: [{ name: '陈静', phone: '135****9900', relation: 'child' }, { name: '周梅', phone: '138****0005', relation: 'spouse' }], history: '慢阻肺' },
  { id: 'P006', name: '赵丽', gender: '女', age: 54, idCard: '3101**********0066', contacts: [{ name: '赵磊', phone: '134****1122', relation: 'sibling' }] },
  { id: 'P007', name: '孙浩', gender: '男', age: 61, idCard: '3101**********0073', contacts: [{ name: '孙倩', phone: '133****3344', relation: 'child' }], history: '房颤' },
  { id: 'P008', name: '周芳', gender: '女', age: 48, idCard: '3101**********0080', contacts: [{ name: '周强', phone: '132****5566', relation: 'spouse' }] },
  { id: 'P009', name: '吴敏', gender: '女', age: 33, idCard: '3101**********0097', contacts: [{ name: '吴刚', phone: '131****7788', relation: 'friend' }] },
  { id: 'P010', name: '郑国', gender: '男', age: 70, idCard: '3101**********0103', contacts: [{ name: '郑华', phone: '130****9900', relation: 'child' }, { name: '孙兰', phone: '130****0010', relation: 'mother' }], history: '脑梗后遗症' },
  { id: 'P011', name: '冯雷', gender: '男', age: 50, idCard: '3101**********0110', contacts: [{ name: '冯雪', phone: '138****0011', relation: 'spouse' }], history: '肺炎' },
  { id: 'P012', name: '韩梅', gender: '女', age: 44, idCard: '3101**********0128', contacts: [{ name: '韩峰', phone: '139****2233', relation: 'sibling' }] },
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
  { patientId: 'P011', admissionNo: 'AD-20260620-088', serialNo: 'S-088', inAt: '2026-06-20 09:00', outAt: '2026-06-28 10:30', diagnosis: '社区获得性肺炎', doctor: '张主任', type: 'outpatient', insurance: '城镇职工医保', status: 'discharged', outcome: 'cured', archivedAt: '2026-06-28 10:35' },
  { patientId: 'P012', admissionNo: 'AD-20260615-072', serialNo: 'S-072', inAt: '2026-06-15 14:20', outAt: '2026-06-25 09:00', diagnosis: '甲亢复查', doctor: '李主任', type: 'outpatient', status: 'discharged', outcome: 'improved', archivedAt: '2026-06-25 09:10' },
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

// 首要联系人（列表/床头卡默认展示）
export function primaryContact(p?: Patient): Contact | undefined {
  return p?.contacts?.[0]
}

// 联系人格式化为单行字符串，用于导出与紧凑展示
export function formatContacts(p?: Patient): string {
  if (!p?.contacts?.length) return '—'
  return p.contacts
    .map((c) => {
      const rel = c.relation ? `(${CONTACT_RELATION_LABEL[c.relation]})` : ''
      return `${c.name}${rel} ${c.phone}`
    })
    .join('；')
}

export function activeAdmissions() {
  return ADMISSIONS.filter((a) => a.status === 'admitted')
}

export function archivedAdmissions() {
  return ADMISSIONS.filter((a) => a.status === 'discharged')
}

export function stayDays(inAt: string, outAt?: string): number {
  const start = new Date(inAt.replace(' ', 'T')).getTime()
  const end = outAt ? new Date(outAt.replace(' ', 'T')).getTime() : Date.now()
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)))
}
