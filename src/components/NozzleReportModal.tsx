import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  PivotConfig,
  PivotResults,
  NozzleConfig,
  NozzlePackageResults,
} from '../types/pivot';
import { formatNumber, calculatePivotSpanNozzles } from '../utils/pivotMath';
import { LOGO_BASE64 } from '../utils/logoBase64';

interface NozzleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PivotConfig;
  results: PivotResults;
  nozzleConfig: NozzleConfig;
  nozzleResults: NozzlePackageResults;
}

const SPRINKLER_NAMES: Record<string, string> = {
  nelson_d3000: 'نيلسون D3000 Sprayhead (Nelson)',
  nelson_rotator: 'نيلسون روتاتور R3000 (Nelson)',
  nelson_orbitor_hilal: 'نيلسون أوربيتور هلال (Nelson)',
  hunter_super_spray: 'هنتر سوبر سبراي UP3 (Hunter)',
  senninger_iwob: 'سيننجر آي ووب i-Wob UP3 (Senninger)',
};

export const NozzleReportModal: React.FC<NozzleReportModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
  nozzleConfig,
  nozzleResults,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTowerFilter, setSelectedTowerFilter] = useState<number | null>(null);

  // Spans math
  const spanMath = useMemo(
    () => calculatePivotSpanNozzles(config, nozzleConfig.firstSprinklerDistanceM),
    [config, nozzleConfig.firstSprinklerDistanceM]
  );
  const spansList = spanMath.spansBreakdown || [];

  // Filter sprinklers for screen display
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
        const matchesColor = item.colorCodeAr.toLowerCase().includes(query);
        if (!matchesIndex && !matchesNozzle && !matchesDist && !matchesColor) return false;
      }
      return true;
    });
  }, [nozzleResults.sprinklers, selectedTowerFilter, searchQuery]);

  // Aggregate quantities of each nozzle number (Bill of Materials)
  const nozzleQuantities = useMemo(() => {
    const map = new Map<number, { count: number; colorAr: string; colorHex?: string; diameterMm: number; diameterInch: string }>();
    for (const item of nozzleResults.sprinklers) {
      const existing = map.get(item.nozzleNumber);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(item.nozzleNumber, {
          count: 1,
          colorAr: item.colorCodeAr,
          colorHex: item.colorHex,
          diameterMm: item.orificeDiameterMm,
          diameterInch: item.orificeDiameter64thInch,
        });
      }
    }
    return Array.from(map.entries())
      .map(([nozzleNum, info]) => ({
        nozzleNumber: nozzleNum,
        ...info,
      }))
      .sort((a, b) => a.nozzleNumber - b.nozzleNumber);
  }, [nozzleResults.sprinklers]);

  const modelLabel = SPRINKLER_NAMES[nozzleConfig.sprinklerModel] || 'نيلسون D3000 Sprayhead';

  // Build Comprehensive HTML for Print/PDF
  const buildNozzleHtml = () => {
    const today = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Quantities BOM table rows
    const bomRowsHtml = nozzleQuantities
      .map(
        (b) => `
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; background: #f8fafc;">#${b.nozzleNumber}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${b.colorHex || '#64748b'}; vertical-align: middle; margin-left: 5px;"></span>
            ${b.colorAr}
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; direction: ltr;">${formatNumber(b.diameterMm, 2)} mm (${b.diameterInch})</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0284c7; font-size: 13px;">${b.count} قطعة</td>
        </tr>
      `
      )
      .join('');

    // Spans breakdown rows
    const spanSummaryRowsHtml = spansList
      .map(
        (sp) => `
        <tr>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">برج ${sp.spanNumber}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(sp.lengthMeters, 1)} م (${Math.round(sp.lengthFeet)} قدم)</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0284c7;">${sp.nozzleCount} بخاخ</td>
        </tr>
      `
      )
      .join('');

    // Full detailed nozzle table rows
    const nozzleTableRowsHtml = nozzleResults.sprinklers
      .map(
        (item) => `
        <tr style="${item.isOverhang ? 'background: #f0fdf4;' : item.index % 2 === 0 ? 'background: #f8fafc;' : ''}">
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${item.index}</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">${formatNumber(item.distanceFromCenterM, 1)} م</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">${Math.round(item.distanceFromCenterM * 3.28084)} ft</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: ${item.isOverhang ? '#15803d; font-weight: bold;' : '#334155;'}">${item.isOverhang ? 'كابولي' : 'برج ' + item.towerNumber}</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0284c7;">${formatNumber(item.requiredFlowGpm, 2)}</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">${formatNumber(item.requiredFlowLPerMin, 1)}</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: 900; color: #0f172a; font-size: 12px; background: #e0f2fe;">#${item.nozzleNumber}</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px; direction: ltr;">${formatNumber(item.orificeDiameterMm, 2)} mm</td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.colorHex || '#64748b'}; vertical-align: middle; margin-left: 3px;"></span>
            <span style="font-size: 10px; font-weight: 600;">${item.colorCodeAr}</span>
          </td>
          <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; color: #64748b;">${item.pressurePsi} PSI</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>ملف وجدول فوهات المحور الزراعي المعتمد - Aqua Pivot</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 10mm 15mm 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 0;
              direction: rtl;
              font-size: 11px;
              line-height: 1.4;
            }
            .header-box {
              border-bottom: 2px solid #0284c7;
              padding-bottom: 12px;
              margin-bottom: 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-box {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-img {
              width: 58px;
              height: 58px;
              border-radius: 10px;
              object-fit: contain;
            }
            .title {
              font-size: 19px;
              font-weight: 900;
              color: #0369a1;
              margin: 0;
            }
            .subtitle {
              font-size: 12px;
              color: #0284c7;
              font-weight: bold;
              margin-top: 3px;
            }
            .admin-badge {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              border: 1px solid #f59e0b;
              padding: 3px 8px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 11px;
              margin-top: 4px;
            }
            .meta-box {
              text-align: left;
              font-size: 11px;
              color: #475569;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 14px;
            }
            .kpi-card {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 8px;
              padding: 8px;
              text-align: center;
            }
            .kpi-title {
              font-size: 10px;
              color: #0369a1;
              font-weight: 700;
            }
            .kpi-val {
              font-size: 15px;
              font-weight: 900;
              color: #0284c7;
              margin-top: 2px;
            }
            .section-title {
              color: #0369a1;
              font-size: 13px;
              font-weight: 800;
              margin-top: 14px;
              margin-bottom: 8px;
              border-right: 4px solid #0284c7;
              padding-right: 8px;
            }
            .two-cols {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
            }
            .col-half {
              flex: 1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 10.5px;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
            th {
              background: #e0f2fe;
              color: #0369a1;
              padding: 6px 4px;
              border: 1px solid #cbd5e1;
              text-align: center;
              font-weight: 800;
              font-size: 10px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .info-table td {
              padding: 6px 8px;
              border: 1px solid #e2e8f0;
              font-size: 11px;
            }
            .info-label {
              background: #f8fafc;
              font-weight: bold;
              color: #475569;
              width: 45%;
            }
            .info-val {
              font-weight: 800;
              color: #0f172a;
              width: 55%;
            }
            .supervisor-stamp {
              margin-top: 20px;
              padding: 12px 16px;
              border: 2px dashed #0284c7;
              background: #f0fdf4;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              page-break-inside: avoid;
            }
            .stamp-text {
              font-size: 12px;
              font-weight: bold;
              color: #166534;
            }
            .stamp-sign {
              text-align: center;
              font-weight: bold;
              color: #0369a1;
            }
            .footer-note {
              margin-top: 15px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header-box">
            <div class="brand-box">
              <img src="${LOGO_BASE64}" class="logo-img" alt="Aqua Pivot Logo" />
              <div>
                <h1 class="title">جدول فوهات المحور المعتمد (Nozzle Chart)</h1>
                <div class="subtitle">ملف فوهات البخاخات الرسمي والبرمجة الهيدروليكية المعتمدة</div>
                <div class="admin-badge">إشراف واعتماد المهندس المشرف: مزمل (muzamil)</div>
              </div>
            </div>
            <div class="meta-box">
              <div style="font-weight: bold; color: #0284c7; font-size: 12px;">Aqua Pivot Calc PRO</div>
              <div>تاريخ الاعتماد: ${today}</div>
              <div>المرجع: AP-NZL-${config.towerCount}T-${Math.round(results.totalFeddans)}F</div>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">إجمالي الفوهات</div>
              <div class="kpi-val">${nozzleResults.totalSprinklers} بخاخ</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">موديل الرشاش</div>
              <div class="kpi-val" style="font-size: 12px;">${modelLabel.split(' ')[0]}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">ضغط المنظم</div>
              <div class="kpi-val">${nozzleConfig.regulatorPressurePsi} PSI</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">التدفق الإجمالي</div>
              <div class="kpi-val">${formatNumber(results.hydraulic.requiredFlowM3PerHour, 1)} م³/س</div>
            </div>
          </div>

          <!-- Two Columns: Technical Specs + Bill of Materials -->
          <div class="two-cols">
            <!-- Left/First: Pivot Specs -->
            <div class="col-half">
              <div class="section-title">أولاً: المعطيات الهندسية للهيكل والتشغيل</div>
              <table class="info-table">
                <tbody>
                  <tr>
                    <td class="info-label">عدد الأبراج وطول الهيكل:</td>
                    <td class="info-val">${config.towerCount} برج (${Math.round(results.pivotPipeRadius)} م)</td>
                  </tr>
                  <tr>
                    <td class="info-label">مساحة المحور الإجمالية:</td>
                    <td class="info-val">${formatNumber(results.totalFeddans, 2)} فدان (${formatNumber(results.totalHectares, 1)} هكتار)</td>
                  </tr>
                  <tr>
                    <td class="info-label">نصف قطر البلل الكلي:</td>
                    <td class="info-val">${Math.round(results.totalWettedRadius)} متر</td>
                  </tr>
                  <tr>
                    <td class="info-label">بُعد أول بخاخ عن المركز:</td>
                    <td class="info-val">${formatNumber(nozzleConfig.firstSprinklerDistanceM, 1)} متر</td>
                  </tr>
                  <tr>
                    <td class="info-label">متوسط تباعد البخاخات:</td>
                    <td class="info-val">${formatNumber(nozzleResults.spacingMeters, 2)} م (${Math.round(nozzleResults.spacingMeters * 39.37)} بوصة)</td>
                  </tr>
                  <tr>
                    <td class="info-label">طول الكابولي (Overhang):</td>
                    <td class="info-val">${config.overhangLength} متر (${spanMath.overhangBreakdown?.nozzleCount || 0} بخاخ)</td>
                  </tr>
                  <tr>
                    <td class="info-label">نطاق الفوهات بالمحور:</td>
                    <td class="info-val" style="color: #0284c7;">#${nozzleQuantities[0]?.nozzleNumber || '-'} إلى #${nozzleQuantities[nozzleQuantities.length - 1]?.nozzleNumber || '-'}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Spans Breakdown -->
              <div class="section-title">ثانياً: توزيع البخاخات على الأبراج</div>
              <table>
                <thead>
                  <tr>
                    <th>البرج</th>
                    <th>طول الأسبان</th>
                    <th>عدد البخاخات</th>
                  </tr>
                </thead>
                <tbody>
                  ${spanSummaryRowsHtml}
                  ${config.overhangLength > 0 ? `
                    <tr style="background: #f0fdf4;">
                      <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #15803d;">الكابولي</td>
                      <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(config.overhangLength, 1)} م</td>
                      <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #15803d;">${spanMath.overhangBreakdown?.nozzleCount || 0} بخاخ</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>

            <!-- Right/Second: Bill of Materials -->
            <div class="col-half">
              <div class="section-title">ثالثاً: حصر كميات الفونيات المطلوبة (BOM)</div>
              <table>
                <thead>
                  <tr>
                    <th>رقم الفونية</th>
                    <th>اللون المعتمد</th>
                    <th>قطر الفتحة</th>
                    <th>الكمية المطلوبة</th>
                  </tr>
                </thead>
                <tbody>
                  ${bomRowsHtml}
                </tbody>
              </table>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-size: 10px; color: #64748b; margin-top: 6px;">
                💡 <strong>ملاحظة فنية:</strong> يتم تركيب الفوهات تصاعدياً من أصغر مقاس عند قاعدة البرج الأول حتى أكبر مقاس عند نهاية الكابولي لموازنة توزيع المياه بانتظام كلي (CU > 90%).
              </div>
            </div>
          </div>

          <!-- Section: Detailed Sprinklers Table -->
          <div class="section-title">رابعاً: جدول الفونيات التفصيلي لجميع بخاخات المحور (${nozzleResults.totalSprinklers} بخاخ)</div>
          <table>
            <thead>
              <tr>
                <th style="width: 32px;">#</th>
                <th style="width: 55px;">المسافة (م)</th>
                <th style="width: 50px;">المسافة (ft)</th>
                <th style="width: 55px;">البرج</th>
                <th style="width: 55px;">التدفق (GPM)</th>
                <th style="width: 55px;">التدفق (ل/د)</th>
                <th style="width: 55px;">رقم الفونية</th>
                <th style="width: 60px;">القطر</th>
                <th>اللون المعتمد</th>
                <th style="width: 50px;">الضغط</th>
              </tr>
            </thead>
            <tbody>
              ${nozzleTableRowsHtml}
            </tbody>
          </table>

          <!-- Supervisor Stamp & Certification -->
          <div class="supervisor-stamp">
            <div class="stamp-text">
              <div>✅ تم تدقيق ومطابقة جدول الفوهات هيدروليكياً ومطابقته لمنحنى التدفق</div>
              <div style="font-size: 11px; color: #475569; margin-top: 3px;">
                المشرف الفني المعتمد: المهندس مزمل (muzamil) · حاسبة Aqua Pivot PRO
              </div>
            </div>
            <div class="stamp-sign">
              <div style="border-bottom: 1px solid #0284c7; padding-bottom: 2px; width: 140px; margin-bottom: 3px;">
                م. مزمل (muzamil)
              </div>
              <div style="font-size: 10px; color: #64748b;">توقيع وخاتم الاعتماد</div>
            </div>
          </div>

          <div class="footer-note">
            تم استخراج هذا التقرير التفصيلي لمنظومة فوهات الرشاشات المحورية بواسطة Aqua Pivot Calc PRO · سري وخاص بالجهة المشرفة
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintPdf = async () => {
    try {
      setIsGenerating(true);
      const html = buildNozzleHtml();
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('خطأ في الطباعة', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsGenerating(true);
      const html = buildNozzleHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة ملف فوهات المحور الزراعي المعتمد',
        });
      } else {
        Alert.alert('تنبيه', 'خاصية المشاركة غير متاحة على هذا الجهاز.');
      }
    } catch (err: any) {
      Alert.alert('خطأ في تصدير التقرير', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleBox}>
              <View style={styles.modalLogoBadge}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.modalLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.modalTitle}>ملف وجدول الفوهات المعتمد</Text>
                  <View style={styles.supervisorPill}>
                    <Text style={styles.supervisorPillText}>المشرف: مزمل</Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle}>
                  الجدول المفصل لجميع فوهات الرشاشات · {nozzleResults.totalSprinklers} بخاخ
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body Scroll */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Confidential Admin Hero Banner */}
            <View style={styles.heroBanner}>
              <View style={styles.heroTop}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#34d399" />
                <Text style={styles.heroTitle}>ملف هندسي معتمد (خاص بالمشرف)</Text>
              </View>
              <Text style={styles.heroDesc}>
                هذا الملف التفصيلي يحتوي على جدول الفونيات الكامل ({nozzleResults.totalSprinklers} بخاخ) مع كافة المقاسات والألوان وتوزيعها على الأبراج، وهو مخصص حصرياً للمشرف (muzamil) لتصديره أو مشاركته كـ PDF.
              </Text>

              {/* Quick Metrics */}
              <View style={styles.kpiRow}>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiVal}>{nozzleResults.totalSprinklers}</Text>
                  <Text style={styles.kpiLbl}>إجمالي الفوهات</Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiVal}>{nozzleConfig.regulatorPressurePsi} PSI</Text>
                  <Text style={styles.kpiLbl}>ضغط المنظم</Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiVal}>{formatNumber(results.hydraulic.requiredFlowM3PerHour, 1)}</Text>
                  <Text style={styles.kpiLbl}>التدفق م³/س</Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiVal}>#{nozzleQuantities[0]?.nozzleNumber || '-'}-#{nozzleQuantities[nozzleQuantities.length - 1]?.nozzleNumber || '-'}</Text>
                  <Text style={styles.kpiLbl}>نطاق الفوهات</Text>
                </View>
              </View>
            </View>

            {/* Model & System Specs Card */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cogs" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>المواصفات الفنية للرشاشات</Text>
              </View>
              <View style={styles.specBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>موديل البخاخ المعتمد:</Text>
                  <Text style={[styles.specVal, { color: '#38bdf8' }]}>{modelLabel}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>بُعد أول بخاخ عن المركز:</Text>
                  <Text style={styles.specVal}>{formatNumber(nozzleConfig.firstSprinklerDistanceM, 1)} متر</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>متوسط التباعد بين البخاخات:</Text>
                  <Text style={styles.specVal}>{formatNumber(nozzleResults.spacingMeters, 2)} متر ({Math.round(nozzleResults.spacingMeters * 39.37)} بوصة)</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>عدد الأبراج والكابولي:</Text>
                  <Text style={styles.specVal}>{config.towerCount} برج {config.overhangLength > 0 ? `+ كابولي (${config.overhangLength} م)` : ''}</Text>
                </View>
              </View>
            </View>

            {/* Bill of Materials (BOM) Quantities Card */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="format-list-checks" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>حصر كميات الفونيات المطلوبة للتوريد (BOM)</Text>
              </View>
              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, { width: 60 }]}>رقم الفونية</Text>
                  <Text style={[styles.thText, { flex: 1.2 }]}>اللون المعتمد</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>قطر الفتحة</Text>
                  <Text style={[styles.thText, { width: 70, textAlign: 'center' }]}>الكمية</Text>
                </View>
                {nozzleQuantities.map((b) => (
                  <View key={b.nozzleNumber} style={styles.tableDataRow}>
                    <Text style={[styles.tdText, { width: 60, color: '#38bdf8', fontWeight: '800' }]}>
                      #{b.nozzleNumber}
                    </Text>
                    <View style={[styles.colorPillRow, { flex: 1.2 }]}>
                      <View style={[styles.colorCircle, { backgroundColor: b.colorHex || '#64748b' }]} />
                      <Text style={styles.colorPillText} numberOfLines={1}>{b.colorAr}</Text>
                    </View>
                    <Text style={[styles.tdText, { flex: 1, direction: 'ltr', fontSize: 11 }]}>
                      {formatNumber(b.diameterMm, 2)} mm
                    </Text>
                    <View style={[styles.qtyBadge, { width: 70 }]}>
                      <Text style={styles.qtyBadgeText}>{b.count} قطعة</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Full Sprinklers Table Section */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="table-large" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>جدول الفونيات التفصيلي لجميع الأبراج ({filteredSprinklers.length} بخاخ)</Text>
              </View>

              {/* Search & Filter Controls */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="#64748b" style={{ marginLeft: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="بحث برقم البخاخ، الفونية، المسافة، أو اللون..."
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
                {Array.from({ length: config.towerCount }, (_, i) => i + 1).map((tNum) => (
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

              {/* Table Header */}
              <View style={styles.nozzleTableHeader}>
                <Text style={[styles.nthText, { width: 40 }]}>#</Text>
                <Text style={[styles.nthText, { width: 55 }]}>المسافة</Text>
                <Text style={[styles.nthText, { width: 50 }]}>البرج</Text>
                <Text style={[styles.nthText, { width: 55 }]}>GPM</Text>
                <Text style={[styles.nthText, { width: 55 }]}>الفونية</Text>
                <Text style={[styles.nthText, { flex: 1 }]}>اللون المعتمد</Text>
              </View>

              {/* Table Rows */}
              <View style={styles.sprinklersList}>
                {filteredSprinklers.map((item) => (
                  <View key={item.index} style={styles.sprinklerRow}>
                    <Text style={[styles.ntdText, { width: 40, fontWeight: '700', color: '#94a3b8' }]}>
                      {item.index}
                    </Text>
                    <Text style={[styles.ntdText, { width: 55, color: '#f8fafc' }]}>
                      {`${formatNumber(item.distanceFromCenterM, 1)} م`}
                    </Text>
                    <Text style={[styles.ntdText, { width: 50, color: item.isOverhang ? '#06b6d4' : '#cbd5e1' }]}>
                      {item.isOverhang ? 'كابولي' : `ب ${item.towerNumber}`}
                    </Text>
                    <Text style={[styles.ntdText, { width: 55, fontWeight: '700', color: '#38bdf8' }]}>
                      {formatNumber(item.requiredFlowGpm, 2)}
                    </Text>
                    <View style={[styles.nozzleBadge, { width: 55 }]}>
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
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleSharePdf}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="share-variant" size={18} color="#ffffff" />
                  <Text style={styles.actionBtnText}>مشاركة ملف الفونيات (PDF)</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.printBtn]}
              onPress={handlePrintPdf}
              disabled={isGenerating}
            >
              <MaterialCommunityIcons name="printer" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>طباعة الجدول الكامل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalLogoBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalLogoImg: {
    width: 38,
    height: 38,
  },
  titleBadgeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
  },
  supervisorPill: {
    backgroundColor: '#d97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  supervisorPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  scrollBody: {
    marginTop: 12,
  },
  heroBanner: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  heroTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34d399',
  },
  heroDesc: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
  },
  kpiLbl: {
    fontSize: 9.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardSection: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#f8fafc',
  },
  specBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  specRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  specVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#f8fafc',
  },
  tableCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableHeaderRow: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
    textAlign: 'center',
  },
  tableDataRow: {
    flexDirection: 'row-reverse',
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tdText: {
    fontSize: 11,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  colorPillRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  colorPillText: {
    fontSize: 11,
    color: '#e2e8f0',
  },
  colorCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  qtyBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  qtyBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11.5,
    paddingVertical: 4,
    textAlign: 'right',
  },
  filterChipsRow: {
    flexDirection: 'row-reverse',
    gap: 6,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  filterChipText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  nozzleTableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1e293b',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  nthText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#38bdf8',
    textAlign: 'center',
  },
  sprinklersList: {
    marginTop: 4,
  },
  sprinklerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  ntdText: {
    fontSize: 11,
    textAlign: 'center',
  },
  nozzleBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  nozzleBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  colorPill: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  colorName: {
    fontSize: 10.5,
    color: '#cbd5e1',
  },
  modalFooter: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shareBtn: {
    backgroundColor: '#0284c7',
  },
  printBtn: {
    backgroundColor: '#10b981',
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#ffffff',
  },
});
