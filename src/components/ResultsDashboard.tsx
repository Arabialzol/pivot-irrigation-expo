import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { PivotConfig, PivotResults } from '../types/pivot';
import { formatNumber, FEDDAN_VALUES } from '../utils/pivotMath';

interface ResultsDashboardProps {
  config: PivotConfig;
  results: PivotResults;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  config,
  results,
}) => {
  const stdInfo = FEDDAN_VALUES[config.feddanStandard];
  const { feddans, qirats, sahms } = results.feddanBreakdown;

  return (
    <View style={styles.container}>
      {/* Primary KPI Hero Card: Total Area in Feddans */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#34d399" />
            <Text style={styles.heroBadgeText}>{stdInfo.nameAr}</Text>
          </View>
          <Text style={styles.heroSubtitle}>المساحة الإجمالية المروية</Text>
        </View>

        <View style={styles.heroValueRow}>
          <Text style={styles.heroValue}>{formatNumber(results.totalFeddans, 2)}</Text>
          <Text style={styles.heroUnit}>فدان</Text>
        </View>

        {/* Traditional Breakdown: Feddans - Qirats - Sahms */}
        <View style={styles.breakdownBox}>
          <Text style={styles.breakdownTitle}>التفقيط الهندسي المعتمد:</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{feddans}</Text>
              <Text style={styles.breakdownLabel}>فدان</Text>
            </View>
            <Text style={styles.breakdownDivider}>·</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{qirats}</Text>
              <Text style={styles.breakdownLabel}>قيراط</Text>
            </View>
            <Text style={styles.breakdownDivider}>·</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>{sahms}</Text>
              <Text style={styles.breakdownLabel}>سهم</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Secondary Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Total Square Meters */}
        <View style={styles.metricCard}>
          <MaterialCommunityIcons name="texture-box" size={20} color="#38bdf8" />
          <Text style={styles.metricValue}>{formatNumber(results.totalAreaM2, 0)}</Text>
          <Text style={styles.metricLabel}>المساحة بالمتر المربع (م²)</Text>
        </View>

        {/* Total Hectares */}
        <View style={styles.metricCard}>
          <MaterialCommunityIcons name="earth" size={20} color="#10b981" />
          <Text style={styles.metricValue}>{formatNumber(results.totalHectares, 2)}</Text>
          <Text style={styles.metricLabel}>المساحة بالهكتار (ha)</Text>
        </View>

        {/* Wetted Radius */}
        <View style={styles.metricCard}>
          <MaterialCommunityIcons name="radius-outline" size={20} color="#f59e0b" />
          <Text style={styles.metricValue}>{Math.round(results.totalWettedRadius)} م</Text>
          <Text style={styles.metricLabel}>نصف قطر البلل الكلي</Text>
        </View>

        {/* Pipe Radius */}
        <View style={styles.metricCard}>
          <MaterialCommunityIcons name="pipe" size={20} color="#a855f7" />
          <Text style={styles.metricValue}>{Math.round(results.pivotPipeRadius)} م</Text>
          <Text style={styles.metricLabel}>طول ماسورة الهيكل</Text>
        </View>
      </View>

      {/* Tower-by-Tower Rings Breakdown Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <MaterialCommunityIcons name="table-large" size={18} color="#38bdf8" />
          <Text style={styles.tableTitle}>جدول توزيع المساحة على الأبراج</Text>
        </View>

        <View style={styles.tableHeading}>
          <Text style={[styles.thText, { flex: 1.2 }]}>البرج / النطاق</Text>
          <Text style={[styles.thText, { flex: 1 }]}>الطول (م)</Text>
          <Text style={[styles.thText, { flex: 1.2 }]}>المساحة (ف)</Text>
          <Text style={[styles.thText, { flex: 1.2 }]}>التراكمي (ف)</Text>
          <Text style={[styles.thText, { flex: 0.9 }]}>النسبة</Text>
        </View>

        {results.towerRings.map((ring) => (
          <View key={ring.towerIndex} style={styles.tableRow}>
            <Text style={[styles.tdText, styles.tdBold, { flex: 1.2, color: '#f8fafc' }]}>
              برج {ring.towerIndex}
            </Text>
            <Text style={[styles.tdText, { flex: 1 }]}>{formatNumber(ring.spanLength, 1)}</Text>
            <Text style={[styles.tdText, { flex: 1.2, color: '#38bdf8' }]}>
              {formatNumber(ring.ringFeddans, 2)}
            </Text>
            <Text style={[styles.tdText, { flex: 1.2, color: '#34d399' }]}>
              {formatNumber(ring.cumulativeFeddans, 2)}
            </Text>
            <Text style={[styles.tdText, { flex: 0.9, color: '#94a3b8' }]}>
              {formatNumber(ring.percentageOfTotal, 1)}%
            </Text>
          </View>
        ))}

        {/* Overhang Row */}
        {config.overhangLength > 0 && (
          <View style={[styles.tableRow, styles.specialRow]}>
            <Text style={[styles.tdText, styles.tdBold, { flex: 1.2, color: '#06b6d4' }]}>
              الكابولي
            </Text>
            <Text style={[styles.tdText, { flex: 1 }]}>{formatNumber(config.overhangLength, 1)}</Text>
            <Text style={[styles.tdText, { flex: 1.2, color: '#06b6d4' }]}>
              {formatNumber(results.overhangRing.ringFeddans, 2)}
            </Text>
            <Text style={[styles.tdText, { flex: 1.2 }]}>-</Text>
            <Text style={[styles.tdText, { flex: 0.9, color: '#94a3b8' }]}>
              {formatNumber(results.overhangRing.percentageOfTotal, 1)}%
            </Text>
          </View>
        )}

        {/* End Gun Row */}
        {config.hasEndGun && results.endGunRing && (
          <View style={[styles.tableRow, styles.specialRow]}>
            <Text style={[styles.tdText, styles.tdBold, { flex: 1.2, color: '#f59e0b' }]}>
              المدفع
            </Text>
            <Text style={[styles.tdText, { flex: 1 }]}>{formatNumber(config.endGunThrow, 1)}</Text>
            <Text style={[styles.tdText, { flex: 1.2, color: '#f59e0b' }]}>
              {formatNumber(results.endGunRing.ringFeddans, 2)}
            </Text>
            <Text style={[styles.tdText, { flex: 1.2 }]}>-</Text>
            <Text style={[styles.tdText, { flex: 0.9, color: '#94a3b8' }]}>
              {formatNumber(results.endGunRing.percentageOfTotal, 1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: '#0c4a6e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#0284c7',
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#075985',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  heroBadgeText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: '#bae6fd',
    fontSize: 13,
    fontWeight: '600',
  },
  heroValueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  heroUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38bdf8',
  },
  breakdownBox: {
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    borderRadius: 10,
    padding: 12,
  },
  breakdownTitle: {
    fontSize: 11,
    color: '#93c5fd',
    textAlign: 'right',
    marginBottom: 6,
    fontWeight: '600',
  },
  breakdownRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  breakdownLabel: {
    fontSize: 10,
    color: '#7dd3fc',
    marginTop: 2,
    fontWeight: '600',
  },
  breakdownDivider: {
    fontSize: 18,
    color: '#0284c7',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'flex-end',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'right',
  },
  tableCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  tableHeading: {
    flexDirection: 'row-reverse',
    backgroundColor: '#020617',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    alignItems: 'center',
  },
  specialRow: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  tdText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  tdBold: {
    fontWeight: '700',
  },
});
