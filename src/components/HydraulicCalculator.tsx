import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import {
  ClimateSeasonType,
  CropType,
  PivotConfig,
  PivotResults,
} from '../types/pivot';
import { formatNumber, CROPS_INFO, CLIMATE_SEASONS_INFO } from '../utils/pivotMath';

interface HydraulicCalculatorProps {
  config: PivotConfig;
  results: PivotResults;
  onChange: (updated: PivotConfig) => void;
}

export const HydraulicCalculator: React.FC<HydraulicCalculatorProps> = ({
  config,
  results,
  onChange,
}) => {
  const { hydraulic, operational, agronomic } = results;

  // Local text state so the user can type freely without the field resetting
  const [depthText, setDepthText] = useState(String(config.targetWaterDepthMm));
  const [inflowText, setInflowText] = useState(String(config.inflowRateM3PerHour));

  // Keep local text in sync if config changes from outside (e.g. "Apply Recommendation" button)
  useEffect(() => {
    setDepthText(String(config.targetWaterDepthMm));
  }, [config.targetWaterDepthMm]);

  useEffect(() => {
    setInflowText(String(config.inflowRateM3PerHour));
  }, [config.inflowRateM3PerHour]);

  const handleTimerPercentChange = (delta: number) => {
    const newPercent = Math.max(5, Math.min(100, config.timerPercent + delta));
    onChange({ ...config, timerPercent: newPercent });
  };

  const handleHoursChange = (delta: number) => {
    const newHours = Math.max(1, Math.min(24, config.dailyOperatingHours + delta));
    onChange({ ...config, dailyOperatingHours: newHours });
  };

  // Depth: update local text immediately, commit valid number on every keystroke
  const handleDepthText = (text: string) => {
    setDepthText(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      onChange({
        ...config,
        targetWaterDepthMm: Math.max(1, Math.min(30, val)),
        hydraulicInputMode: 'depth',
      });
    }
  };

  // Flow: update local text immediately, commit valid number on every keystroke
  const handleInflowText = (text: string) => {
    setInflowText(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      onChange({
        ...config,
        inflowRateM3PerHour: Math.max(1, Math.min(2000, val)),
        hydraulicInputMode: 'flow',
      });
    }
  };

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="gauge" size={20} color="#38bdf8" />
        <Text style={styles.cardTitle}>الحاسبة الهيدروليكية والتشغيل الزراعي</Text>
      </View>

      {/* Hydraulic Mode Switch: Depth vs Flow */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            config.hydraulicInputMode === 'depth' && styles.modeTabActive,
          ]}
          onPress={() => onChange({ ...config, hydraulicInputMode: 'depth' })}
        >
          <Text
            style={[
              styles.modeTabText,
              config.hydraulicInputMode === 'depth' && styles.modeTabTextActive,
            ]}
          >
            تحديد عمق الري (مم/يوم)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            config.hydraulicInputMode === 'flow' && styles.modeTabActive,
          ]}
          onPress={() => onChange({ ...config, hydraulicInputMode: 'flow' })}
        >
          <Text
            style={[
              styles.modeTabText,
              config.hydraulicInputMode === 'flow' && styles.modeTabTextActive,
            ]}
          >
            تحديد تدفق البئر (م³/ساعة)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Primary Input Field */}
      {config.hydraulicInputMode === 'depth' ? (
        <View style={styles.inputHeroBox}>
          <View style={styles.inputHeroLeft}>
            <Text style={styles.inputHeroTitle}>عمق مياه الري اليومي المطلوب:</Text>
            <Text style={styles.inputHeroSubtitle}>كمية الماء المعطاة للحقل في اليوم الواحد</Text>
          </View>
          <View style={styles.numberInputBox}>
            <TextInput
              style={styles.heroInput}
              keyboardType="decimal-pad"
              value={depthText}
              onChangeText={handleDepthText}
              placeholder="0"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputUnit}>مم/يوم</Text>
          </View>
        </View>
      ) : (
        <View style={styles.inputHeroBox}>
          <View style={styles.inputHeroLeft}>
            <Text style={styles.inputHeroTitle}>معدل تصريف المضخة / البئر المتاح:</Text>
            <Text style={styles.inputHeroSubtitle}>كمية المياه الداخلة لقاعدة المحور في الساعة</Text>
          </View>
          <View style={styles.numberInputBox}>
            <TextInput
              style={styles.heroInput}
              keyboardType="decimal-pad"
              value={inflowText}
              onChangeText={handleInflowText}
              placeholder="0"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputUnit}>م³/س</Text>
          </View>
        </View>
      )}

      {/* Operational Steppers: Daily Hours & Timer % */}
      <View style={styles.twoCols}>
        {/* Daily Pumping Hours */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperCardTitle}>ساعات الضخ اليومية:</Text>
          <View style={styles.stepperCtrl}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleHoursChange(-1)}>
              <MaterialCommunityIcons name="minus" size={16} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.stepVal}>{config.dailyOperatingHours} س/يوم</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleHoursChange(1)}>
              <MaterialCommunityIcons name="plus" size={16} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Speed Timer % */}
        <View style={styles.stepperCard}>
          <Text style={styles.stepperCardTitle}>سرعة التايمر (%):</Text>
          <View style={styles.stepperCtrl}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleTimerPercentChange(-5)}>
              <MaterialCommunityIcons name="minus" size={16} color="#f8fafc" />
            </TouchableOpacity>
            <Text style={styles.stepVal}>{config.timerPercent}%</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => handleTimerPercentChange(5)}>
              <MaterialCommunityIcons name="plus" size={16} color="#f8fafc" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Primary Hydraulic Results Dashboard */}
      <View style={styles.resultsGrid}>
        <View style={styles.resultItem}>
          <MaterialCommunityIcons name="water" size={20} color="#38bdf8" />
          <Text style={styles.resultValue}>{formatNumber(hydraulic.requiredFlowM3PerHour, 1)}</Text>
          <Text style={styles.resultLabel}>التدفق المطلوب (م³/س)</Text>
          <Text style={styles.resultSub}>{formatNumber(hydraulic.requiredFlowGpm, 0)} GPM</Text>
        </View>

        <View style={styles.resultItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#10b981" />
          <Text style={styles.resultValue}>{formatNumber(operational.actualRotationHours, 1)}</Text>
          <Text style={styles.resultLabel}>زمن الدورة الكاملة</Text>
          <Text style={styles.resultSub}>{formatNumber(operational.actualRotationDays, 1)} يوم مستمر</Text>
        </View>

        <View style={styles.resultItem}>
          <MaterialCommunityIcons name="speedometer" size={20} color="#f59e0b" />
          <Text style={styles.resultValue}>{formatNumber(operational.lastTowerSpeedActualMPerHr, 1)}</Text>
          <Text style={styles.resultLabel}>سرعة آخر برج (م/س)</Text>
          <Text style={styles.resultSub}>محيط {Math.round(operational.lastTowerCircumferenceM)} م</Text>
        </View>

        <View style={styles.resultItem}>
          <MaterialCommunityIcons name="waves" size={20} color="#a855f7" />
          <Text style={styles.resultValue}>{formatNumber(operational.appliedDepthMmPerPass, 1)}</Text>
          <Text style={styles.resultLabel}>العمق لكل دورة</Text>
          <Text style={styles.resultSub}>مم في اللفة الواحدة</Text>
        </View>
      </View>

      {/* Agronomic Advisory Engine: Crop & Climate Requirements */}
      <View style={styles.agronomicBox}>
        <View style={styles.agronomicHeader}>
          <MaterialCommunityIcons name="sprout" size={18} color="#34d399" />
          <Text style={styles.agronomicTitle}>دليل الاحتياج المائي للمحاصيل والمناخ</Text>
        </View>

        {/* Crops Horizontal Scroll */}
        <Text style={styles.subSectionTitle}>اختر المحصول الزراعي:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {Object.entries(CROPS_INFO).map(([key, crop]) => {
            const isSelected = (config.cropType || 'wheat') === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.cropChip, isSelected && styles.cropChipActive]}
                onPress={() => onChange({ ...config, cropType: key as CropType })}
              >
                <Text style={[styles.cropChipText, isSelected && styles.cropChipTextActive]}>
                  {crop.nameAr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Climate Season Horizontal Scroll */}
        <Text style={[styles.subSectionTitle, { marginTop: 10 }]}>فصل المناخ والحرارة:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {Object.entries(CLIMATE_SEASONS_INFO).map(([key, season]) => {
            const isSelected = (config.climateSeason || 'summer_mild') === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.seasonChip, isSelected && styles.seasonChipActive]}
                onPress={() => onChange({ ...config, climateSeason: key as ClimateSeasonType })}
              >
                <Text style={[styles.seasonChipText, isSelected && styles.seasonChipTextActive]}>
                  {season.nameAr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Agronomic Recommendation Banner */}
        <View style={styles.recBanner}>
          <View style={styles.recItem}>
            <Text style={styles.recValue}>{formatNumber(agronomic.recommendedDepthMm, 1)} مم/يوم</Text>
            <Text style={styles.recLabel}>العمق المقترح علمياً</Text>
          </View>
          <View style={styles.recDivider} />
          <View style={styles.recItem}>
            <Text style={styles.recValue}>{formatNumber(agronomic.grossDailyVolumeM3PerFeddan, 1)} م³</Text>
            <Text style={styles.recLabel}>المقنن / فدان / يوم</Text>
          </View>
          <View style={styles.recDivider} />
          <View style={styles.recItem}>
            <Text style={styles.recValue}>{formatNumber(agronomic.cropKc, 2)}</Text>
            <Text style={styles.recLabel}>معامل المحصول Kc</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyRecBtn}
          onPress={() =>
            onChange({
              ...config,
              targetWaterDepthMm: agronomic.recommendedDepthMm,
              hydraulicInputMode: 'depth',
            })
          }
        >
          <MaterialCommunityIcons name="check-all" size={16} color="#ffffff" />
          <Text style={styles.applyRecBtnText}>
            تطبيق المقنن العلمي ({formatNumber(agronomic.recommendedDepthMm, 1)} مم/يوم) على المحور
          </Text>
        </TouchableOpacity>
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
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  modeTabs: {
    flexDirection: 'row-reverse',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#0c4a6e',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  modeTabTextActive: {
    color: '#38bdf8',
  },
  inputHeroBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  inputHeroLeft: {
    flex: 1,
    paddingLeft: 8,
  },
  inputHeroTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'right',
  },
  inputHeroSubtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  numberInputBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 8,
    width: 110,
  },
  heroInput: {
    flex: 1,
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 6,
  },
  inputUnit: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  twoCols: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 14,
  },
  stepperCard: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stepperCardTitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
  stepperCtrl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  resultsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  resultItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f8fafc',
    marginTop: 4,
  },
  resultLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  resultSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  agronomicBox: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  agronomicHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  agronomicTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34d399',
  },
  subSectionTitle: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row-reverse',
    gap: 6,
    paddingBottom: 4,
  },
  cropChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cropChipActive: {
    backgroundColor: '#065f46',
    borderColor: '#34d399',
  },
  cropChipText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  cropChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  seasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  seasonChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  seasonChipText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  seasonChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  recBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  recItem: {
    alignItems: 'center',
  },
  recValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  recLabel: {
    fontSize: 9,
    color: '#a7f3d0',
    marginTop: 2,
  },
  recDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  applyRecBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    gap: 6,
  },
  applyRecBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
