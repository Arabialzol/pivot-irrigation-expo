import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleBox}>
              <MaterialCommunityIcons name="book-open-page-variant" size={22} color="#38bdf8" />
              <Text style={styles.modalTitle}>الدليل الهندسي والمعادلات الحسابية</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Feddan Definition */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="certificate" size={18} color="#34d399" />
                <Text style={styles.sectionTitle}>1. معايير الفدان والتفقيط المعتمد</Text>
              </View>
              <Text style={styles.paragraph}>
                الفدان هو وحدة المساحة الزراعية القياسية في مصر والسودان. يتكون كل فدان من:
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>1 فدان = 24 قيراط = 576 سهم</Text>
                <Text style={styles.formulaText}>1 قيراط = 24 سهم = 175.035 م² (مصري)</Text>
              </View>
              <View style={styles.bulletList}>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.bold}>الفدان المصري المعياري:</Text> 4200.833 م² (القصبة = 3.55 متر، 333 وثلث قصبة مربعة).
                </Text>
                <Text style={styles.bulletItem}>
                  • <Text style={styles.bold}>الفدان السوداني القياسي:</Text> 4200.000 م² بالضبط.
                </Text>
              </View>
            </View>

            {/* 2. Pivot Area Math */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="circle-slice-8" size={18} color="#38bdf8" />
                <Text style={styles.sectionTitle}>2. معادلات حساب مساحات المحاور والأبراج</Text>
              </View>
              <Text style={styles.paragraph}>
                نظراً لأن جهاز الري المحوري يتحرك في مسار دائري، فإن المساحة المروية الإجمالية تحسب بالمعادلة:
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>Area (م²) = π × R²</Text>
                <Text style={styles.formulaText}>المساحة بالفدان = (π × R²) / مساحة الفدان المعياري</Text>
              </View>
              <Text style={styles.paragraph}>
                مساحة حلقة البرج (Ring Area):
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>Ring Area = π × (R_outer² - R_inner²)</Text>
              </View>
              <Text style={styles.noteText}>
                * ملاحظة هامة: تزداد مساحة البرج كلما ابتعدنا عن المركز لأن محيط الدائرة يكبر، ولذلك فإن البرج الأخير يغطي النسبة الأكبر من مساحة الحقل.
              </Text>
            </View>

            {/* 3. Sprinkler Nozzle Sizing */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="water-pump" size={18} color="#f59e0b" />
                <Text style={styles.sectionTitle}>3. هيدروليكا وتصريف فوهات البخاخات</Text>
              </View>
              <Text style={styles.paragraph}>
                لكي يحصل النبات على كمية مياه متساوية في جميع أجزاء الحقل، يجب أن يتناسب تصريف كل بخاخ (q_i) طردياً مع بُعده عن المركز (r_i):
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>q_i = Q_boom × (r_i / Σ r)</Text>
              </View>
              <Text style={styles.paragraph}>
                معادلة فوهات نيلسون الرسمية 3TN (بمضاعفات 1/128 بوصة):
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>q (GPM) = 0.001723 × (Nozzle_3TN)² × √P</Text>
              </View>
              <Text style={styles.paragraph}>
                معادلة فوهات UP3 (هنتر وسيننجر بمضاعفات 1/64 بوصة):
              </Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>q (GPM) = 0.002415 × (Nozzle_UP3)² × √P</Text>
              </View>
            </View>

            {/* 4. Speed & Rotation Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="timer-outline" size={18} color="#a855f7" />
                <Text style={styles.sectionTitle}>4. سرعة المحور وزمن الدورة الكاملة</Text>
              </View>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>محيط مسار آخر برج = 2 × π × R_last</Text>
                <Text style={styles.formulaText}>السرعة الفعلية = السرعة القصوى (100%) × (التايمر % / 100)</Text>
                <Text style={styles.formulaText}>زمن الدورة (ساعات) = محيط المسار / السرعة الفعلية</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Close Button */}
          <TouchableOpacity style={styles.modalFooterBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalFooterBtnText}>إغلاق الدليل</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  scrollBody: {
    paddingVertical: 14,
  },
  section: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  paragraph: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 8,
  },
  formulaBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    gap: 4,
  },
  formulaText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#38bdf8',
    fontWeight: '700',
    textAlign: 'left',
  },
  bulletList: {
    marginTop: 6,
    gap: 4,
  },
  bulletItem: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
    textAlign: 'right',
  },
  bold: {
    fontWeight: '700',
    color: '#f8fafc',
  },
  noteText: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 6,
    lineHeight: 16,
    textAlign: 'right',
  },
  modalFooterBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 6,
  },
  modalFooterBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
});
