import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import {
  NozzleConfig,
  NozzlePackageResults,
  PivotConfig,
  PivotResults,
  SprinklerModelType,
} from '../types/pivot';
import { formatNumber, calculatePivotSpanNozzles } from '../utils/pivotMath';
import {
  saveClientRequest,
  getClientRequests,
  ClientNozzleRequest,
} from '../utils/nozzleRequests';

interface NozzleCalculatorProps {
  pivotConfig: PivotConfig;
  pivotResults: PivotResults;
  nozzleConfig: NozzleConfig;
  nozzleResults: NozzlePackageResults;
  onChange: (updated: NozzleConfig) => void;
  onPivotConfigChange?: (updated: PivotConfig) => void;
  onOpenReport: () => void;
  onOpenNozzleReport?: () => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onOpenRequests?: () => void;
  requestsCount?: number;
  onRequestSubmitted?: () => void;
}

const SPRINKLER_MODELS: { id: SprinklerModelType; nameAr: string; mfg: string }[] = [
  { id: 'nelson_d3000', nameAr: 'نيلسون D3000 Sprayhead', mfg: 'Nelson' },
  { id: 'nelson_rotator', nameAr: 'نيلسون روتاتور R3000', mfg: 'Nelson' },
  { id: 'nelson_orbitor_hilal', nameAr: 'نيلسون أوربيتور (هلال)', mfg: 'Nelson' },
  { id: 'hunter_super_spray', nameAr: 'هنتر سوبر سبراي UP3', mfg: 'Hunter' },
  { id: 'senninger_iwob', nameAr: 'سيننجر آي ووب (i-Wob UP3)', mfg: 'Senninger' },
];

const PRESSURES = [6, 10, 15, 20, 30];

