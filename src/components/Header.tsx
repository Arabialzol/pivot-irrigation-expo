import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { FeddanStandard, PivotConfig } from '../types/pivot';

interface HeaderProps {
  config: PivotConfig;
  onStandardChange: (std: FeddanStandard) => void;
  onReset: () => void;
  onOpenReport: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onStandardChange,
  onReset,
  onOpenReport,
  onOpenGuide,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Top Branding Row */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Aqua Pivot</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>حاسبة وهندسة الري المحوري</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOpenGuide}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onReset}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.reportBtn]}
            onPress={onOpenReport}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#0284c7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feddan Standard Selector Bar */}
      <View style={styles.standardBar}>
        <Text style={styles.standardLabel}>معيار الفدان:</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.standardTab,
              config.feddanStandard === 'egyptian' && styles.standardTabActive,
            ]}
            onPress={() => onStandardChange('egyptian')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.standardTabText,
                config.feddanStandard === 'egyptian' && styles.standardTabTextActive,
              ]}
            >
              مصري (4200.83 م²)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.standardTab,
              config.feddanStandard === 'sudanese' && styles.standardTabActive,
            ]}
            onPress={() => onStandardChange('sudanese')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.standardTabText,
                config.feddanStandard === 'sudanese' && styles.standardTabTextActive,
              ]}
            >
              سوداني (4200.00 م²)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  proBadge: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proText: {
    color: '#e0f2fe',
    fontSize: 10,
    fontWeight: '800',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtn: {
    backgroundColor: '#0c4a6e',
    borderColor: '#0284c7',
  },
  standardBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  standardLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginRight: 6,
  },
  tabContainer: {
    flexDirection: 'row-reverse',
    flex: 1,
    gap: 6,
  },
  standardTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  standardTabActive: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  standardTabText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  standardTabTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
