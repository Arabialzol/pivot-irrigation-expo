import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import {
  ClientNozzleRequest,
  getClientRequests,
  deleteClientRequest,
} from '../utils/nozzleRequests';
import { formatNumber } from '../utils/pivotMath';

interface ClientRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSelect?: (request: ClientNozzleRequest) => void;
}

export const ClientRequestsModal: React.FC<ClientRequestsModalProps> = ({
  isOpen,
  onClose,
  onRequestSelect,
}) => {
  const [requests, setRequests] = useState<ClientNozzleRequest[]>(() => getClientRequests());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync latest requests when opening or updating
  React.useEffect(() => {
    if (isOpen) {
      const latest = getClientRequests();
      setRequests([...latest]);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const refreshList = () => {
    const latest = getClientRequests();
    setRequests([...latest]);
    if (currentIndex >= latest.length) {
      setCurrentIndex(Math.max(0, latest.length - 1));
    }
  };

  const handleDelete = (id: string) => {
    deleteClientRequest(id);
    refreshList();
  };

  const handleNext = () => {
    if (currentIndex < requests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('تعذر الاتصال', 'يرجى التحقق من دعم الاتصال في الجهاز');
    });
  };

  const handleWhatsApp = (phone: string, clientName: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(
      `السلام عليكم ${clientName}، بخصوص طلب جدول فوهات المحور الزراعي، المهندس مزمل معك.`
    );
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${msg}`).catch(() => {
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`).catch(() => {
        Alert.alert('واتساب غير متوفر', 'لم يتم العثور على تطبيق واتساب على الجهاز');
      });
    });
  };

  const currentReq = requests[currentIndex];

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.modalLogo}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.titleText}>طلبات الجداول الواردة للمشرف</Text>
                <Text style={styles.subText}>
                  معطيات ومواصفات المحاور المحجوبة للعملاء ({requests.length} طلب)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Bar for scrolling/switching between requests */}
          {requests.length > 0 && (
            <View style={styles.navBar}>
              <TouchableOpacity
                style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                onPress={handlePrev}
                disabled={currentIndex === 0}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={16} color={currentIndex === 0 ? '#475569' : '#38bdf8'} />
                <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>السابق</Text>
              </TouchableOpacity>

              <View style={styles.navCounter}>
                <Text style={styles.navCounterText}>
                  الطلب <Text style={styles.navCounterHighlight}>{currentIndex + 1}</Text> من أصل <Text style={styles.navCounterHighlight}>{requests.length}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.navBtn, currentIndex === requests.length - 1 && styles.navBtnDisabled]}
                onPress={handleNext}
                disabled={currentIndex === requests.length - 1}
                activeOpacity={0.7}
              >
                <Text style={[styles.navBtnText, currentIndex === requests.length - 1 && styles.navBtnTextDisabled]}>التالي</Text>
                <Ionicons name="chevron-back" size={16} color={currentIndex === requests.length - 1 ? '#475569' : '#38bdf8'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="inbox-outline" size={48} color="#475569" />
                <Text style={styles.emptyTitle}>لا توجد طلبات جديدة حالياً</Text>
                <Text style={styles.emptyDesc}>
                  عندما يرسل أي عميل أو مزارع طلباً من الشاشة الرئيسية، ستظهر كافة المعطيات والمواصفات هنا فوراً للمشرف.
                </Text>
              </View>
            ) : currentReq ? (
              <View key={currentReq.id} style={styles.requestCard}>
                {/* Card Header */}
                <View style={styles.cardTopRow}>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{currentReq.clientName}</Text>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color="#94a3b8" />
                      <Text style={styles.metaText}>{currentReq.createdAt}</Text>
                      <Text style={styles.metaBadge}>{currentReq.id}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(currentReq.id)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                  </TouchableOpacity>
                </View>

                {/* Pivot Technical Specifications Grid (المعطيات) */}
                <View style={styles.specsContainer}>
                  <Text style={styles.specsTitle}>معطيات ومواصفات الجهاز المطلوبة:</Text>
                  <View style={styles.specsGrid}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>عدد الأبراج</Text>
                      <Text style={styles.specValue}>{currentReq.towerCount} برج</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>المساحة الكلية</Text>
                      <Text style={styles.specValue}>{formatNumber(currentReq.totalFeddans, 1)} فدان</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>نصف القطر (الطول)</Text>
                      <Text style={styles.specValue}>{formatNumber(currentReq.totalRadius, 1)} م</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>التصريف الإجمالي</Text>
                      <Text style={[styles.specValue, { color: '#38bdf8' }]}>
                        {formatNumber(currentReq.flowM3PerHour, 1)} م³/س
                      </Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>موديل الرشاش</Text>
                      <Text style={styles.specValue} numberOfLines={1}>
                        {currentReq.sprinklerModel || 'نيلسون D3000'}
                      </Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>منظم الضغط</Text>
                      <Text style={styles.specValue}>
                        {currentReq.regulatorPressurePsi || 15} PSI
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Notes / Details */}
                {currentReq.notes ? (
                  <View style={styles.notesBox}>
                    <MaterialCommunityIcons name="note-text-outline" size={14} color="#f59e0b" />
                    <Text style={styles.notesText}>{currentReq.notes}</Text>
                  </View>
                ) : null}

                {/* Client Contact & Actions Row */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(currentReq.phone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={14} color="#ffffff" />
                    <Text style={styles.callBtnText}>{currentReq.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappBtn}
                    onPress={() => handleWhatsApp(currentReq.phone, currentReq.clientName)}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="whatsapp" size={14} color="#ffffff" />
                    <Text style={styles.whatsappBtnText}>واتساب</Text>
                  </TouchableOpacity>

                  {onRequestSelect && (
                    <TouchableOpacity
                      style={styles.loadBtn}
                      onPress={() => {
                        onRequestSelect(currentReq);
                        onClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="download-box-outline" size={15} color="#38bdf8" />
                      <Text style={styles.loadBtnText}>تحميل المعطيات</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeFooterText}>إغلاق النافذة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#020617',
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2,
  },
  modalLogo: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'right',
  },
  subText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  navBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  navBtnDisabled: {
    borderColor: '#334155',
    backgroundColor: '#090d16',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
  },
  navBtnTextDisabled: {
    color: '#475569',
  },
  navCounter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCounterText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  navCounterHighlight: {
    color: '#f59e0b',
    fontWeight: '800',
    fontSize: 13,
  },
  body: {
    padding: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  requestCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  metaBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  specsContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginVertical: 6,
  },
  specsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
    textAlign: 'right',
    marginBottom: 8,
  },
  specsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  specItem: {
    width: '48%',
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'flex-end',
  },
  specLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
    textAlign: 'right',
    marginTop: 2,
  },
  notesBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  notesText: {
    fontSize: 11,
    color: '#cbd5e1',
    flex: 1,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  callBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  whatsappBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  whatsappBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  loadBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loadBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#020617',
  },
  closeFooterBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeFooterText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
});
