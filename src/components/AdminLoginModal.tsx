import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { verifyAdminCredentials, setAdminAuthenticated } from '../utils/nozzleRequests';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    if (verifyAdminCredentials(username, password)) {
      setIsSuccess(true);
      setAdminAuthenticated(true);
      setTimeout(() => {
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        onSuccess();
        onClose();
      }, 600);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.');
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
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
                <Text style={styles.titleText}>تسجيل دخول المهندس المشرف</Text>
                <Text style={styles.subText}>فتح وإدارة جداول فوهات وبخاخات المحور</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.body}>
            {error && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#f43f5e" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isSuccess && (
              <View style={styles.successBox}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10b981" />
                <Text style={styles.successText}>تم التحقق بنجاح! جاري فتح القسم الهندسي...</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>اسم المستخدم (Username):</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="muzamil"
                  placeholderTextColor="#64748b"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
                <MaterialCommunityIcons name="account-outline" size={18} color="#64748b" />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>كلمة المرور (Password):</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isSuccess && styles.loginBtnSuccess]}
              onPress={handleSubmit}
              disabled={isSuccess}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="lock-open-outline" size={18} color="#ffffff" />
              <Text style={styles.loginBtnText}>
                {isSuccess ? 'تمت المطابقة بنجاح' : 'تسجيل الدخول وفتح الجدول'}
              </Text>
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
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
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
    fontSize: 10,
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
  body: {
    padding: 16,
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#f43f5e',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  successBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 8,
    padding: 10,
  },
  successText: {
    color: '#10b981',
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'right',
  },
  inputBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
    paddingVertical: 10,
    textAlign: 'right',
  },
  loginBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    marginTop: 6,
  },
  loginBtnSuccess: {
    backgroundColor: '#059669',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