export const NozzleCalculator: React.FC<NozzleCalculatorProps> = ({
  pivotConfig,
  pivotResults,
  nozzleConfig,
  nozzleResults,
  onChange,
  onPivotConfigChange,
  onOpenReport,
  onOpenNozzleReport,
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenRequests,
  requestsCount = 0,
  onRequestSubmitted,
}) => {
  const [selectedTowerFilter, setSelectedTowerFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [firstDistText, setFirstDistText] = useState(String(nozzleConfig.firstSprinklerDistanceM));

  // Auto-calculated nozzles from spans geometry
  const spanMath = useMemo(
    () => calculatePivotSpanNozzles(pivotConfig, nozzleConfig.firstSprinklerDistanceM),
    [pivotConfig, nozzleConfig.firstSprinklerDistanceM]
  );
  const spansList = spanMath.spansBreakdown || [];
  const overhangNozzles = spanMath.overhangBreakdown?.nozzleCount ?? 0;

  // Filter sprinklers
  const filteredSprinklers = useMemo(() => {
    return nozzleResults.sprinklers.filter((item) => {
      if (selectedTowerFilter !== null && item.towerNumber !== selectedTowerFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesIndex = item.index.toString().includes(query);
        const matchesNozzle = item.nozzleNumber.toString().includes(query);
        const matchesDist = Math.round(item.distanceFromCenterM).toString().includes(query);
        if (!matchesIndex && !matchesNozzle && !matchesDist) return false;
      }
      return true;
    });
  }, [nozzleResults.sprinklers, selectedTowerFilter, searchQuery]);

  // If not admin, only show the first 5 sprinklers as preview!
  const displayedSprinklers = useMemo(() => {
    if (isAdmin) {
      return filteredSprinklers;
    }
    return filteredSprinklers.slice(0, 5);
  }, [isAdmin, filteredSprinklers]);

  const handleSyncNozzles = () => {
    onChange({
      ...nozzleConfig,
      totalSprinklerCount: spanMath.totalCalculatedNozzles,
      autoSyncWithSpanMath: true,
    });
  };

  const handleFirstDistText = (text: string) => {
    setFirstDistText(text);
    const val = parseFloat(text);
    if (isNaN(val) || val <= 0) return;
    const clamped = Math.max(0.5, Math.min(60, val));
    const calc = calculatePivotSpanNozzles(pivotConfig, clamped);
    onChange({
      ...nozzleConfig,
      firstSprinklerDistanceM: clamped,
      totalSprinklerCount: nozzleConfig.autoSyncWithSpanMath
        ? calc.totalCalculatedNozzles
        : nozzleConfig.totalSprinklerCount,
    });
  };

  const handleSendRequest = () => {
    if (!clientName.trim() || !phone.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم العميل ورقم الهاتف لإرسال الطلب');
      return;
    }

    const currentModelName = SPRINKLER_MODELS.find((m) => m.id === nozzleConfig.sprinklerModel)?.nameAr || 'نيلسون D3000';

    saveClientRequest({
      clientName: clientName.trim(),
      phone: phone.trim(),
      notes: notes.trim() || `طلب برمجة فوهات لعدد ${pivotConfig.towerCount} أبراج، مساحة ${formatNumber(pivotResults.totalFeddans, 1)} فدان`,
      towerCount: pivotConfig.towerCount,
      totalFeddans: pivotResults.totalFeddans,
      totalRadius: pivotResults.totalWettedRadius,
      flowM3PerHour: pivotConfig.inflowRateM3PerHour,
      sprinklerCount: nozzleConfig.totalSprinklerCount,
      regulatorPressurePsi: nozzleConfig.regulatorPressurePsi,
      firstSprinklerDistanceM: nozzleConfig.firstSprinklerDistanceM,
      sprinklerModel: currentModelName,
    });

    setRequestSent(true);
    if (onRequestSubmitted) {
      onRequestSubmitted();
    }
    Alert.alert(
      'تم إرسال الطلب بنجاح',
      'تم إرسال كافة معطيات ومواصفات المحور إلى المشرف (muzamil) لمراجعتها واعتماد الجدول الكامل.'
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBadge}>
              <MaterialCommunityIcons name="water-pump" size={20} color="#38bdf8" />
            </View>
            <View style={styles.titleBox}>
              {isAdmin ? (
                <View style={styles.adminTitleRow}>
                  <Text style={styles.cardTitle}>جدول الفوهات المعتمد : </Text>
                  <View style={styles.adminBadge}>
                    <MaterialCommunityIcons name="shield-check" size={13} color="#ffffff" />
                    <Text style={styles.adminBadgeText}>muzamil</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.cardTitle}>حاسبة وبرمجة فوهات البخاخات</Text>
              )}
              {isAdmin && (
                <Text style={styles.adminSubTitle}>لوحة المشرف المعتمد · إشراف المهندس مزمل</Text>
              )}
            </View>
          </View>

          {!isAdmin && (
            <TouchableOpacity
              style={[styles.pdfBtn, { backgroundColor: '#0284c7' }]}
              onPress={onOpenLogin}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="key-variant" size={14} color="#ffffff" />
              <Text style={styles.pdfBtnText}>دخول المشرف</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Supervisor Action Toolbar */}
        {isAdmin && (
          <View style={styles.headerActionsToolbar}>
            {onOpenRequests && (
              <TouchableOpacity
                style={[styles.toolbarBtn, { backgroundColor: '#d97706' }]}
                onPress={onOpenRequests}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="clipboard-list" size={14} color="#ffffff" />
                <Text style={styles.toolbarBtnText}>
                  الطلبات الواردة ({requestsCount})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: '#0284c7' }]}
              onPress={onOpenNozzleReport || onOpenReport}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="file-document-outline" size={15} color="#ffffff" />
              <Text style={styles.toolbarBtnText}>جدول الفوهات (PDF)</Text>
            </TouchableOpacity>

            {onLogout && (
              <TouchableOpacity
                style={[
                  styles.toolbarBtn,
                  { backgroundColor: '#1e293b', borderColor: '#475569', borderWidth: 1 },
                ]}
                onPress={onLogout}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="logout" size={14} color="#94a3b8" />
                <Text style={[styles.toolbarBtnText, { color: '#94a3b8' }]}>قفل</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Admin Notice Bar when logged in */}
      {isAdmin && (
        <TouchableOpacity
          style={styles.adminBannerBar}
          onPress={onOpenRequests}
          activeOpacity={0.8}
        >
          <View style={styles.adminBannerRight}>
            <View style={styles.badgePulse}>
              <MaterialCommunityIcons name="bell-ring" size={16} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.adminBannerTitle}>
                لوحة المشرف: يوجد {requestsCount} طلب وارد مع المعطيات الهندسية
              </Text>
              <Text style={styles.adminBannerSub}>
                اضغط هنا لاستعراض مواصفات المحاور وأرقام هواتف العملاء أو تحميل المعطيات
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-back" size={18} color="#f59e0b" />
        </TouchableOpacity>
      )}

      {/* Sprinkler Model Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>نوع وموديل البخاخ:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelsScroll}>
          {SPRINKLER_MODELS.map((model) => {
            const isSelected = nozzleConfig.sprinklerModel === model.id;
            return (
              <TouchableOpacity
                key={model.id}
                style={[styles.modelCard, isSelected && styles.modelCardActive]}
                onPress={() => onChange({ ...nozzleConfig, sprinklerModel: model.id })}
                activeOpacity={0.7}
              >
                <Text style={[styles.modelName, isSelected && styles.modelNameActive]}>
                  {model.nameAr}
                </Text>
                <Text style={styles.modelMfg}>{model.mfg}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Regulator Pressure Bar */}
      <View style={styles.fieldRow}>
        <View style={styles.labelCol}>
          <Text style={styles.inputTitle}>ضغط منظم الضغط (Regulator Pressure):</Text>
          <Text style={styles.inputSubtitle}>الضغط عند مدخل كل بخاخ لتثبيت التصريف</Text>
        </View>
        <View style={styles.pressureRow}>
          {PRESSURES.map((p) => {
            const isSelected = nozzleConfig.regulatorPressurePsi === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.pressureBtn, isSelected && styles.pressureBtnActive]}
                onPress={() => onChange({ ...nozzleConfig, regulatorPressurePsi: p })}
              >
                <Text style={[styles.pressureText, isSelected && styles.pressureTextActive]}>
                  {p} PSI
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* First Sprinkler Distance & Sprinkler Count */}
      <View style={styles.twoCols}>
        {/* First Distance */}
        <View style={styles.col}>
          <Text style={styles.colLabel}>بُعد أول بخاخ عن المركز:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              keyboardType="decimal-pad"
              value={firstDistText}
              onChangeText={handleFirstDistText}
              placeholder="3.0"
              placeholderTextColor="#475569"
            />
            <Text style={styles.unitText}>متر</Text>
          </View>
        </View>

        {/* Total Sprinkler Count */}
        <View style={styles.col}>
          <Text style={styles.colLabel}>إجمالي عدد البخاخات:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(nozzleConfig.totalSprinklerCount)}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) {
                  onChange({
                    ...nozzleConfig,
                    totalSprinklerCount: Math.max(2, Math.min(500, n)),
                    autoSyncWithSpanMath: false,
                  });
                }
              }}
            />
            <Text style={styles.unitText}>بخاخ</Text>
          </View>
        </View>
      </View>

      {/* ── Spacing Standard Selection Bar ── */}
      <View style={styles.spacingBarBox}>
        <View style={styles.spacingBarHeader}>
          <MaterialCommunityIcons name="tune-variant" size={16} color="#38bdf8" />
          <Text style={styles.spacingBarTitle}>
            استاندر تباعد البخاخات على الأبراج (Standard Spacing):
          </Text>
        </View>
        <Text style={styles.spacingBarSubtitle}>
          اختر الاستاندر الهندسي ليتغير عدد البخاخات في كل برج تلقائياً:
        </Text>
        <View style={styles.spacingChipsRow}>
          {[
            { id: 'standard_108', name: '108 بوصة (2.74 م)', tag: 'قياسي شائع' },
            { id: 'dense_72', name: '72 بوصة (1.83 م)', tag: 'مكثف (رملي)' },
            { id: 'dense_40', name: '40 بوصة (1.02 م)', tag: 'LEPA فائق' },
          ].map((sp) => {
            const isSelected = (pivotConfig.spanSpacingPreset || 'standard_108') === sp.id;
            return (
              <TouchableOpacity
                key={sp.id}
                style={[styles.spacingChip, isSelected && styles.spacingChipActive]}
                onPress={() => {
                  if (onPivotConfigChange) {
                    onPivotConfigChange({ ...pivotConfig, spanSpacingPreset: sp.id as any });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.spacingChipText, isSelected && styles.spacingChipTextActive]}>
                  {sp.name}
                </Text>
                <Text style={[styles.spacingChipTag, isSelected && styles.spacingChipTagActive]}>
                  {sp.tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Per-Span Nozzle Breakdown Table ── */}
      <View style={styles.spanBreakdownBox}>
        <View style={styles.spanBreakdownHeader}>
          <View style={styles.sbTitleRow}>
            <MaterialCommunityIcons name="format-list-numbered" size={18} color="#38bdf8" />
            <Text style={styles.spanBreakdownTitle}>
              عدد البخاخات لكل برج (حسب الأبعاد والتباعد):
            </Text>
          </View>
          <Text style={styles.spanBreakdownSub}>
            حساب تلقائي حسب طول كل برج ÷ مسافة التباعد القياسية مع إمكانية التعديل
          </Text>
        </View>

        {/* Table Header */}
        <View style={styles.spanTableHeader}>
          <Text style={[styles.spanTh, { flex: 1.1 }]}>البرج</Text>
          <Text style={[styles.spanTh, { flex: 1.3 }]}>طول البرج</Text>
          <Text style={[styles.spanTh, { flex: 1.5 }]}>عدد البخاخات</Text>
          <Text style={[styles.spanTh, { flex: 1.6 }]}>تعديل يدوي</Text>
        </View>

        {/* Spans Rows */}
        {spansList.map((span) => {
          const customVal = pivotConfig.customSpanNozzleCounts?.[span.spanIndex];
          const isCustomized = typeof customVal === 'number';
          const displayedCount = isCustomized ? customVal : span.nozzleCount;

          return (
            <View
              key={span.spanIndex}
              style={[
                styles.spanTableRow,
                span.spanIndex % 2 === 1 ? styles.spanRowAlt : null,
              ]}
            >
              {/* Tower Label */}
              <View style={[styles.spanTd, { flex: 1.1, flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }]}>
                <MaterialCommunityIcons name="transmission-tower" size={14} color="#38bdf8" />
                <Text style={styles.towerNumText}>البرج {span.spanNumber}</Text>
              </View>

              {/* Span Length */}
              <View style={[styles.spanTd, { flex: 1.3 }]}>
                <Text style={styles.spanLenText}>{span.lengthMeters.toFixed(1)} م</Text>
                <Text style={styles.spanLenFeetText}>({Math.round(span.lengthFeet)} قدم)</Text>
              </View>

              {/* Nozzle Count Badge */}
              <View style={[styles.spanTd, { flex: 1.5, alignItems: 'center' }]}>
                <View style={[styles.nozzleCountBadge, isCustomized && styles.nozzleCountBadgeCustom]}>
                  <Text style={[styles.nozzleCountText, isCustomized && styles.nozzleCountTextCustom]}>
                    {displayedCount} بخاخ
                  </Text>
                </View>
              </View>

              {/* Manual Override Stepper */}
              <View style={[styles.spanTd, { flex: 1.6, alignItems: 'center' }]}>
                <View style={styles.miniStepper}>
                  <TouchableOpacity
                    style={styles.miniStepBtn}
                    onPress={() => {
                      if (!onPivotConfigChange) return;
                      const next = Math.max(0, displayedCount - 1);
                      const newCounts = [...(pivotConfig.customSpanNozzleCounts || [])];
                      while (newCounts.length <= span.spanIndex) {
                        newCounts.push(spansList[newCounts.length]?.nozzleCount ?? 18);
                      }
                      newCounts[span.spanIndex] = next;
                      onPivotConfigChange({ ...pivotConfig, customSpanNozzleCounts: newCounts });
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="minus" size={14} color="#ffffff" />
                  </TouchableOpacity>

                  <Text style={styles.miniStepVal}>{displayedCount}</Text>

                  <TouchableOpacity
                    style={styles.miniStepBtn}
                    onPress={() => {
                      if (!onPivotConfigChange) return;
                      const next = displayedCount + 1;
                      const newCounts = [...(pivotConfig.customSpanNozzleCounts || [])];
                      while (newCounts.length <= span.spanIndex) {
                        newCounts.push(spansList[newCounts.length]?.nozzleCount ?? 18);
                      }
                      newCounts[span.spanIndex] = next;
                      onPivotConfigChange({ ...pivotConfig, customSpanNozzleCounts: newCounts });
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="plus" size={14} color="#ffffff" />
                  </TouchableOpacity>

                  {isCustomized && (
                    <TouchableOpacity
                      style={styles.resetCustomBtn}
                      onPress={() => {
                        if (!onPivotConfigChange) return;
                        const newCounts = [...(pivotConfig.customSpanNozzleCounts || [])];
                        delete newCounts[span.spanIndex];
                        onPivotConfigChange({ ...pivotConfig, customSpanNozzleCounts: newCounts });
                      }}
                    >
                      <MaterialCommunityIcons name="refresh" size={14} color="#f59e0b" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Overhang Row */}
        {overhangNozzles > 0 && (
          <View style={[styles.spanTableRow, styles.overhangRow]}>
            <View style={[styles.spanTd, { flex: 1.1, flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }]}>
              <MaterialCommunityIcons name="arrow-expand-right" size={14} color="#f59e0b" />
              <Text style={[styles.towerNumText, { color: '#fbbf24' }]}>الكابولي</Text>
            </View>
            <View style={[styles.spanTd, { flex: 1.3 }]}>
              <Text style={[styles.spanLenText, { color: '#fbbf24' }]}>
                {(pivotConfig.overhangLength || 0).toFixed(1)} م
              </Text>
            </View>
            <View style={[styles.spanTd, { flex: 1.5, alignItems: 'center' }]}>
              <View style={[styles.nozzleCountBadge, { backgroundColor: '#78350f', borderColor: '#f59e0b' }]}>
                <Text style={[styles.nozzleCountText, { color: '#fbbf24' }]}>
                  {overhangNozzles} بخاخ
                </Text>
              </View>
            </View>
            <View style={[styles.spanTd, { flex: 1.6, alignItems: 'center' }]}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>تلقائي</Text>
            </View>
          </View>
        )}

        {/* Table Footer with Total & Sync */}
        <View style={styles.spanTableFooter}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="calculator" size={18} color="#38bdf8" />
            <Text style={styles.spanTotalLabel}>إجمالي عدد البخاخات الهندسي:</Text>
            <Text style={styles.spanTotalVal}>{spanMath.totalCalculatedNozzles} بخاخ</Text>
          </View>
          <TouchableOpacity style={styles.syncBtn} onPress={handleSyncNozzles} activeOpacity={0.7}>
            <Text style={styles.syncBtnText}>اعتماد ومزامنة</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Stats Summary Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{formatNumber(nozzleResults.totalCalculatedFlowM3PerHour, 1)}</Text>
          <Text style={styles.kpiLbl}>التدفق الكلي (م³/س)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{formatNumber(nozzleResults.averageFlowPerSprinklerGpm, 2)}</Text>
          <Text style={styles.kpiLbl}>متوسط البخاخ (GPM)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{formatNumber(nozzleResults.maxFlowSprinklerGpm, 2)}</Text>
          <Text style={styles.kpiLbl}>أعلى بخاخ (GPM)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{formatNumber(nozzleResults.spacingMeters, 2)} م</Text>
          <Text style={styles.kpiLbl}>متوسط التباعد</Text>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث برقم البخاخ، الفونية، أو المسافة..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tower Filter Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedTowerFilter === null && styles.filterChipActive]}
            onPress={() => setSelectedTowerFilter(null)}
          >
            <Text style={[styles.filterChipText, selectedTowerFilter === null && styles.filterChipTextActive]}>
              الكل ({nozzleResults.sprinklers.length})
            </Text>
          </TouchableOpacity>

          {Array.from({ length: pivotConfig.towerCount }, (_, i) => i + 1).map((tNum) => (
            <TouchableOpacity
              key={tNum}
              style={[styles.filterChip, selectedTowerFilter === tNum && styles.filterChipActive]}
              onPress={() => setSelectedTowerFilter(selectedTowerFilter === tNum ? null : tNum)}
            >
              <Text style={[styles.filterChipText, selectedTowerFilter === tNum && styles.filterChipTextActive]}>
                برج {tNum}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sprinklers Table Header */}
      <View style={styles.nozzleTableHeader}>
        <Text style={[styles.nthText, { width: 44 }]}>#</Text>
        <Text style={[styles.nthText, { width: 56 }]}>المسافة</Text>
        <Text style={[styles.nthText, { width: 50 }]}>البرج</Text>
        <Text style={[styles.nthText, { width: 62 }]}>GPM</Text>
        <Text style={[styles.nthText, { width: 56 }]}>رقم الفونية</Text>
        <Text style={[styles.nthText, { flex: 1 }]}>اللون المعتمد</Text>
      </View>

      {/* Sprinklers List */}
      <View style={styles.sprinklersContainer}>
        {displayedSprinklers.map((item) => (
          <View key={item.index} style={styles.sprinklerRow}>
            <Text style={[styles.ntdText, { width: 44, fontWeight: '700', color: '#94a3b8' }]}>
              {item.index}
            </Text>
            <Text style={[styles.ntdText, { width: 56, color: '#f8fafc' }]}>
              {`${formatNumber(item.distanceFromCenterM, 1)} م`}
            </Text>
            <Text style={[styles.ntdText, { width: 50, color: item.isOverhang ? '#06b6d4' : '#cbd5e1' }]}>
              {item.isOverhang ? 'كابولي' : `ب ${item.towerNumber}`}
            </Text>
            <Text style={[styles.ntdText, { width: 62, fontWeight: '700', color: '#38bdf8' }]}>
              {formatNumber(item.requiredFlowGpm, 2)}
            </Text>
            <View style={[styles.nozzleBadge, { width: 56 }]}>
              <Text style={styles.nozzleBadgeText}>#{item.nozzleNumber}</Text>
            </View>
            <View style={styles.colorPill}>
              {item.colorHex && (
                <View style={[styles.colorCircle, { backgroundColor: item.colorHex }]} />
              )}
              <Text style={styles.colorName} numberOfLines={1}>
                {item.colorCodeAr}
              </Text>
            </View>
          </View>
        ))}

        {/* If not admin: Show locked notice and order form for remaining nozzles */}
        {!isAdmin && filteredSprinklers.length > 5 && (
          <View style={styles.lockedTeaserBox}>
            <View style={styles.teaserHeader}>
              <MaterialCommunityIcons name="lock" size={22} color="#f59e0b" />
              <View style={{ flex: 1 }}>
                <Text style={styles.teaserTitle}>
                  بقية فوهات المحور ({filteredSprinklers.length - 5} بخاخ) مقفلة
                </Text>
                <Text style={styles.teaserDesc}>
                  تم عرض أول 5 بخاخات كمعاينة تجريبية. للاطلاع على الجدول الكامل لجميع الأبراج والكابولي أو اعتماده، يرجى طلب الجدول من المهندس المشرف أو تسجيل دخول المهندس (muzamil).
                </Text>
              </View>
            </View>

            <View style={styles.teaserForm}>
              <View style={styles.teaserInputRow}>
                <TextInput
                  style={styles.teaserInput}
                  placeholder="اسم العميل / المزرعة"
                  placeholderTextColor="#64748b"
                  value={clientName}
                  onChangeText={setClientName}
                />
                <TextInput
                  style={styles.teaserInput}
                  placeholder="رقم الجوال أو واتساب"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <TextInput
                style={[styles.teaserInput, { textAlign: 'right', marginTop: 8 }]}
                placeholder="ملاحظات إضافية أو موقع المزرعة (اختياري)"
                placeholderTextColor="#64748b"
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity
                style={[styles.teaserSubmitBtn, requestSent && { backgroundColor: '#0f766e' }]}
                onPress={handleSendRequest}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={requestSent ? 'check-circle' : 'send'}
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.teaserSubmitText}>
                  {requestSent ? 'تم إرسال طلب الجدول الكامل بنجاح' : 'إرسال طلب استلام الجدول الكامل'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.teaserLoginLink}
                onPress={onOpenLogin}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="key-outline" size={14} color="#38bdf8" />
                <Text style={styles.teaserLoginLinkText}>
                  هل أنت المهندس المشرف (muzamil)؟ اضغط لتسجيل الدخول الفوري
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* If admin and list has more than 50 */}
        {isAdmin && filteredSprinklers.length > 50 && (
          <View style={styles.moreAlert}>
            <Text style={styles.moreAlertText}>
              يتم عرض أول 50 بخاخاً في المعاينة السريعة. للاطلاع على الجدول بالكامل وتصديره وطباعته، اضغط على زر "ملف الفونيات (PDF)".
            </Text>
          </View>
        )}
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
  adminBannerBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderWidth: 1,
    borderColor: '#d97706',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  adminBannerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badgePulse: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fbbf24',
    textAlign: 'right',
  },
  adminBannerSub: {
    fontSize: 10,
    color: '#cbd5e1',
    textAlign: 'right',
    marginTop: 2,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flex: 1,
  },
  adminTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#f8fafc',
    textAlign: 'right',
  },
  adminBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminSubTitle: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'right',
  },
  headerActionsToolbar: {
    flexDirection: 'row-reverse',
    gap: 8,
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  toolbarBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  toolbarBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  pdfBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  pdfBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 8,
  },
  modelsScroll: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingBottom: 4,
  },
  modelCard: {
    backgroundColor: '#020617',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    minWidth: 130,
  },
  modelCardActive: {
    borderColor: '#0284c7',
    backgroundColor: '#0c4a6e',
  },
  modelName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  modelNameActive: {
    color: '#38bdf8',
  },
  modelMfg: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  fieldRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  labelCol: {
    marginBottom: 8,
  },
  inputTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'right',
  },
  inputSubtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 2,
  },
  pressureRow: {
    flexDirection: 'row-reverse',
    gap: 6,
  },
  pressureBtn: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pressureBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  pressureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  pressureTextActive: {
    color: '#ffffff',
  },
  twoCols: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginVertical: 10,
  },
  col: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  unitText: {
    color: '#64748b',
    fontSize: 11,
  },
  syncBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  syncInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  syncText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  syncHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  syncBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  syncBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  kpiVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f8fafc',
  },
  kpiLbl: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 12,
    textAlign: 'right',
  },
  filterChipsRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  nozzleTableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#020617',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  nthText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
  },
  sprinklersContainer: {
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  sprinklerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  ntdText: {
    fontSize: 11,
    textAlign: 'center',
  },
  nozzleBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  nozzleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
  },
  colorPill: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  colorCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorName: {
    fontSize: 10,
    color: '#cbd5e1',
    flex: 1,
    textAlign: 'right',
  },
  moreAlert: {
    padding: 10,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    alignItems: 'center',
  },
  moreAlertText: {
    fontSize: 10,
    color: '#38bdf8',
    textAlign: 'center',
    lineHeight: 14,
  },
  lockedTeaserBox: {
    backgroundColor: '#020617',
    borderTopWidth: 2,
    borderTopColor: '#f59e0b',
    padding: 14,
    gap: 12,
  },
  teaserHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
  },
  teaserTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'right',
  },
  teaserDesc: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
    lineHeight: 16,
    marginTop: 4,
  },
  teaserForm: {
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  teaserInputRow: {
    gap: 8,
  },
  teaserInput: {
    backgroundColor: '#020617',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: '#f8fafc',
    fontSize: 12,
    textAlign: 'right',
  },
  teaserSubmitBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingVertical: 9,
    gap: 6,
    marginTop: 2,
  },
  teaserSubmitText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  teaserLoginLink: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 6,
  },
  teaserLoginLinkText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Spacing Bar Styles ──
  spacingBarBox: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e3a5f',
    padding: 12,
    marginBottom: 12,
  },
  spacingBarHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  spacingBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
    textAlign: 'right',
  },
  spacingBarSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 8,
  },
  spacingChipsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  spacingChip: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 4,
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

  // ── Per-Span Breakdown Table Styles ──
  spanBreakdownBox: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    marginBottom: 14,
  },
  spanBreakdownHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sbTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  spanBreakdownTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'right',
  },
  spanBreakdownSub: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 3,
  },
  spanTableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  spanTh: {
    fontSize: 11,
    fontWeight: '800',
    color: '#93c5fd',
    textAlign: 'center',
  },
  spanTableRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#020617',
  },
  spanRowAlt: {
    backgroundColor: '#0b1120',
  },
  overhangRow: {
    backgroundColor: '#1c1917',
    borderBottomColor: '#451a03',
  },
  spanTd: {
    justifyContent: 'center',
  },
  towerNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  spanLenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  spanLenFeetText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  nozzleCountBadge: {
    backgroundColor: '#0c4a6e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 55,
    alignItems: 'center',
  },
  nozzleCountBadgeCustom: {
    backgroundColor: '#4c1d95',
    borderColor: '#8b5cf6',
  },
  nozzleCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
    textAlign: 'center',
  },
  nozzleCountTextCustom: {
    color: '#c4b5fd',
  },
  miniStepper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  miniStepBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f8fafc',
    minWidth: 20,
    textAlign: 'center',
  },
  resetCustomBtn: {
    padding: 3,
  },
  spanTableFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  spanTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  spanTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38bdf8',
  },
});

