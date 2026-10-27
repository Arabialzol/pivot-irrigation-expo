export interface ClientNozzleRequest {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  location?: string;
  notes?: string;
  towerCount: number;
  totalFeddans: number;
  totalRadius: number;
  flowM3PerHour: number;
  sprinklerCount?: number;
  regulatorPressurePsi?: number;
  firstSprinklerDistanceM?: number;
  sprinklerModel: string;
  createdAt: string;
}

// In-memory authentication state for mobile session
let _isAdminAuthenticated = false;

// Default initial sample requests to demonstrate to the supervisor immediately
let _clientRequests: ClientNozzleRequest[] = [
  {
    id: 'REQ-1085',
    clientName: 'مشروع مستقبل مصر - م. طارق الصاوي',
    phone: '01198765432',
    location: 'محور الضبعة - القطاع الأوسط',
    notes: 'مطلوب اعتماد جدول فوهات 8 أبراج + كابولي، روتاتور R3000 بضغط 20 PSI لمحصول القمح.',
    towerCount: 8,
    totalFeddans: 145,
    totalRadius: 440,
    flowM3PerHour: 260,
    sprinklerCount: 160,
    regulatorPressurePsi: 20,
    firstSprinklerDistanceM: 2.7,
    sprinklerModel: 'نيلسون روتاتور R3000',
    createdAt: '27 أكتوبر 2026، 01:15 م',
  },
  {
    id: 'REQ-1084',
    clientName: 'مزارع النيل الدولية - م. عادل إبراهيم',
    phone: '01234567890',
    location: 'الفرافرة - الوادي الجديد',
    notes: 'جهاز ري محوري 6 أبراج مع رشاشات سيننجر i-Wob UP3 ضغط 10 PSI.',
    towerCount: 6,
    totalFeddans: 95,
    totalRadius: 355,
    flowM3PerHour: 175,
    sprinklerCount: 128,
    regulatorPressurePsi: 10,
    firstSprinklerDistanceM: 2.5,
    sprinklerModel: 'سيننجر آي ووب (i-Wob UP3)',
    createdAt: '27 أكتوبر 2026، 12:40 م',
  },
  {
    id: 'REQ-1082',
    clientName: 'مزرعة الوادي الجديد - م. أحمد عبد الله',
    phone: '01023456789',
    location: 'توشكى - شرق العوينات',
    notes: 'مطلوب برمجة فوهات نيلسون D3000 لضغط 15 PSI، جاهز للتركيب فوراً.',
    towerCount: 7,
    totalFeddans: 125,
    totalRadius: 410,
    flowM3PerHour: 220,
    sprinklerCount: 148,
    regulatorPressurePsi: 15,
    firstSprinklerDistanceM: 2.8,
    sprinklerModel: 'نيلسون D3000 Sprayhead',
    createdAt: '27 أكتوبر 2026، 11:30 ص',
  },
];

export function isAdminAuthenticated(): boolean {
  return _isAdminAuthenticated;
}

export function setAdminAuthenticated(auth: boolean): void {
  _isAdminAuthenticated = auth;
}

export function getClientRequests(): ClientNozzleRequest[] {
  return _clientRequests;
}

export function saveClientRequest(
  req: Omit<ClientNozzleRequest, 'id' | 'createdAt'>
): ClientNozzleRequest {
  const newReq: ClientNozzleRequest = {
    ...req,
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  _clientRequests = [newReq, ..._clientRequests];
  return newReq;
}

export function deleteClientRequest(id: string): void {
  _clientRequests = _clientRequests.filter((r) => r.id !== id);
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  const trimmedUser = user.trim();
  const trimmedPass = pass.trim();
  // Valid user: "muzamil" and official site password "Okokyes123#"
  return trimmedUser.toLowerCase() === 'muzamil' && trimmedPass === 'Okokyes123#';
}
