import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { PivotConfig, PivotResults } from '../types/pivot';
import { saveClientRequest } from '../utils/nozzleRequests';
import { formatNumber } from '../utils/pivotMath';

interface NozzleLockGatewayProps {
  pivotConfig: PivotConfig;
  pivotResults: PivotResults;
  onOpenLogin: () => void;
}

export const NozzleLockGateway: React.FC<NozzleLockGatewayProps> = ({
  pivotConfig,
  pivotResults,
  onOpenLogin,
}) => {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRequest = () => {
    if (!clientName.trim() || !phone.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم العميل ورقم الهاتف على الأقل لتقديم الطلب.');
      return;
    }

    saveClientRequest({
      clientName: clientName.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      towerCount: pivotConfig.towerCount,
      totalFeddans: pivotResults.totalFeddans,
      totalRadius: pivotResults.totalWettedRadius,
      flowM3PerHour: pivotResults.hydraulic.requiredFlowM3PerHour,
      sprinklerModel: 'Nelson / Universal',
    });

    setSubmitted(true);
    Alert.alert(
      'تم إرسال الطلب بنجاح',
      'تم تسجيل طلبك لتصميم وبرمجة فوهات وبخاخات المحور، وسيتواصل معك المهندس المشرف في أقرب وقت.'
    );
  };

  return (
    <View style={styles.card}>
      {/* Lock Banner */}
      <View style={styles.lockBanner}>
        <View style={styles.lockIconCircle}>
          <MaterialCommunityIcons name="lock" size={26} color="#38bdf8" />
        </View>
        <Text style={styles.lockTitle}>قسم فوهات وبخاخات المحور محمي</Text>
        <Text style={styles.lockDescription}>
          يتطلب حساب وتصميم فوهات البخاخات تصريح المهندس المشرف ("muzamil"). يرجى تسجيل الدخول للوصول إلى الجداول وحسابات التصريف الكاملة.
        </Text>

        <TouchableOpacity style={styles.loginBtn} onPress={onOpenLogin} activeOpacity={0.8}>
          <MaterialCommunityIcons name="key-variant" size={18} color="#ffffff" />
          <Text style={styles.loginBtnText}>تسجيل دخول المهندس المشرف</Text>
        </TouchableOpacity>
      </View>

      {/* Client Request Form */}
      <View style={styles.requestSection}>
        <View style={styles.requestHeader}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#10b981" />
          <Text style={styles.requestTitle}>طلب تصميم وبرمجة فوهات من المهندس المشرف</Text>
        </View>
        <Text style={styles.requestSubtitle}>
          إذا كنت عميلاً أو مزارعاً، يمكنك إرسال أبعاد المحور المحددة حالياً لتجهيز جدول الفوهات واعتماده:
        </Text>

        <View style={styles.formGrid}>
          <View style={styles.field}>
            <Text style={styles.label}>اسم العميل / المزرعة:</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: مزرعة الوادي الأخضر"
              placeholderTextColor="#64748b"
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>رقم الجوال أو واتساب:</Text>
            <TextInput
              style={styles.input}
              placeholder="+966 / +20 ..."
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ملاحظات إضافية (اختياري):</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="مثال: ضغط المضخة الفعلي، نوع المحصول، إلخ..."
              placeholderTextColor="#64748b"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitted && styles.submitBtnDone]}
            onPress={handleSubmitRequest}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={submitted ? 'check-circle' : 'send'}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.submitBtnText}>
              {submitted ? 'تم إرسال الطلب للمهندس' : 'إرسال طلب برمجة الفوهات'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  lockBanner: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
    marginBottom: 16,
  },
  lockIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  lockDescription: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  loginBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  requestSection: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  requestHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requestTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  requestSubtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: 12,
  },
  formGrid: {
    gap: 10,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 12,
    textAlign: 'right',
  },
  submitBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 6,
  },
  submitBtnDone: {
    backgroundColor: '#0f766e',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
