import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ManufacturerId,
  PivotConfig,
  PresetFieldSize,
  SpacingPresetType,
} from '../types/pivot';
import {
  COMMON_PIVOT_PRESETS,
  MANUFACTURER_PRESETS,
  SPACING_PRESETS,
  calculatePivotSpanNozzles,
} from '../utils/pivotMath';

interface PivotFormProps {
  config: PivotConfig;
  onChange: (updated: PivotConfig) => void;
  firstSprinklerDistanceM?: number;
  onSyncNozzles?: (totalCount: number) => void;
}

const MANUFACTURERS: { id: ManufacturerId; nameAr: string; origin: string }[] = [
  { id: 'valley', nameAr: 'فالي (Valley)', origin: 'أمريكا' },
  { id: 'zimmatic', nameAr: 'زيماتيك (Zimmatic)', origin: 'أمريكا' },
  { id: 'reinke', nameAr: 'رينكي (Reinke)', origin: 'أمريكا' },
  { id: 'bauer', nameAr: 'باور (Bauer)', origin: 'النمسا' },
  { id: 'custom', nameAr: 'مخصص (أبعاد حرة)', origin: 'حر' },
];

export const PivotForm: React.FC<PivotFormProps> = ({
  config,
  onChange,
  firstSprinklerDistanceM = 3.0,
  onSyncNozzles,
}) => {
  const [showSpansAccordion, setShowSpansAccordion] = useState(false);

  // ── Local text state so typing works freely without the field resetting ──
  const [spanText,     setSpanText]     = useState(String(config.uniformSpanLength));
  const [overhangText, setOverhangText] = useState(String(config.overhangLength));
  const [endGunText,   setEndGunText]   = useState(String(config.endGunThrow));
  const [spanTexts,    setSpanTexts]    = useState<string[]>(config.spanLengths.map(String));

  // Sync from outside when preset changes
  useEffect(() => { setSpanText(String(config.uniformSpanLength)); },  [config.uniformSpanLength]);
  useEffect(() => { setOverhangText(String(config.overhangLength)); }, [config.overhangLength]);
  useEffect(() => { setEndGunText(String(config.endGunThrow)); },      [config.endGunThrow]);
  useEffect(() => { setSpanTexts(config.spanLengths.map(String)); },   [config.spanLengths]);

  const currentPreset = MANUFACTURER_PRESETS[config.manufacturer];
  const currentSpacing = SPACING_PRESETS[config.spanSpacingPreset || 'standard_108'] || SPACING_PRESETS.standard_108;
  const spanMath = calculatePivotSpanNozzles(config, firstSprinklerDistanceM || 3.0);
  const spansList = spanMath.spansBreakdown || [];
  const overhangNozzles = spanMath.overhangBreakdown?.nozzleCount ?? 0;

  const handleSpanNozzleCountChange = (spanIndex: number, delta: number) => {
    const current = (config.customSpanNozzleCounts && typeof config.customSpanNozzleCounts[spanIndex] === 'number')
      ? config.customSpanNozzleCounts[spanIndex]
      : (spansList[spanIndex]?.nozzleCount ?? 18);
    const newCounts = [...(config.customSpanNozzleCounts || [])];
    while (newCounts.length <= spanIndex) {
      newCounts.push(spansList[newCounts.length]?.nozzleCount ?? 18);
    }
    newCounts[spanIndex] = Math.max(0, current + delta);
    onChange({ ...config, customSpanNozzleCounts: newCounts });
  };

  // Apply a manufacturer preset
  const handleSelectManufacturer = (mfgId: ManufacturerId) => {
    const preset = MANUFACTURER_PRESETS[mfgId];
    if (!preset) return;
    const newLengths = Array(config.towerCount).fill(preset.defaultSpan);
    onChange({
      ...config,
      manufacturer: mfgId,
      uniformSpanLength: preset.defaultSpan,
      spanLengths: newLengths,
      overhangLength: preset.defaultOverhang,
      lastTowerSpeedAt100: preset.typicalMaxSpeedMPerHr,
    });
  };

  // Apply common pivot size preset
  const handleSelectPreset = (preset: PresetFieldSize) => {
    const mfgPreset = MANUFACTURER_PRESETS[preset.manufacturer];
    const newLengths = Array(preset.towers).fill(preset.spanLength);
    onChange({
      ...config,
      manufacturer: preset.manufacturer,
      towerCount: preset.towers,
      uniformSpanLength: preset.spanLength,
      spanLengths: newLengths,
      isUniformSpan: true,
      overhangLength: preset.overhang,
      hasEndGun: preset.endGun,
      lastTowerSpeedAt100: mfgPreset.typicalMaxSpeedMPerHr,
    });
  };

  // Select a standard span chip
  const handleSelectStandardSpan = (spanVal: number) => {
    const newLengths = Array(config.towerCount).fill(spanVal);
    onChange({ ...config, uniformSpanLength: spanVal, spanLengths: newLengths });
  };

  // Select a standard overhang chip
  const handleSelectStandardOverhang = (val: number) => {
    onChange({ ...config, overhangLength: val });
  };

  // Tower count stepper
  const handleTowerCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(25, config.towerCount + delta));
    let newLengths = [...config.spanLengths];
    if (newCount > config.towerCount) {
      while (newLengths.length < newCount) newLengths.push(config.uniformSpanLength);
    } else {
      newLengths = newLengths.slice(0, newCount);
    }
    onChange({ ...config, towerCount: newCount, spanLengths: newLengths });
  };

  // Uniform span text → free typing, commit valid values
  const handleUniformSpanText = (text: string) => {
    setSpanText(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      const clamped = Math.max(10, Math.min(100, val));
      const newLengths = Array(config.towerCount).fill(clamped);
      onChange({ ...config, uniformSpanLength: clamped, spanLengths: newLengths });
    }
  };

  // Individual span text
  const handleSingleSpanText = (index: number, text: string) => {
    const next = [...spanTexts];
    next[index] = text;
    setSpanTexts(next);
    const val = parseFloat(text);
    if (!isNaN(val) && val > 0) {
      const newLengths = [...config.spanLengths];
      newLengths[index] = Math.max(10, Math.min(100, val));
      onChange({ ...config, spanLengths: newLengths });
    }
  };

  // Overhang text
  const handleOverhangText = (text: string) => {
    setOverhangText(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val >= 0) {
      onChange({ ...config, overhangLength: Math.max(0, Math.min(50, val)) });
    }
  };

  // End gun throw text
  const handleEndGunText = (text: string) => {
    setEndGunText(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val >= 0) {
      onChange({ ...config, endGunThrow: Math.max(0, Math.min(60, val)) });
    }
  };

  return (
    <View style={styles.card}>
      {/* Title */}
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="cog-outline" size={20} color="#38bdf8" />
        <Text style={styles.cardTitle}>مواصفات وأبعاد المحور الزراعي</Text>
      </View>

      {/* Quick Field Size Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>نماذج ومقاسات المحاور الجاهزة:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
          {COMMON_PIVOT_PRESETS.map((preset, idx) => {
            const isMatch =
              config.towerCount === preset.towers &&
              config.manufacturer === preset.manufacturer;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.presetCard, isMatch && styles.presetCardActive]}
                onPress={() => handleSelectPreset(preset)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetTitle, isMatch && styles.presetTitleActive]}>
                  {preset.name}
                </Text>
                <Text style={styles.presetSubtitle}>{preset.estimatedFeddans}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Manufacturer Selection Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>الشركة المصنعة للهيكل:</Text>
        <View style={styles.mfgGrid}>
          {MANUFACTURERS.map((mfg) => {
            const isSelected = config.manufacturer === mfg.id;
            return (
              <TouchableOpacity
                key={mfg.id}
                style={[styles.mfgBtn, isSelected && styles.mfgBtnActive]}
                onPress={() => handleSelectManufacturer(mfg.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.mfgText, isSelected && styles.mfgTextActive]}>
                  {mfg.nameAr}
                </Text>
                <Text style={styles.mfgOrigin}>{mfg.origin}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Tower Count Stepper */}
      <View style={styles.inputRow}>
        <View style={styles.labelCol}>
          <Text style={styles.inputTitle}>عدد الأبراج (Towers):</Text>
          <Text style={styles.inputSubtitle}>عدد الهياكل المتحركة الحاملة للأنابيب</Text>
        </View>
        <View style={styles.stepperContainer}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => handleTowerCountChange(-1)} activeOpacity={0.7}>
            <MaterialCommunityIcons name="minus" size={18} color="#f8fafc" />
          </TouchableOpacity>
          <View style={styles.stepperValueBox}>
            <Text style={styles.stepperValueText}>{config.towerCount}</Text>
            <Text style={styles.stepperUnit}>برج</Text>
          </View>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => handleTowerCountChange(1)} activeOpacity={0.7}>
            <MaterialCommunityIcons name="plus" size={18} color="#f8fafc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Spacing Standard Selection Bar ── */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <MaterialCommunityIcons name="format-horizontal-align-center" size={16} color="#38bdf8" />
          <Text style={styles.sectionLabel}>استاندر تباعد البخاخات على الأنبوب:</Text>
        </View>
        <Text style={styles.inputSubtitle}>
          يحدد المسافة بين كل مخرج بخاخ والآخر، وبناءً عليه يتغير عدد البخاخات في كل برج تلقائياً
        </Text>
        <View style={styles.spacingChipsRow}>
          {[
            { id: 'standard_108', label: '108 بوصة (2.74 م)', tag: 'قياسي شائع', count: '~18 بخاخ' },
            { id: 'dense_72', label: '72 بوصة (1.83 م)', tag: 'مكثف / رملي', count: '~26 بخاخ' },
            { id: 'dense_40', label: '40 بوصة (1.02 م)', tag: 'LEPA فائق', count: '~47 بخاخ' },
          ].map((sp) => {
            const isSelected = (config.spanSpacingPreset || 'standard_108') === sp.id;
            return (
              <TouchableOpacity
                key={sp.id}
                style={[styles.spacingChip, isSelected && styles.spacingChipActive]}
                onPress={() => onChange({ ...config, spanSpacingPreset: sp.id as any })}
                activeOpacity={0.7}
              >
                <Text style={[styles.spacingChipText, isSelected && styles.spacingChipTextActive]}>
                  {sp.label}
                </Text>
                <Text style={[styles.spacingChipTag, isSelected && styles.spacingChipTagActive]}>
                  {sp.tag} ({sp.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Uniform Span Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.labelCol}>
          <Text style={styles.inputTitle}>طول الأسبانات (الأبراج):</Text>
          <Text style={styles.inputSubtitle}>
            {config.isUniformSpan ? 'أطوال موحدة لجميع الأبراج' : 'أطوال مخصصة لكل برج على حدة'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.switchBtn, config.isUniformSpan && styles.switchBtnActive]}
          onPress={() => onChange({ ...config, isUniformSpan: !config.isUniformSpan })}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchText, config.isUniformSpan && styles.switchTextActive]}>
            {config.isUniformSpan ? 'موحد' : 'مخصص'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Uniform Span Block with standard chips & nozzle counts ── */}
      {config.isUniformSpan ? (
        <View style={styles.spanBlock}>
          <Text style={styles.standardLabel}>
            الأطوال القياسية لـ {currentPreset?.nameAr ?? 'المصنع'} وعدد البخاخات:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {(currentPreset?.availableSpans ?? []).map((spanVal) => {
              const isActive = Math.abs(config.uniformSpanLength - spanVal) < 0.1;
              const approxNozzles = Math.round(spanVal / currentSpacing.meters);
              return (
                <TouchableOpacity
                  key={spanVal}
                  style={[styles.spanChip, isActive && styles.spanChipActive]}
                  onPress={() => handleSelectStandardSpan(spanVal)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.spanChipText, isActive && styles.spanChipTextActive]}>
                    {spanVal} م
                  </Text>
                  <Text style={[styles.spanChipNozzleSub, isActive && styles.spanChipNozzleSubActive]}>
                    {approxNozzles} بخاخ
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Current Span Sprinkler Count Banner */}
          <View style={styles.spanInfoBadge}>
            <MaterialCommunityIcons name="sprinkler" size={16} color="#38bdf8" />
            <Text style={styles.spanInfoText}>
              عدد البخاخات في كل برج: <Text style={styles.spanInfoHighlight}>{spansList[0]?.nozzleCount ?? Math.round(config.uniformSpanLength / currentSpacing.meters)} بخاخ</Text> (حسب تباعد {currentSpacing.inches} بوصة)
            </Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>أو أدخل طول البرج يدوياً:</Text>
            <View style={styles.numberInputBox}>
              <TextInput
                style={styles.textInput}
                keyboardType="decimal-pad"
                value={spanText}
                onChangeText={handleUniformSpanText}
                placeholder="47.9"
                placeholderTextColor="#475569"
              />
              <Text style={styles.inputUnit}>م</Text>
            </View>
          </View>
        </View>
      ) : (
        /* Custom Spans Accordion with Nozzles per Tower */
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionToggle}
            onPress={() => setShowSpansAccordion(!showSpansAccordion)}
          >
            <Text style={styles.accordionToggleText}>
              {showSpansAccordion ? 'إخفاء تفاصيل أطوال وبخاخات الأبراج' : 'تعديل أطوال وبخاخات كل برج منفصلاً'}
            </Text>
            <MaterialCommunityIcons
              name={showSpansAccordion ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#38bdf8"
            />
          </TouchableOpacity>

          {showSpansAccordion && (
            <View style={styles.spansList}>
              {config.spanLengths.map((len, idx) => {
                const customVal = config.customSpanNozzleCounts?.[idx];
                const isCustomized = typeof customVal === 'number';
                const count = isCustomized ? customVal : (spansList[idx]?.nozzleCount ?? Math.round(len / currentSpacing.meters));

                return (
                  <View key={idx} style={styles.spanItemRow}>
                    <Text style={styles.spanItemLabel}>البرج {idx + 1}:</Text>

                    {/* Span Length Input */}
                    <View style={styles.spanInputBox}>
                      <TextInput
                        style={styles.textInputSmall}
                        keyboardType="decimal-pad"
                        value={spanTexts[idx] ?? String(len)}
                        onChangeText={(v) => handleSingleSpanText(idx, v)}
                        placeholder="47.9"
                        placeholderTextColor="#475569"
                      />
                      <Text style={styles.inputUnit}>م</Text>
                    </View>

                    {/* Nozzle Count & Stepper */}
                    <View style={styles.customSpanNozzleBox}>
                      <View style={[styles.customNozzleBadge, isCustomized && styles.customNozzleBadgeActive]}>
                        <Text style={styles.customNozzleText}>{count} بخاخ</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.customMiniBtn}
                        onPress={() => handleSpanNozzleCountChange(idx, -1)}
                      >
                        <MaterialCommunityIcons name="minus" size={12} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.customMiniBtn}
                        onPress={() => handleSpanNozzleCountChange(idx, 1)}
                      >
                        <MaterialCommunityIcons name="plus" size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ── Overhang (Cantilever) block with standard chips & nozzle count ── */}
      <View style={styles.overhangBlock}>
        <View style={styles.overhangHeader}>
          <MaterialCommunityIcons name="arrow-expand-right" size={14} color="#f59e0b" />
          <Text style={styles.overhangTitle}> طول الكابولي (Overhang):</Text>
        </View>
        <Text style={styles.inputSubtitle}>الماسورة الممتدة بعد آخر برج لتغطية الحافة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsScroll, { marginTop: 8 }]}>
          {(currentPreset?.availableOverhangs ?? []).map((val) => {
            const isActive = Math.abs(config.overhangLength - val) < 0.1;
            const approxNozzles = Math.max(1, Math.round(val / currentSpacing.meters));
            return (
              <TouchableOpacity
                key={val}
                style={[styles.overhangChip, isActive && styles.overhangChipActive]}
                onPress={() => handleSelectStandardOverhang(val)}
                activeOpacity={0.7}
              >
                <Text style={[styles.spanChipText, isActive && styles.overhangChipTextActive]}>
                  {val} م
                </Text>
                <Text style={[styles.spanChipNozzleSub, isActive && { color: '#fbbf24' }]}>
                  {approxNozzles} بخاخ
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.spanInfoBadge}>
          <MaterialCommunityIcons name="water-outline" size={16} color="#fbbf24" />
          <Text style={[styles.spanInfoText, { color: '#fbbf24' }]}>
            عدد بخاخات الكابولي: <Text style={[styles.spanInfoHighlight, { color: '#fef08a' }]}>{overhangNozzles} بخاخ</Text>
          </Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>أو أدخل طول الكابولي يدوياً:</Text>
          <View style={styles.numberInputBox}>
            <TextInput
              style={styles.textInput}
              keyboardType="decimal-pad"
              value={overhangText}
              onChangeText={handleOverhangText}
              placeholder="13.4"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputUnit}>م</Text>
          </View>
        </View>
      </View>

      {/* ── Total Pivot Nozzle Summary Banner ── */}
      <View style={styles.totalNozzleSummaryCard}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <MaterialCommunityIcons name="calculator-variant" size={16} color="#38bdf8" />
          <Text style={styles.tnsTitle}>إجمالي عدد بخاخات المحور (حسب الاستاندر):</Text>
        </View>
        <View style={styles.tnsRow}>
          <View style={styles.tnsCol}>
            <Text style={styles.tnsVal}>{config.towerCount}</Text>
            <Text style={styles.tnsLbl}>أبراج</Text>
          </View>
          <View style={styles.tnsCol}>
            <Text style={styles.tnsVal}>{spansList[0]?.nozzleCount ?? 18}</Text>
            <Text style={styles.tnsLbl}>بخاخ / برج</Text>
          </View>
          <View style={styles.tnsCol}>
            <Text style={styles.tnsVal}>{overhangNozzles}</Text>
            <Text style={styles.tnsLbl}>كابولي</Text>
          </View>
          <View style={[styles.tnsCol, styles.tnsColTotal]}>
            <Text style={[styles.tnsVal, { color: '#38bdf8', fontSize: 16 }]}>{spanMath.totalCalculatedNozzles}</Text>
            <Text style={[styles.tnsLbl, { color: '#38bdf8', fontWeight: '800' }]}>الإجمالي</Text>
          </View>
        </View>
      </View>

      {/* End Gun Section */}
      <View style={styles.toggleRow}>
        <View style={styles.labelCol}>
          <Text style={styles.inputTitle}>مدفع النهاية (End Gun):</Text>
          <Text style={styles.inputSubtitle}>مدفع رشاش إضافي لزيادة المساحة المروية</Text>
        </View>
        <TouchableOpacity
          style={[styles.switchBtn, config.hasEndGun && styles.switchBtnActive]}
          onPress={() => onChange({ ...config, hasEndGun: !config.hasEndGun })}
          activeOpacity={0.8}
        >
          <Text style={[styles.switchText, config.hasEndGun && styles.switchTextActive]}>
            {config.hasEndGun ? 'مفعل' : 'معطل'}
          </Text>
        </TouchableOpacity>
      </View>

      {config.hasEndGun && (
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>نصف قطر رمي المدفع (متر):</Text>
          <View style={styles.numberInputBox}>
            <TextInput
              style={styles.textInput}
              keyboardType="decimal-pad"
              value={endGunText}
              onChangeText={handleEndGunText}
              placeholder="30"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputUnit}>م</Text>
          </View>
        </View>
      )}
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
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#f8fafc' },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#94a3b8',
    textAlign: 'right', marginBottom: 8,
  },
  presetsScroll: { flexDirection: 'row-reverse', gap: 8, paddingBottom: 4 },
  presetCard: {
    backgroundColor: '#020617', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1e293b',
    alignItems: 'center', minWidth: 120,
  },
  presetCardActive: { borderColor: '#0284c7', backgroundColor: '#0c4a6e' },
  presetTitle: { fontSize: 12, fontWeight: '700', color: '#cbd5e1', textAlign: 'center' },
  presetTitleActive: { color: '#38bdf8' },
  presetSubtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },
  mfgGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  mfgBtn: {
    flex: 1, minWidth: '46%', backgroundColor: '#020617',
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#1e293b',
  },
  mfgBtnActive: { borderColor: '#38bdf8', backgroundColor: '#0369a1' },
  mfgText: { fontSize: 12, fontWeight: '700', color: '#cbd5e1', textAlign: 'right' },
  mfgTextActive: { color: '#ffffff' },
  mfgOrigin: { fontSize: 10, color: '#64748b', textAlign: 'right', marginTop: 2 },
  inputRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#1e293b',
  },
  labelCol: { flex: 1, paddingLeft: 8 },
  inputTitle: { fontSize: 13, fontWeight: '700', color: '#f1f5f9', textAlign: 'right' },
  inputSubtitle: { fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 2 },
  stepperContainer: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: '#020617', borderRadius: 10,
    borderWidth: 1, borderColor: '#334155',
  },
  stepperBtn: {
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e293b', borderRadius: 8,
  },
  stepperValueBox: { paddingHorizontal: 12, alignItems: 'center' },
  stepperValueText: { fontSize: 16, fontWeight: '800', color: '#38bdf8' },
  stepperUnit: { fontSize: 9, color: '#64748b' },
  toggleRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#1e293b',
  },
  switchBtn: {
    backgroundColor: '#1e293b', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155',
  },
  switchBtnActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  switchText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  switchTextActive: { color: '#ffffff' },

  // ── Span block (standard chips + manual input) ──
  spanBlock: {
    backgroundColor: '#020617', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e3a5f',
    padding: 12, marginBottom: 4,
  },
  standardLabel: {
    fontSize: 11, fontWeight: '700', color: '#38bdf8',
    textAlign: 'right', marginBottom: 8,
  },
  chipsScroll: { flexDirection: 'row-reverse', gap: 6, paddingBottom: 4 },
  spanChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155',
  },
  spanChipActive: { backgroundColor: '#0c4a6e', borderColor: '#38bdf8' },
  spanChipText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  spanChipTextActive: { color: '#38bdf8' },

  // ── Overhang block ──
  overhangBlock: {
    backgroundColor: '#020617', borderRadius: 12,
    borderWidth: 1, borderColor: '#78350f',
    padding: 12, marginTop: 12, marginBottom: 4,
  },
  overhangHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 2,
  },
  overhangTitle: {
    fontSize: 13, fontWeight: '700', color: '#fbbf24', textAlign: 'right',
  },
  overhangChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#78350f',
  },
  overhangChipActive: { backgroundColor: '#78350f', borderColor: '#f59e0b' },
  overhangChipTextActive: { color: '#fbbf24' },

  fieldRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 10,
  },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#e2e8f0', textAlign: 'right' },
  numberInputBox: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 8,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 10, width: 100,
  },
  textInput: {
    flex: 1, color: '#f8fafc', fontSize: 14,
    fontWeight: '700', textAlign: 'center', paddingVertical: 6,
  },
  inputUnit: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  accordionContainer: {
    backgroundColor: '#020617', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e293b',
    padding: 10, marginBottom: 8,
  },
  accordionToggle: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
  },
  accordionToggleText: { fontSize: 12, fontWeight: '700', color: '#38bdf8' },
  spansList: { marginTop: 10, gap: 6 },
  spanItemRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 4,
    borderBottomWidth: 1, borderBottomColor: '#0f172a',
  },
  spanItemLabel: { fontSize: 12, color: '#94a3b8' },
  spanInputBox: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 6,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 8, width: 90,
  },
  textInputSmall: {
    flex: 1, color: '#f8fafc', fontSize: 13,
    fontWeight: '700', textAlign: 'center', paddingVertical: 4,
  },

  // ── Spacing Standard Selection Bar ──
  spacingChipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 6,
  },
  spacingChip: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  spacingChipActive: {
    backgroundColor: '#0369a1',
    borderColor: '#38bdf8',
  },
  spacingChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
  },
  spacingChipTextActive: {
    color: '#ffffff',
  },
  spacingChipTag: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  spacingChipTagActive: {
    color: '#bae6fd',
    fontWeight: '600',
  },

  spanChipNozzleSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  spanChipNozzleSubActive: {
    color: '#bae6fd',
    fontWeight: '700',
  },
  spanInfoBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  spanInfoText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'right',
  },
  spanInfoHighlight: {
    color: '#38bdf8',
    fontWeight: '800',
  },

  // Custom span row stepper
  customSpanNozzleBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  customNozzleBadge: {
    backgroundColor: '#0c4a6e',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  customNozzleBadgeActive: {
    backgroundColor: '#4c1d95',
    borderColor: '#8b5cf6',
  },
  customNozzleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
  },
  customMiniBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Total nozzle summary card
  totalNozzleSummaryCard: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  tnsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
    textAlign: 'right',
  },
  tnsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  tnsCol: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tnsColTotal: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderColor: '#0284c7',
  },
  tnsVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  tnsLbl: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
});
