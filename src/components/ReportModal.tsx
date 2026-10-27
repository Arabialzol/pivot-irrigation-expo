import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
} from '../types/pivot';
import { formatNumber, FEDDAN_VALUES } from '../utils/pivotMath';
import { LOGO_BASE64 } from '../utils/logoBase64';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PivotConfig;
  results: PivotResults;
  nozzleConfig?: any;
  nozzleResults?: any;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const stdInfo = FEDDAN_VALUES[config.feddanStandard];
  const { feddans, qirats, sahms } = results.feddanBreakdown;

  // Compute Timer vs Applied Depth Operational Guide Table
  const timerGuideList = useMemo(() => {
    const percentages = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    const baseSpeed100 =
      results.operational.lastTowerSpeedActualMPerHr / (config.timerPercent / 100 || 1);

    return percentages.map((pct) => {
      const factor = pct / 100;
      const speedMPerHr = Math.max(0.1, baseSpeed100 * factor);
      const hours = results.operational.lastTowerCircumferenceM / speedMPerHr;
      const depthMm =
        results.totalAreaM2 > 0
          ? (results.hydraulic.requiredFlowM3PerHour * hours * 1000) / results.totalAreaM2
          : 0;
      const isCurrent = pct === config.timerPercent;
      return {
        pct,
        speedMPerHr,
        hours,
        days: hours / 24,
        depthMm,
        isCurrent,
      };
    });
  }, [
    config.timerPercent,
    results.operational.lastTowerSpeedActualMPerHr,
    results.operational.lastTowerCircumferenceM,
    results.hydraulic.requiredFlowM3PerHour,
    results.totalAreaM2,
  ]);

  // Generate HTML for PDF export without nozzle table (concise executive + irrigation & operation report)
  const buildReportHtml = () => {
    const towerRowsHtml = results.towerRings
      .map(
        (ring) => `
        <tr>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; background: #f8fafc;">برج ${ring.towerIndex}</td>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(ring.spanLength, 1)} م</td>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${Math.round(ring.outerRadius)} م</td>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; color: #0284c7; font-weight: bold;">${formatNumber(ring.ringFeddans, 2)} ف</td>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${formatNumber(ring.cumulativeFeddans, 2)} ف</td>
          <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(ring.percentageOfTotal, 1)}%</td>
        </tr>
      `
      )
      .join('');

    const overhangRowHtml =
      results.overhangRing.ringAreaM2 > 0
        ? `
      <tr style="background: #f0fdf4;">
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #166534;">الكابولي (${config.overhangLength} م)</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(config.overhangLength, 1)} م</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${Math.round(results.overhangRing.outerRadius)} م</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; color: #15803d; font-weight: bold;">${formatNumber(results.overhangRing.ringFeddans, 2)} ف</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${formatNumber(results.totalFeddans, 2)} ف</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(results.overhangRing.percentageOfTotal, 1)}%</td>
      </tr>
    `
        : '';

    const endGunRowHtml =
      config.hasEndGun && results.endGunRing
        ? `
      <tr style="background: #fffbeb;">
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #b45309;">مدفع النهاية (${config.endGunThrow} م)</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(config.endGunThrow, 1)} م</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${Math.round(results.totalWettedRadius)} م</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; color: #d97706; font-weight: bold;">${formatNumber(results.endGunRing.ringFeddans, 2)} ف</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${formatNumber(results.totalFeddans, 2)} ف</td>
        <td style="padding: 7px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(results.endGunRing.percentageOfTotal, 1)}%</td>
      </tr>
    `
        : '';

    // Timer Guide rows HTML
    const timerGuideRowsHtml = timerGuideList
      .map(
        (t) => `
        <tr style="${t.isCurrent ? 'background: #e0f2fe; font-weight: bold;' : ''}">
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: ${t.isCurrent ? '#0369a1' : '#0f172a'}; font-weight: bold;">
            ${t.pct}% ${t.isCurrent ? '⭐ (المضبوط)' : ''}
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(t.hours, 1)} س (${formatNumber(t.days, 1)} يوم)</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${formatNumber(t.speedMPerHr, 1)} م/س</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; color: #059669; font-weight: bold;">${formatNumber(t.depthMm, 1)} ملم</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>تقرير المواصفات وتشغيل الري المعتمد - Aqua Pivot</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 12mm 16mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              padding: 0;
              margin: 0;
              direction: rtl;
              font-size: 11.5px;
              line-height: 1.45;
            }
            .header {
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
              width: 60px;
              height: 60px;
              border-radius: 12px;
              object-fit: contain;
            }
            .title {
              font-size: 20px;
              font-weight: 900;
              color: #0369a1;
              margin: 0;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              margin-top: 3px;
            }
            .kpi-box {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 10px;
              padding: 12px;
              margin-bottom: 14px;
              text-align: center;
            }
            .kpi-val {
              font-size: 28px;
              font-weight: 900;
              color: #0284c7;
            }
            .kpi-lbl {
              font-size: 12px;
              color: #0369a1;
              font-weight: bold;
              margin-top: 3px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 14px;
            }
            .card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 8px;
              text-align: center;
            }
            .card-title {
              font-size: 10.5px;
              color: #64748b;
              font-weight: 600;
            }
            .card-val {
              font-size: 14px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 3px;
            }
            .section-title {
              color: #0369a1;
              font-size: 13.5px;
              font-weight: 800;
              margin-top: 16px;
              margin-bottom: 8px;
              border-right: 4px solid #0284c7;
              padding-right: 8px;
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
              padding: 7px;
              border: 1px solid #cbd5e1;
              text-align: center;
              font-weight: bold;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            .info-table td {
              padding: 7px 10px;
              border: 1px solid #e2e8f0;
              font-size: 11px;
            }
            .info-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .info-label {
              font-weight: bold;
              color: #475569;
              width: 42%;
            }
            .info-value {
              color: #0f172a;
              font-weight: 700;
              width: 58%;
            }
            .two-cols {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
            }
            .col-half {
              flex: 1;
            }
            .footer {
              margin-top: 24px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-box">
              <img src="${LOGO_BASE64}" class="logo-img" alt="Aqua Pivot Logo" />
              <div>
                <h1 class="title">Aqua Pivot</h1>
                <div class="subtitle">تقرير المواصفات الهندسية وتشغيل الري المعتمد · معيار: ${stdInfo.nameAr}</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #64748b; text-align: left;">
              <div style="font-weight: bold; color: #0284c7;">Aqua Pivot Calc PRO</div>
              <div>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>

          <div class="kpi-box">
            <div class="kpi-val">${formatNumber(results.totalFeddans, 2)} فدان</div>
            <div class="kpi-lbl">المساحة الإجمالية: ${feddans} فدان و ${qirats} قيراط و ${sahms} سهم (${formatNumber(results.totalAreaM2, 0)} م² / ${formatNumber(results.totalHectares, 2)} هكتار)</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">عدد الأبراج وطول الهيكل</div>
              <div class="card-val">${config.towerCount} برج (${Math.round(results.pivotPipeRadius)} م)</div>
            </div>
            <div class="card">
              <div class="card-title">نصف قطر البلل الكلي</div>
              <div class="card-val">${Math.round(results.totalWettedRadius)} متر</div>
            </div>
            <div class="card">
              <div class="card-title">التدفق الإجمالي المطلوب</div>
              <div class="card-val">${formatNumber(results.hydraulic.requiredFlowM3PerHour, 1)} م³/س (${formatNumber(results.hydraulic.requiredFlowGpm, 0)} GPM)</div>
            </div>
            <div class="card">
              <div class="card-title">زمن الدورة الكاملة (360°)</div>
              <div class="card-val">${formatNumber(results.operational.actualRotationHours, 1)} س (${formatNumber(results.operational.actualRotationDays, 1)} يوم)</div>
            </div>
          </div>

          <!-- Section 1: Specifications & Towers -->
          <div class="section-title">أولاً: المواصفات الهندسية ومساحات الحلقات والأبراج</div>
          <table>
            <thead>
              <tr>
                <th>الموضع</th>
                <th>طول الأسبان</th>
                <th>نصف القطر الخارجي</th>
                <th>مساحة الحلقة</th>
                <th>المساحة التراكمية</th>
                <th>النسبة من الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${towerRowsHtml}
              ${overhangRowHtml}
              ${endGunRowHtml}
            </tbody>
          </table>

          <!-- Section 2: Operation & Timing -->
          <div class="section-title">ثانياً: تقرير تشغيل وسرعة المحور (Operation & Timing)</div>
          <table class="info-table">
            <tbody>
              <tr>
                <td class="info-label">نسبة ضبط المؤقت (التايمر %):</td>
                <td class="info-value" style="color: #0284c7; font-size: 13px;">${config.timerPercent}%</td>
              </tr>
              <tr>
                <td class="info-label">زمن اللفة الكاملة (360°) عند 100%:</td>
                <td class="info-value">${formatNumber(results.operational.rotationHoursAt100, 1)} ساعة (${formatNumber(results.operational.rotationHoursAt100 / 24, 1)} يوم مستمر)</td>
              </tr>
              <tr>
                <td class="info-label">زمن اللفة الفعلي عند نسبة ${config.timerPercent}%:</td>
                <td class="info-value" style="color: #0284c7;">${formatNumber(results.operational.actualRotationHours, 1)} ساعة (${formatNumber(results.operational.actualRotationDays, 1)} يوم مستمر)</td>
              </tr>
              <tr>
                <td class="info-label">ساعات تشغيل المضخة اليومية المقررة:</td>
                <td class="info-value">${config.dailyOperatingHours} ساعة/يوم (${formatNumber(results.operational.calendarDaysWithPumpHours, 1)} يوم تقويمي للفة)</td>
              </tr>
              <tr>
                <td class="info-label">سرعة البرج الأخير عند 100%:</td>
                <td class="info-value">${formatNumber(results.operational.lastTowerSpeedActualMPerHr / (config.timerPercent / 100 || 1), 1)} م/ساعة</td>
              </tr>
              <tr>
                <td class="info-label">سرعة البرج الأخير الفعلية:</td>
                <td class="info-value">${formatNumber(results.operational.lastTowerSpeedActualMPerHr, 1)} م/ساعة</td>
              </tr>
              <tr>
                <td class="info-label">محيط مسار البرج الأخير:</td>
                <td class="info-value">${Math.round(results.operational.lastTowerCircumferenceM)} متر</td>
              </tr>
              <tr>
                <td class="info-label">عمق مياه الري المطبق في اللفة (Gross Applied Depth):</td>
                <td class="info-value" style="color: #059669; font-size: 13px;">${formatNumber(results.operational.appliedDepthMmPerPass, 1)} ملم / لفة</td>
              </tr>
            </tbody>
          </table>

          <!-- Section 3: Operational Guide: Timer vs Depth -->
          <div class="section-title">ثالثاً: دليل تشغيل الري وسرعات التايمر (Timer vs Depth Guide)</div>
          <table>
            <thead>
              <tr>
                <th>نسبة التايمر (%)</th>
                <th>زمن اللفة الكاملة</th>
                <th>سرعة البرج الأخير</th>
                <th>عمق الري المطبق (ملم/لفة)</th>
              </tr>
            </thead>
            <tbody>
              ${timerGuideRowsHtml}
            </tbody>
          </table>

          <!-- Section 4: Hydraulics & Agronomy -->
          <div class="section-title">رابعاً: المقررات المائية والهيدروليكا والمحصول (Hydraulics & Agronomy)</div>
          <table class="info-table">
            <tbody>
              <tr>
                <td class="info-label">التدفق الإجمالي المطلوب بالمتر المكعب:</td>
                <td class="info-value" style="color: #0284c7;">${formatNumber(results.hydraulic.requiredFlowM3PerHour, 1)} م³/ساعة</td>
              </tr>
              <tr>
                <td class="info-label">التدفق بالجالون في الدقيقة (GPM):</td>
                <td class="info-value">${formatNumber(results.hydraulic.requiredFlowGpm, 0)} GPM</td>
              </tr>
              <tr>
                <td class="info-label">التدفق باللتر في الثانية:</td>
                <td class="info-value">${formatNumber(results.hydraulic.requiredFlowLitersPerSec, 1)} لتر/ثانية</td>
              </tr>
              <tr>
                <td class="info-label">حجم المياه المستهلك يومياً:</td>
                <td class="info-value">${formatNumber(results.hydraulic.waterVolumeM3PerDay, 0)} م³/يوم</td>
              </tr>
              <tr>
                <td class="info-label">المحصول المختار والظروف:</td>
                <td class="info-value">${results.agronomic.cropNameAr} (${results.agronomic.climateNameAr} - ${results.agronomic.temperatureC}°C)</td>
              </tr>
              <tr>
                <td class="info-label">البخر نتح المرجعي (ETo) ومعامل المحصول (Kc):</td>
                <td class="info-value">ETo = ${formatNumber(results.agronomic.etoMm, 1)} ملم/يوم | Kc = ${formatNumber(results.agronomic.cropKc, 2)}</td>
              </tr>
              <tr>
                <td class="info-label">الاحتياج المائي الإجمالي للفدان:</td>
                <td class="info-value" style="color: #059669;">${formatNumber(results.agronomic.grossDailyVolumeM3PerFeddan, 1)} م³/فدان/يوم</td>
              </tr>
              <tr>
                <td class="info-label">العمق المقترح علمياً للمحصول:</td>
                <td class="info-value">${formatNumber(results.agronomic.recommendedDepthMm, 1)} ملم/يوم</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            تم استخراج هذا التقرير الهندسي والتشغيلي المعتمد بواسطة منظومة Aqua Pivot Calc PRO لهندسة وتشغيل الري المحوري
          </div>
        </body>
      </html>
    `;
  };

  const handlePrintPdf = async () => {
    try {
      setIsGenerating(true);
      const html = buildReportHtml();
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
      const html = buildReportHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'مشاركة التقرير الهندسي والتشغيلي للمحور',
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
                <Text style={styles.modalTitle}>التقرير الهندسي والتشغيلي المعتمد</Text>
                <Text style={styles.modalSubtitle}>Aqua Pivot Calc · تقرير المواصفات والري والتشغيل</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body Scroll */}
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Hero Summary */}
            <View style={styles.reportHero}>
              <Text style={styles.reportHeroSubtitle}>إجمالي مساحة المحور بالفدان</Text>
              <Text style={styles.reportHeroVal}>{formatNumber(results.totalFeddans, 2)} فدان</Text>
              <Text style={styles.reportHeroBreakdown}>
                {feddans} فدان و {qirats} قيراط و {sahms} سهم ({formatNumber(results.totalAreaM2, 0)} م² / {formatNumber(results.totalHectares, 2)} هكتار)
              </Text>
            </View>

            {/* Quick Specs Section */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="ruler-square" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>المواصفات الهندسية والهيكل</Text>
              </View>
              <View style={styles.specBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>معيار الفدان:</Text>
                  <Text style={styles.specVal}>{stdInfo.nameAr}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>عدد الأبراج:</Text>
                  <Text style={styles.specVal}>{config.towerCount} برج</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>طول ماسورة الهيكل:</Text>
                  <Text style={styles.specVal}>{Math.round(results.pivotPipeRadius)} متر</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>طول الكابولي (Overhang):</Text>
                  <Text style={styles.specVal}>{config.overhangLength} متر</Text>
                </View>
                {config.hasEndGun && results.endGunRing && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>مدفع النهاية (End Gun):</Text>
                    <Text style={[styles.specVal, { color: '#f59e0b' }]}>{config.endGunThrow} متر</Text>
                  </View>
                )}
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>نصف قطر البلل الإجمالي:</Text>
                  <Text style={[styles.specVal, { color: '#38bdf8' }]}>{Math.round(results.totalWettedRadius)} متر</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>المساحة بالمتر المربع:</Text>
                  <Text style={styles.specVal}>{formatNumber(results.totalAreaM2, 0)} م²</Text>
                </View>
              </View>
            </View>

            {/* Towers rings summary */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-donut" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>توزيع مساحات الأبراج ({config.towerCount} برج)</Text>
              </View>
              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, { width: 50 }]}>البرج</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>طول الأسبان</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>نصف القطر</Text>
                  <Text style={[styles.thText, { flex: 1 }]}>المساحة</Text>
                  <Text style={[styles.thText, { width: 45 }]}>النسبة</Text>
                </View>

                {results.towerRings.map((ring) => (
                  <View key={ring.towerIndex} style={styles.tableDataRow}>
                    <Text style={[styles.tdText, { width: 50, color: '#38bdf8', fontWeight: '700' }]}>
                      برج {ring.towerIndex}
                    </Text>
                    <Text style={[styles.tdText, { flex: 1 }]}>{formatNumber(ring.spanLength, 1)} م</Text>
                    <Text style={[styles.tdText, { flex: 1 }]}>{Math.round(ring.outerRadius)} م</Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#f8fafc', fontWeight: '700' }]}>
                      {formatNumber(ring.ringFeddans, 1)} ف
                    </Text>
                    <Text style={[styles.tdText, { width: 45, color: '#94a3b8' }]}>
                      {formatNumber(ring.percentageOfTotal, 0)}%
                    </Text>
                  </View>
                ))}

                {results.overhangRing.ringAreaM2 > 0 && (
                  <View style={[styles.tableDataRow, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                    <Text style={[styles.tdText, { width: 50, color: '#34d399', fontWeight: '700' }]}>
                      كابولي
                    </Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#34d399' }]}>{formatNumber(config.overhangLength, 1)} م</Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#34d399' }]}>{Math.round(results.overhangRing.outerRadius)} م</Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#34d399', fontWeight: '700' }]}>
                      {formatNumber(results.overhangRing.ringFeddans, 1)} ف
                    </Text>
                    <Text style={[styles.tdText, { width: 45, color: '#34d399' }]}>
                      {formatNumber(results.overhangRing.percentageOfTotal, 0)}%
                    </Text>
                  </View>
                )}

                {config.hasEndGun && results.endGunRing && (
                  <View style={[styles.tableDataRow, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
                    <Text style={[styles.tdText, { width: 50, color: '#f59e0b', fontWeight: '700' }]}>
                      مدفع
                    </Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#f59e0b' }]}>{formatNumber(config.endGunThrow, 1)} م</Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#f59e0b' }]}>{Math.round(results.totalWettedRadius)} م</Text>
                    <Text style={[styles.tdText, { flex: 1, color: '#f59e0b', fontWeight: '700' }]}>
                      {formatNumber(results.endGunRing.ringFeddans, 1)} ف
                    </Text>
                    <Text style={[styles.tdText, { width: 45, color: '#f59e0b' }]}>
                      {formatNumber(results.endGunRing.percentageOfTotal, 0)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Operation & Timing Section */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="speedometer" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>حسابات التشغيل والسرعة (Operation & Timing)</Text>
              </View>
              <View style={styles.specBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>نسبة التايمر المضبوطة:</Text>
                  <Text style={[styles.specVal, { color: '#38bdf8', fontSize: 13 }]}>{config.timerPercent}%</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>زمن اللفة الكاملة (360°):</Text>
                  <Text style={[styles.specVal, { color: '#38bdf8' }]}>
                    {formatNumber(results.operational.actualRotationHours, 1)} ساعة ({formatNumber(results.operational.actualRotationDays, 1)} يوم مستمر)
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>ساعات الضخ اليومية المقررة:</Text>
                  <Text style={styles.specVal}>{config.dailyOperatingHours} ساعة/يوم ({formatNumber(results.operational.calendarDaysWithPumpHours, 1)} يوم تقويمي)</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>زمن الدورة عند 100%:</Text>
                  <Text style={styles.specVal}>
                    {formatNumber(results.operational.rotationHoursAt100, 1)} ساعة ({formatNumber(results.operational.rotationHoursAt100 / 24, 1)} يوم)
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>سرعة البرج الأخير الفعلية:</Text>
                  <Text style={styles.specVal}>
                    {formatNumber(results.operational.lastTowerSpeedActualMPerHr, 1)} م/ساعة
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>محيط مسار البرج الأخير:</Text>
                  <Text style={styles.specVal}>{Math.round(results.operational.lastTowerCircumferenceM)} متر</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>عمق المياه المطبق في اللفة:</Text>
                  <Text style={[styles.specVal, { color: '#34d399', fontSize: 13 }]}>
                    {formatNumber(results.operational.appliedDepthMmPerPass, 1)} ملم / لفة
                  </Text>
                </View>
              </View>
            </View>

            {/* Operational Guide: Timer vs Depth Table */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="timer-cog-outline" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>دليل ضبط التايمر وأعماق مياه الري (Timer vs Depth)</Text>
              </View>
              <Text style={styles.tableSubNote}>
                جدول إرشادي يوضح عمق مياه الري المعطى للحقل عند نسب تايمر مختلفة:
              </Text>
              <View style={styles.tableCard}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, { flex: 1.1 }]}>التايمر %</Text>
                  <Text style={[styles.thText, { flex: 1.4 }]}>زمن اللفة</Text>
                  <Text style={[styles.thText, { flex: 1.3 }]}>السرعة (م/س)</Text>
                  <Text style={[styles.thText, { flex: 1.4 }]}>العمق (ملم)</Text>
                </View>

                {timerGuideList.map((t) => (
                  <View
                    key={t.pct}
                    style={[
                      styles.tableDataRow,
                      t.isCurrent && { backgroundColor: 'rgba(2, 132, 199, 0.2)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tdText,
                        { flex: 1.1, fontWeight: '800' },
                        t.isCurrent ? { color: '#38bdf8' } : { color: '#f8fafc' },
                      ]}
                    >
                      {t.pct}% {t.isCurrent ? '⭐' : ''}
                    </Text>
                    <Text style={[styles.tdText, { flex: 1.4 }]}>
                      {formatNumber(t.hours, 1)} س
                    </Text>
                    <Text style={[styles.tdText, { flex: 1.3 }]}>
                      {formatNumber(t.speedMPerHr, 1)}
                    </Text>
                    <Text
                      style={[
                        styles.tdText,
                        { flex: 1.4, color: '#34d399', fontWeight: '800' },
                      ]}
                    >
                      {formatNumber(t.depthMm, 1)} ملم
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Hydraulics & Irrigation Section */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="water" size={18} color="#38bdf8" />
                <Text style={styles.sectionHeading}>الهيدروليكا ومقررات الري (Hydraulics & Agronomy)</Text>
              </View>
              <View style={styles.specBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>التدفق المطلوب بالمتر المكعب:</Text>
                  <Text style={[styles.specVal, { color: '#38bdf8', fontSize: 13 }]}>
                    {formatNumber(results.hydraulic.requiredFlowM3PerHour, 1)} م³/ساعة
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>التدفق المطلوب بالجالون:</Text>
                  <Text style={styles.specVal}>{formatNumber(results.hydraulic.requiredFlowGpm, 0)} GPM</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>التدفق باللتر في الثانية:</Text>
                  <Text style={styles.specVal}>{formatNumber(results.hydraulic.requiredFlowLitersPerSec, 1)} لتر/ث</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>استهلاك المياه اليومي الإجمالي:</Text>
                  <Text style={styles.specVal}>{formatNumber(results.hydraulic.waterVolumeM3PerDay, 0)} م³/يوم</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>المحصول والمناخ:</Text>
                  <Text style={styles.specVal}>
                    {results.agronomic.cropNameAr} ({results.agronomic.climateNameAr} - {results.agronomic.temperatureC}°C)
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>البخر نتح المرجعي (ETo):</Text>
                  <Text style={styles.specVal}>{formatNumber(results.agronomic.etoMm, 1)} ملم/يوم</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>معامل المحصول (Kc):</Text>
                  <Text style={styles.specVal}>{formatNumber(results.agronomic.cropKc, 2)}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>الاحتياج الإجمالي للفدان:</Text>
                  <Text style={[styles.specVal, { color: '#34d399' }]}>
                    {formatNumber(results.agronomic.grossDailyVolumeM3PerFeddan, 1)} م³/فدان/يوم
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons Footer */}
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
                  <Text style={styles.actionBtnText}>مشاركة PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.printBtn]}
              onPress={handlePrintPdf}
              disabled={isGenerating}
            >
              <MaterialCommunityIcons name="printer" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>طباعة التقرير</Text>
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
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
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
    paddingBottom: 12,
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
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
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
  reportHero: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
    marginBottom: 14,
  },
  reportHeroSubtitle: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  reportHeroVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#38bdf8',
    marginVertical: 4,
  },
  reportHeroBreakdown: {
    fontSize: 11.5,
    color: '#cbd5e1',
    fontWeight: '700',
    textAlign: 'center',
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
  tableSubNote: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginBottom: 8,
    lineHeight: 16,
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
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tdText: {
    fontSize: 11,
    color: '#e2e8f0',
    textAlign: 'center',
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
