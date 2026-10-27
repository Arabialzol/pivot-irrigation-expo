import {
  FeddanStandard,
  ManufacturerId,
  ManufacturerPreset,
  PivotConfig,
  PivotResults,
  PresetFieldSize,
  TowerRingData,
  CropType,
  CropInfo,
  ClimateSeasonType,
  ClimateSeasonInfo,
  AgronomicResults,
  StandardSpanPreset,
  SpacingPresetType,
  PivotNozzleCalculationResult,
  SpanNozzleBreakdown,
} from '../types/pivot';

export const FEDDAN_VALUES: Record<FeddanStandard, { nameAr: string; m2: number; description: string }> = {
  egyptian: {
    nameAr: 'فدان مصري معتمد',
    m2: 4200.833,
    description: '4200.833 م² (24 قيراط × 24 سهم، القيراط = 175.035 م²)',
  },
  sudanese: {
    nameAr: 'فدان سوداني قياسي',
    m2: 4200.0,
    description: '4200.000 م² (24 قيراط × 24 سهم، القيراط = 175.000 م²)',
  },
};

export const MANUFACTURER_PRESETS: Record<ManufacturerId, ManufacturerPreset> = {
  valley: {
    id: 'valley',
    nameAr: 'فالي (Valley Irrigation)',
    nameEn: 'Valmont Valley',
    country: 'الولايات المتحدة الأمريكية',
    defaultSpan: 47.9,
    availableSpans: [41.3, 47.9, 54.6, 61.3, 34.6],
    defaultOverhang: 13.4,
    availableOverhangs: [6.7, 13.4, 20.1, 26.8],
    standardPipeDiameterInch: 8.625,
    typicalMaxSpeedMPerHr: 210,
    description: 'سلسلة 8000/7000 الأكثر شيوعاً في المشاريع الزراعية الكبرى.',
  },
  zimmatic: {
    id: 'zimmatic',
    nameAr: 'زيماتيك (Lindsay Zimmatic)',
    nameEn: 'Lindsay Zimmatic',
    country: 'الولايات المتحدة الأمريكية',
    defaultSpan: 44.5,
    availableSpans: [38.4, 44.5, 50.6, 56.7, 62.8],
    defaultOverhang: 12.2,
    availableOverhangs: [6.1, 12.2, 18.3, 24.4],
    standardPipeDiameterInch: 8.0,
    typicalMaxSpeedMPerHr: 200,
    description: 'هيكل متين من الصلب المجلفن بنظام Uni-Knuckle ووصلات مرنة.',
  },
  reinke: {
    id: 'reinke',
    nameAr: 'رينكي (Reinke)',
    nameEn: 'Reinke Manufacturing',
    country: 'الولايات المتحدة الأمريكية',
    defaultSpan: 47.5,
    availableSpans: [41.5, 47.5, 53.6, 59.7, 35.4],
    defaultOverhang: 11.6,
    availableOverhangs: [5.8, 11.6, 17.4, 23.2],
    standardPipeDiameterInch: 8.0,
    typicalMaxSpeedMPerHr: 215,
    description: 'تصميم الألمنيوم والصلب عالي المقاومة مع وزن خفيف وتوفير للطاقة.',
  },
  bauer: {
    id: 'bauer',
    nameAr: 'باور (Bauer)',
    nameEn: 'Bauer Austria',
    country: 'النمسا / أوروبا',
    defaultSpan: 50.0,
    availableSpans: [43.0, 50.0, 57.0, 36.0],
    defaultOverhang: 12.0,
    availableOverhangs: [6.0, 12.0, 18.0, 24.0],
    standardPipeDiameterInch: 8.125,
    typicalMaxSpeedMPerHr: 220,
    description: 'الهندسة النمساوية الرائدة في أنظمة الري ذات الكفاءة الهيدروليكية العالية.',
  },
  custom: {
    id: 'custom',
    nameAr: 'محور مخصص (أبعاد حرة)',
    nameEn: 'Custom / Universal',
    country: 'مخصص',
    defaultSpan: 48.0,
    availableSpans: [35.0, 40.0, 45.0, 48.0, 50.0, 55.0, 60.0],
    defaultOverhang: 12.0,
    availableOverhangs: [0, 5.0, 10.0, 12.0, 15.0, 20.0, 25.0],
    standardPipeDiameterInch: 8.0,
    typicalMaxSpeedMPerHr: 205,
    description: 'تحديد دقيق ومفتوح لأطوال الأبراج حسب المعاينة الحقلية للمزرعة.',
  },
};

export const COMMON_PIVOT_PRESETS: PresetFieldSize[] = [
  {
    name: 'محور 5 أبراج (صغير)',
    towers: 5,
    estimatedFeddans: '45 - 50 فدان',
    manufacturer: 'valley',
    spanLength: 47.9,
    overhang: 13.4,
    endGun: true,
  },
  {
    name: 'محور 7 أبراج (الأكثر طلباً)',
    towers: 7,
    estimatedFeddans: '85 - 95 فدان',
    manufacturer: 'valley',
    spanLength: 47.9,
    overhang: 13.4,
    endGun: true,
  },
  {
    name: 'محور 8 أبراج (متوسط)',
    towers: 8,
    estimatedFeddans: '110 - 125 فدان',
    manufacturer: 'zimmatic',
    spanLength: 44.5,
    overhang: 12.2,
    endGun: true,
  },
  {
    name: 'محور 9 أبراج (شائع)',
    towers: 9,
    estimatedFeddans: '140 - 155 فدان',
    manufacturer: 'valley',
    spanLength: 47.9,
    overhang: 13.4,
    endGun: true,
  },
  {
    name: 'محور 10 أبراج (كبير)',
    towers: 10,
    estimatedFeddans: '175 - 195 فدان',
    manufacturer: 'reinke',
    spanLength: 47.5,
    overhang: 11.6,
    endGun: true,
  },
  {
    name: 'محور 12 برج (عملاق)',
    towers: 12,
    estimatedFeddans: '250 - 275 فدان',
    manufacturer: 'bauer',
    spanLength: 50.0,
    overhang: 12.0,
    endGun: true,
  },
];

export const STANDARD_SPAN_PRESETS: StandardSpanPreset[] = [
  { id: '128ft', feet: 128, meters: 39.01, labelAr: '128 قدم (39.0 م)', manufacturerHint: 'قصير / زوايا وتضاريس' },
  { id: '135ft', feet: 135, meters: 41.15, labelAr: '135 قدم (41.2 م)', manufacturerHint: 'رينكي / زيماتيك متوسط' },
  { id: '148ft', feet: 148, meters: 45.11, labelAr: '148 قدم (45.1 م)', manufacturerHint: 'زيماتيك القياسي الشائع' },
  { id: '160ft', feet: 160, meters: 48.77, labelAr: '160 قدم (48.8 م)', manufacturerHint: 'فالي / الأكثر انتشاراً عالمياً', popular: true },
  { id: '175ft', feet: 175, meters: 53.34, labelAr: '175 قدم (53.3 م)', manufacturerHint: 'زيماتيك / رينكي ممتد' },
  { id: '185ft', feet: 185, meters: 56.39, labelAr: '185 قدم (56.4 م)', manufacturerHint: 'فالي طويل الأسبان' },
  { id: '205ft', feet: 205, meters: 62.48, labelAr: '205 قدم (62.5 م)', manufacturerHint: 'أسبان عملاق فائق الطول' },
];

export const SPACING_PRESETS: Record<SpacingPresetType, { id: SpacingPresetType; nameAr: string; inches: number; meters: number; descAr: string }> = {
  standard_108: {
    id: 'standard_108',
    nameAr: 'تباعد قياسي 108 بوصة (9 أقدام)',
    inches: 108,
    meters: 2.7432,
    descAr: 'المعيار العالمي السائد والأكثر استخداماً (فالي، زيماتيك، رينكي)',
  },
  dense_72: {
    id: 'dense_72',
    nameAr: 'تباعد مكثف 72 بوصة (6 أقدام)',
    inches: 72,
    meters: 1.8288,
    descAr: 'انتظام مائي فائق ومقاومة لسرعة الرياح في الترب الرملية',
  },
  dense_40: {
    id: 'dense_40',
    nameAr: 'تباعد مكثف جداً 40 بوصة (LEPA/LESA)',
    inches: 40,
    meters: 1.016,
    descAr: 'ري منخفض الطاقة عند مستوى سطح النبات',
  },
  custom: {
    id: 'custom',
    nameAr: 'مسافة تباعد مخصصة',
    inches: 108,
    meters: 2.7432,
    descAr: 'تحديد يدوي للمسافة بين مخارج الرشاشات على الأنبوب',
  },
};

export function calculatePivotSpanNozzles(
  config: PivotConfig,
  firstSprinklerDistM: number = 3.0
): PivotNozzleCalculationResult {
  const presetKey = config.spanSpacingPreset || 'standard_108';
  const spacingConfig = SPACING_PRESETS[presetKey] || SPACING_PRESETS.standard_108;
  const spacingMeters =
    presetKey === 'custom' && config.customSpanSpacingM && config.customSpanSpacingM > 0.3
      ? config.customSpanSpacingM
      : spacingConfig.meters;
  const spacingInches = Math.round((spacingMeters / 0.0254) * 10) / 10;

  // Calculate total pipe radius:
  let totalPipeRadius = 0;
  for (let i = 0; i < config.towerCount; i++) {
    totalPipeRadius += (config.spanLengths[i] ?? config.uniformSpanLength);
  }
  totalPipeRadius += (config.overhangLength || 0);

  const clampedFirst = Math.min(
    Math.max(firstSprinklerDistM || 1.5, 0.5),
    Math.max(totalPipeRadius - 2, 0.5)
  );

  const spansBreakdown: SpanNozzleBreakdown[] = [];
  let totalSpanNozzles = 0;
  let cumRadius = 0;

  for (let i = 0; i < config.towerCount; i++) {
    const spanLen = config.spanLengths[i] ?? config.uniformSpanLength;
    const lenFeet = Math.round(spanLen * 3.28084 * 10) / 10;
    const innerR = cumRadius;
    const outerR = innerR + spanLen;
    cumRadius = outerR;

    let nozzleCount: number;
    if (config.customSpanNozzleCounts && typeof config.customSpanNozzleCounts[i] === 'number') {
      nozzleCount = Math.max(0, config.customSpanNozzleCounts[i]);
    } else {
      if (outerR <= clampedFirst) {
        // Sprinklers have not started yet before this tower
        nozzleCount = 0;
      } else if (innerR < clampedFirst) {
        // First sprinkler starts inside this span
        const activeSpanLen = outerR - clampedFirst;
        nozzleCount = Math.max(1, Math.round(activeSpanLen / spacingMeters));
      } else {
        // Fully covered span
        nozzleCount = Math.max(1, Math.round(spanLen / spacingMeters));
      }
    }

    spansBreakdown.push({
      spanIndex: i,
      spanNumber: i + 1,
      lengthMeters: spanLen,
      lengthFeet: lenFeet,
      nozzleCount,
      isOverhang: false,
    });
    totalSpanNozzles += nozzleCount;
  }

  // Overhang calculation:
  const overhangM = config.overhangLength || 0;
  const overhangFeet = Math.round(overhangM * 3.28084 * 10) / 10;
  let overhangCount = 0;
  if (overhangM > 0) {
    if (
      config.customSpanNozzleCounts &&
      typeof config.customSpanNozzleCounts[config.towerCount] === 'number'
    ) {
      overhangCount = Math.max(0, config.customSpanNozzleCounts[config.towerCount]);
    } else {
      const innerR = cumRadius;
      const outerR = innerR + overhangM;
      if (outerR <= clampedFirst) {
        overhangCount = 0;
      } else if (innerR < clampedFirst) {
        const activeOverhang = outerR - clampedFirst;
        overhangCount = Math.max(1, Math.round(activeOverhang / spacingMeters));
      } else {
        overhangCount = Math.max(1, Math.round(overhangM / spacingMeters));
      }
    }
  }

  const overhangBreakdown: SpanNozzleBreakdown = {
    spanIndex: config.towerCount,
    spanNumber: config.towerCount + 1,
    lengthMeters: overhangM,
    lengthFeet: overhangFeet,
    nozzleCount: overhangCount,
    isOverhang: true,
  };

  const totalCalculatedNozzles = totalSpanNozzles + overhangCount;
  const fullSpans = spansBreakdown.filter((s) => s.nozzleCount > 0);
  const perSpanCount = fullSpans.length > 0 ? fullSpans[fullSpans.length - 1].nozzleCount : 18;

  return {
    spacingMeters,
    spacingInches,
    spacingPreset: presetKey,
    spansBreakdown,
    overhangBreakdown,
    totalCalculatedNozzles,
    perSpanCount,
  };
}

export const CROPS_INFO: Record<CropType, CropInfo> = {
  wheat: {
    id: 'wheat',
    nameAr: 'القمح (Wheat)',
    nameEn: 'Wheat',
    kcPeak: 1.05,
    recommendedTypicalMm: 6.5,
    typicalRangeMm: '5 - 8 مم/يوم',
    seasonAr: 'شتوي / ربيعي',
    descriptionAr: 'محصول شتوي رئيسي، يبلغ ذروة استهلاكه أثناء طرد السنابل وامتلاء الحبوب.',
  },
  corn: {
    id: 'corn',
    nameAr: 'الذرة الشامية (Corn / Maize)',
    nameEn: 'Maize / Corn',
    kcPeak: 1.15,
    recommendedTypicalMm: 8.5,
    typicalRangeMm: '7 - 10 مم/يوم',
    seasonAr: 'صيفي',
    descriptionAr: 'محصول صيفي عالي الإنتاجية، يرتفع الاحتياج في مرحلة التزهير (الشواشي والحرير وتكوين الكيزان).',
  },
  alfalfa: {
    id: 'alfalfa',
    nameAr: 'البرسيم الحجازي (Alfalfa)',
    nameEn: 'Alfalfa',
    kcPeak: 1.25,
    recommendedTypicalMm: 10.5,
    typicalRangeMm: '8 - 12 مم/يوم',
    seasonAr: 'دائم طوال العام',
    descriptionAr: 'محصول علفي معمر ذو مجموع خضري كثيف وبخر عالي جداً مع دورات حش مستمرة.',
  },
  potatoes: {
    id: 'potatoes',
    nameAr: 'البطاطس (Potatoes)',
    nameEn: 'Potatoes',
    kcPeak: 1.05,
    recommendedTypicalMm: 7.0,
    typicalRangeMm: '5 - 8.5 مم/يوم',
    seasonAr: 'خريفي / شتوي / صيفي مبكر',
    descriptionAr: 'جذور سطحية حساسة لنقص الرطوبة، تزداد الحساسية أثناء تكوين وامتلاء الدرنات.',
  },
  barley: {
    id: 'barley',
    nameAr: 'الشعير (Barley)',
    nameEn: 'Barley',
    kcPeak: 0.95,
    recommendedTypicalMm: 5.5,
    typicalRangeMm: '4 - 6.5 مم/يوم',
    seasonAr: 'شتوي',
    descriptionAr: 'أكثر تحملاً للجفاف والملوحة من القمح، واستهلاكه المائي معتدل.',
  },
  soybean: {
    id: 'soybean',
    nameAr: 'فول الصويا (Soybean)',
    nameEn: 'Soybean',
    kcPeak: 1.10,
    recommendedTypicalMm: 7.5,
    typicalRangeMm: '6 - 9 مم/يوم',
    seasonAr: 'صيفي',
    descriptionAr: 'محصول زيتي صيفي، يحتاج رطوبة منتظمة في مرحلتي الإزهار وعقد القرون.',
  },
  forage: {
    id: 'forage',
    nameAr: 'الأعلاف والرودس (Forage / Rhodes)',
    nameEn: 'Forage / Rhodes',
    kcPeak: 1.22,
    recommendedTypicalMm: 11.0,
    typicalRangeMm: '8 - 12.5 مم/يوم',
    seasonAr: 'صيفي حار',
    descriptionAr: 'أعلاف صيفية سريعة النمو والإنتاجية تحت الأجهزة المحورية بالبيئات الصحراوية.',
  },
  custom: {
    id: 'custom',
    nameAr: 'محصول مخصص / يدوي (Custom)',
    nameEn: 'Custom',
    kcPeak: 1.00,
    recommendedTypicalMm: 8.0,
    typicalRangeMm: '3 - 16 مم/يوم',
    seasonAr: 'حسب الموسم',
    descriptionAr: 'تحديد الاحتياج المائي بشكل حر بحسب توصيات المهندس الزراعي الحقلي.',
  },
};

export const CLIMATE_SEASONS_INFO: Record<ClimateSeasonType, ClimateSeasonInfo> = {
  summer_peak: {
    id: 'summer_peak',
    nameAr: 'ذروة الصيف الحار الجاف (Peak Summer)',
    nameEn: 'Peak Summer',
    baseEToMm: 8.5,
    descriptionAr: 'حرارة مرتفعة جداً وسماء صافية ورياح جافة (أعلى معدل بخر يومي).',
  },
  summer_mild: {
    id: 'summer_mild',
    nameAr: 'صيف معتدل / بداية الصيف (Mild Summer)',
    nameEn: 'Mild Summer',
    baseEToMm: 6.8,
    descriptionAr: 'حرارة صيفية متوسطة مع رطوبة عادية أو مناطق شبه ساحلية/مرتفعة.',
  },
  spring_autumn: {
    id: 'spring_autumn',
    nameAr: 'الربيع / الخريف (Spring / Autumn)',
    nameEn: 'Spring / Autumn',
    baseEToMm: 5.0,
    descriptionAr: 'طقس معتدل، إشعاع شمسي متوسط وانخفاض ملموس في البخر.',
  },
  winter: {
    id: 'winter',
    nameAr: 'فصل الشتاء (Winter)',
    nameEn: 'Winter',
    baseEToMm: 3.4,
    descriptionAr: 'طقس بارد ورطوبة جوية أعلى، أدنى استهلاك مائي للمحاصيل الشتوية.',
  },
  arid_desert: {
    id: 'arid_desert',
    nameAr: 'صحراوي شديد الحرارة ورياح (Arid Desert & Wind)',
    nameEn: 'Arid Desert',
    baseEToMm: 10.0,
    descriptionAr: 'بيئة صحراوية قاحلة شديدة البخر مع رياح جافة ومعدل نتح تبخري فائق.',
  },
};

export function calculateAgronomicDemand(
  cropType: CropType,
  climateSeason: ClimateSeasonType,
  temperatureC: number,
  feddanM2: number = 4200.83
): AgronomicResults {
  const crop = CROPS_INFO[cropType] || CROPS_INFO.wheat;
  const climate = CLIMATE_SEASONS_INFO[climateSeason] || CLIMATE_SEASONS_INFO.summer_peak;

  // Temperature variation factor around baseline 30°C:
  // Each degree above/below changes ETo by ~2.5%
  const tempDelta = (temperatureC ?? 32) - 30;
  const tempFactor = Math.max(0.60, Math.min(1.50, 1 + tempDelta * 0.025));

  const eto = climate.baseEToMm * tempFactor;
  const etc = eto * crop.kcPeak;

  // Modern center pivot irrigation application efficiency (approx 88%)
  const irrigationEfficiency = 0.88;
  const grossRecommended = Math.round((etc / irrigationEfficiency) * 10) / 10;
  const clampedRecommended = Math.max(3.0, Math.min(16.0, grossRecommended));

  // Daily volume per feddan: Depth(mm) * Feddan area(m2) / 1000 = m3/feddan/day
  const grossDailyVolumeM3PerFeddan = (clampedRecommended * feddanM2) / 1000;

  return {
    cropNameAr: crop.nameAr,
    climateNameAr: climate.nameAr,
    temperatureC,
    recommendedDepthMm: clampedRecommended,
    etoMm: Math.round(eto * 10) / 10,
    cropKc: crop.kcPeak,
    grossDailyVolumeM3PerFeddan: Math.round(grossDailyVolumeM3PerFeddan * 10) / 10,
    explanationAr: `المحصول: ${crop.nameAr} | المناخ: ${climate.nameAr} عند ${temperatureC}°م (بخر مرجعي ETo: ${Math.round(eto * 10) / 10} مم، معامل المحصول Kc: ${crop.kcPeak})`,
  };
}

export function getInitialConfig(): PivotConfig {
  const valleyPreset = MANUFACTURER_PRESETS.valley;
  const initialTowerCount = 7;
  const initialSpanLengths = Array(initialTowerCount).fill(valleyPreset.defaultSpan);

  return {
    manufacturer: 'valley',
    towerCount: initialTowerCount,
    spanLengths: initialSpanLengths,
    uniformSpanLength: valleyPreset.defaultSpan,
    isUniformSpan: true,
    overhangLength: valleyPreset.defaultOverhang,
    hasEndGun: true,
    endGunThrow: 20, // 20m throw radius
    feddanStandard: 'egyptian',
    // Agronomic defaults
    cropType: 'wheat',
    climateSeason: 'summer_mild',
    ambientTemperatureC: 32,
    // Hydraulic & Operational inputs
    targetWaterDepthMm: 8.0, // 8mm per day/pass
    inflowRateM3PerHour: 168.0, // default inflow ~168 m3/h
    hydraulicInputMode: 'depth',
    dailyOperatingHours: 20, // 20 hrs/day
    timerPercent: 50, // 50% speed for typical ~35-40h cycle
    desiredCycleHours: 36,
    lastTowerSpeedAt100: valleyPreset.typicalMaxSpeedMPerHr,
    spanSpacingPreset: 'standard_108',
    customSpanSpacingM: 2.7432,
  };
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatNumberEn(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function convertM2ToFeddanBreakdown(m2: number, standard: FeddanStandard) {
  const feddanM2 = FEDDAN_VALUES[standard].m2;
  const totalFeddans = m2 / feddanM2;
  
  const feddans = Math.floor(totalFeddans);
  const remainderFeddans = totalFeddans - feddans;
  
  const totalQirats = remainderFeddans * 24;
  const qirats = Math.floor(totalQirats);
  const remainderQirats = totalQirats - qirats;
  
  const totalSahms = remainderQirats * 24;
  const sahms = Math.round(totalSahms * 10) / 10;

  return {
    totalFeddans,
    feddans,
    qirats,
    sahms,
  };
}

export function calculatePivot(config: PivotConfig): PivotResults {
  const feddanM2 = FEDDAN_VALUES[config.feddanStandard].m2;

  // 1. Spans breakdown
  let cumulativeRadius = 0;
  const towerRings: TowerRingData[] = [];

  for (let i = 0; i < config.towerCount; i++) {
    const spanLen = config.spanLengths[i] ?? config.uniformSpanLength;
    const innerR = cumulativeRadius;
    const outerR = innerR + spanLen;
    cumulativeRadius = outerR;

    const ringArea = Math.PI * (Math.pow(outerR, 2) - Math.pow(innerR, 2));
    const ringFeddans = ringArea / feddanM2;
    const cumulativeArea = Math.PI * Math.pow(outerR, 2);
    const cumulativeFeddans = cumulativeArea / feddanM2;
    const outerCircumference = 2 * Math.PI * outerR;

    towerRings.push({
      towerIndex: i + 1,
      spanLength: spanLen,
      innerRadius: innerR,
      outerRadius: outerR,
      ringAreaM2: ringArea,
      ringFeddans,
      cumulativeFeddans,
      percentageOfTotal: 0, // calculated after total
      outerCircumferenceM: outerCircumference,
    });
  }

  const lastTowerRadius = cumulativeRadius;

  // 2. Overhang (الوصلة المعلقة)
  const overhangInnerR = cumulativeRadius;
  const overhangOuterR = overhangInnerR + config.overhangLength;
  cumulativeRadius = overhangOuterR;

  const overhangAreaM2 = Math.PI * (Math.pow(overhangOuterR, 2) - Math.pow(overhangInnerR, 2));
  const overhangFeddans = overhangAreaM2 / feddanM2;

  const pivotPipeRadius = overhangOuterR;
  const pipeAreaM2 = Math.PI * Math.pow(pivotPipeRadius, 2);

  // 3. End gun (مدفع النهاية)
  let endGunAreaM2 = 0;
  let endGunThrowRadius = 0;
  if (config.hasEndGun && config.endGunThrow > 0) {
    endGunThrowRadius = config.endGunThrow;
    const endGunOuterR = pivotPipeRadius + endGunThrowRadius;
    endGunAreaM2 = Math.PI * (Math.pow(endGunOuterR, 2) - Math.pow(pivotPipeRadius, 2));
    cumulativeRadius = endGunOuterR;
  }

  const totalWettedRadius = cumulativeRadius;
  const totalAreaM2 = pipeAreaM2 + endGunAreaM2;
  const totalFeddans = totalAreaM2 / feddanM2;
  const totalHectares = totalAreaM2 / 10000;

  // Calculate percentages
  for (const ring of towerRings) {
    ring.percentageOfTotal = totalAreaM2 > 0 ? (ring.ringAreaM2 / totalAreaM2) * 100 : 0;
  }

  const overhangRing = {
    name: 'الكابولي (الوصلة المعلقة)',
    innerRadius: overhangInnerR,
    outerRadius: overhangOuterR,
    ringAreaM2: overhangAreaM2,
    ringFeddans: overhangFeddans,
    percentageOfTotal: totalAreaM2 > 0 ? (overhangAreaM2 / totalAreaM2) * 100 : 0,
  };

  const endGunRing = config.hasEndGun && endGunAreaM2 > 0 ? {
    name: 'نطاق مدفع النهاية (End Gun)',
    innerRadius: pivotPipeRadius,
    outerRadius: totalWettedRadius,
    ringAreaM2: endGunAreaM2,
    ringFeddans: endGunAreaM2 / feddanM2,
    percentageOfTotal: totalAreaM2 > 0 ? (endGunAreaM2 / totalAreaM2) * 100 : 0,
  } : undefined;

  const breakdown = convertM2ToFeddanBreakdown(totalAreaM2, config.feddanStandard);

  // 4. Hydraulic computations
  const effectiveHours = Math.max(config.dailyOperatingHours, 1);
  let effectiveInflowM3PerHour = config.inflowRateM3PerHour;
  let effectiveDailyDepthMm = config.targetWaterDepthMm;

  if (config.hydraulicInputMode === 'flow' && effectiveInflowM3PerHour && effectiveInflowM3PerHour > 0) {
    const dailyVolume = effectiveInflowM3PerHour * effectiveHours;
    effectiveDailyDepthMm = totalAreaM2 > 0 ? (dailyVolume * 1000) / totalAreaM2 : effectiveDailyDepthMm;
  } else {
    const dailyVolume = (totalAreaM2 * effectiveDailyDepthMm) / 1000;
    effectiveInflowM3PerHour = dailyVolume / effectiveHours;
  }

  const waterVolumeM3PerDay = effectiveInflowM3PerHour * effectiveHours;
  const requiredFlowM3PerHour = effectiveInflowM3PerHour;
  const requiredFlowLitersPerSec = (requiredFlowM3PerHour * 1000) / 3600;
  // 1 m3/h = 4.40286756 gpm
  const requiredFlowGpm = requiredFlowM3PerHour * 4.40286756;

  // 5. Operational computations
  // Wheel track of last tower:
  const lastTowerCircumferenceM = 2 * Math.PI * lastTowerRadius;
  const maxSpeed = Math.max(config.lastTowerSpeedAt100, 10);
  const timerFactor = Math.max(config.timerPercent, 5) / 100;
  const lastTowerSpeedActualMPerHr = maxSpeed * timerFactor;

  const rotationHoursAt100 = lastTowerCircumferenceM / maxSpeed;
  const actualRotationHours = lastTowerCircumferenceM / lastTowerSpeedActualMPerHr;
  const actualRotationDays = actualRotationHours / 24;
  const calendarDaysWithPumpHours = actualRotationHours / effectiveHours;

  // Depth applied in single pass: (Flow m3/h * Rotation hours * 1000) / Total Area m2
  const appliedDepthMmPerPass = totalAreaM2 > 0 
    ? (requiredFlowM3PerHour * actualRotationHours * 1000) / totalAreaM2
    : 0;

  // 6. Agronomic crop & climate demand
  const cropType = config.cropType || 'wheat';
  const climateSeason = config.climateSeason || 'summer_mild';
  const ambientTemperatureC = config.ambientTemperatureC ?? 32;
  const agronomic = calculateAgronomicDemand(cropType, climateSeason, ambientTemperatureC, feddanM2);

  return {
    pivotPipeRadius,
    totalWettedRadius,
    pipeAreaM2,
    endGunAreaM2,
    totalAreaM2,
    totalFeddans,
    feddanBreakdown: {
      feddans: breakdown.feddans,
      qirats: breakdown.qirats,
      sahms: breakdown.sahms,
    },
    totalHectares,
    totalSquareMeters: totalAreaM2,
    towerRings,
    overhangRing,
    endGunRing,
    hydraulic: {
      requiredFlowM3PerHour,
      requiredFlowLitersPerSec,
      requiredFlowGpm,
      waterVolumeM3PerDay,
    },
    operational: {
      rotationHoursAt100,
      actualRotationHours,
      actualRotationDays,
      calendarDaysWithPumpHours,
      lastTowerSpeedActualMPerHr,
      lastTowerCircumferenceM,
      appliedDepthMmPerPass,
    },
    agronomic,
  };
}

// -------------------------------------------------------------------------
// Nozzle Package & Sprinkler Programming Engine
// -------------------------------------------------------------------------

export const NOZZLE_COLOR_MAP: Record<number, string> = {
  4: 'أزرق فاتح (Light Blue)',
  5: 'بيج رملي (Beige)',
  6: 'ذهبي (Gold)',
  7: 'أخضر ليموني (Lime)',
  8: 'لافندر / أرجواني فاتح (Lavender)',
  9: 'رمادي (Grey)',
  10: 'فيروزي (Turquoise)',
  11: 'أصفر (Yellow)',
  12: 'أحمر (Red)',
  13: 'أبيض (White)',
  14: 'أزرق (Blue)',
  15: 'بني داكن (Dark Brown)',
  16: 'برتقالي (Orange)',
  17: 'أخضر داكن (Dark Green)',
  18: 'بنفسجي / أرجواني (Purple)',
  19: 'أسود (Black)',
  20: 'فيروزي داكن (Dark Turquoise)',
  21: 'أصفر خردلي (Mustard)',
  22: 'مارون / عنابي (Maroon)',
  23: 'كريمي (Cream)',
  24: 'أزرق داكن / كحلي (Dark Blue)',
  25: 'نحاسي (Copper)',
  26: 'برونزي (Bronze)',
};

export interface Up3ColorItem {
  number: number;
  nameAr: string;
  nameEn: string;
  hex: string;
  orificeInches: string;
  orificeMm: number;
}

export const SENNINGER_UP3_COLOR_MAP: Record<number, Up3ColorItem> = {
  4: { number: 4, nameAr: 'أزرق فاتح', nameEn: 'Light Blue', hex: '#38bdf8', orificeInches: '1/16"', orificeMm: 1.59 },
  5: { number: 5, nameAr: 'بيج رملي', nameEn: 'Beige', hex: '#d4b996', orificeInches: '5/64"', orificeMm: 1.98 },
  6: { number: 6, nameAr: 'ذهبي', nameEn: 'Gold', hex: '#eab308', orificeInches: '3/32"', orificeMm: 2.38 },
  7: { number: 7, nameAr: 'أخضر ليموني', nameEn: 'Lime', hex: '#84cc16', orificeInches: '7/64"', orificeMm: 2.78 },
  8: { number: 8, nameAr: 'لافندر', nameEn: 'Lavender', hex: '#c084fc', orificeInches: '1/8"', orificeMm: 3.18 },
  9: { number: 9, nameAr: 'رمادي', nameEn: 'Grey', hex: '#94a3b8', orificeInches: '9/64"', orificeMm: 3.57 },
  10: { number: 10, nameAr: 'فيروزي', nameEn: 'Turquoise', hex: '#06b6d4', orificeInches: '5/32"', orificeMm: 3.97 },
  11: { number: 11, nameAr: 'أصفر', nameEn: 'Yellow', hex: '#facc15', orificeInches: '11/64"', orificeMm: 4.37 },
  12: { number: 12, nameAr: 'أحمر', nameEn: 'Red', hex: '#dc2626', orificeInches: '3/16"', orificeMm: 4.76 },
  13: { number: 13, nameAr: 'أبيض', nameEn: 'White', hex: '#f8fafc', orificeInches: '13/64"', orificeMm: 5.16 },
  14: { number: 14, nameAr: 'أزرق', nameEn: 'Blue', hex: '#2563eb', orificeInches: '7/32"', orificeMm: 5.56 },
  15: { number: 15, nameAr: 'بني داكن', nameEn: 'Dark Brown', hex: '#78350f', orificeInches: '15/64"', orificeMm: 5.95 },
  16: { number: 16, nameAr: 'برتقالي', nameEn: 'Orange', hex: '#ea580c', orificeInches: '1/4"', orificeMm: 6.35 },
  17: { number: 17, nameAr: 'أخضر داكن', nameEn: 'Dark Green', hex: '#15803d', orificeInches: '17/64"', orificeMm: 6.75 },
  18: { number: 18, nameAr: 'بنفسجي', nameEn: 'Purple', hex: '#7e22ce', orificeInches: '9/32"', orificeMm: 7.14 },
  19: { number: 19, nameAr: 'أسود', nameEn: 'Black', hex: '#18181b', orificeInches: '19/64"', orificeMm: 7.54 },
  20: { number: 20, nameAr: 'فيروزي داكن', nameEn: 'Dark Turquoise', hex: '#0e7490', orificeInches: '5/16"', orificeMm: 7.94 },
  21: { number: 21, nameAr: 'أصفر خردلي', nameEn: 'Mustard', hex: '#ca8a04', orificeInches: '21/64"', orificeMm: 8.33 },
  22: { number: 22, nameAr: 'مارون / عنابي', nameEn: 'Maroon', hex: '#881337', orificeInches: '11/32"', orificeMm: 8.73 },
  23: { number: 23, nameAr: 'كريمي', nameEn: 'Cream', hex: '#fef08a', orificeInches: '23/64"', orificeMm: 9.13 },
  24: { number: 24, nameAr: 'أزرق داكن', nameEn: 'Dark Blue', hex: '#1e3a8a', orificeInches: '3/8"', orificeMm: 9.53 },
  25: { number: 25, nameAr: 'نحاسي', nameEn: 'Copper', hex: '#b45309', orificeInches: '25/64"', orificeMm: 9.92 },
  26: { number: 26, nameAr: 'برونزي', nameEn: 'Bronze', hex: '#92400e', orificeInches: '13/32"', orificeMm: 10.32 },
};

export interface Nelson3TnColorItem {
  number: number;
  nameAr: string;
  nameEn: string;
  baseNameAr: string;
  baseNameEn: string;
  hex: string;
  isDualColor: boolean;
  stripeNameAr?: string;
  stripeNameEn?: string;
  stripeHex?: string;
}

export const NELSON_3TN_COLOR_MAP: Record<number, Nelson3TnColorItem> = {
  6: {
    number: 6,
    nameAr: 'زيتوني',
    nameEn: 'Olive',
    baseNameAr: 'زيتوني',
    baseNameEn: 'Olive',
    hex: '#556b2f',
    isDualColor: false,
  },
  7: {
    number: 7,
    nameAr: 'زيتوني (شريط أزرق فاتح)',
    nameEn: 'Olive w/ Light Blue',
    baseNameAr: 'زيتوني',
    baseNameEn: 'Olive',
    hex: '#556b2f',
    isDualColor: true,
    stripeNameAr: 'أزرق فاتح',
    stripeNameEn: 'Light Blue',
    stripeHex: '#38bdf8',
  },
  8: {
    number: 8,
    nameAr: 'أزرق فاتح (سماوي)',
    nameEn: 'Light Blue',
    baseNameAr: 'أزرق فاتح',
    baseNameEn: 'Light Blue',
    hex: '#38bdf8',
    isDualColor: false,
  },
  9: {
    number: 9,
    nameAr: 'أزرق فاتح (شريط بيج)',
    nameEn: 'Light Blue w/ Beige',
    baseNameAr: 'أزرق فاتح',
    baseNameEn: 'Light Blue',
    hex: '#38bdf8',
    isDualColor: true,
    stripeNameAr: 'بيج',
    stripeNameEn: 'Beige',
    stripeHex: '#d4b996',
  },
  10: {
    number: 10,
    nameAr: 'بيج',
    nameEn: 'Beige',
    baseNameAr: 'بيج',
    baseNameEn: 'Beige',
    hex: '#d4b996',
    isDualColor: false,
  },
  11: {
    number: 11,
    nameAr: 'بيج (شريط ذهبي)',
    nameEn: 'Beige w/ Gold',
    baseNameAr: 'بيج',
    baseNameEn: 'Beige',
    hex: '#d4b996',
    isDualColor: true,
    stripeNameAr: 'ذهبي',
    stripeNameEn: 'Gold',
    stripeHex: '#eab308',
  },
  12: {
    number: 12,
    nameAr: 'ذهبي',
    nameEn: 'Gold',
    baseNameAr: 'ذهبي',
    baseNameEn: 'Gold',
    hex: '#eab308',
    isDualColor: false,
  },
  13: {
    number: 13,
    nameAr: 'ذهبي (شريط أخضر ليموني)',
    nameEn: 'Gold w/ Lime',
    baseNameAr: 'ذهبي',
    baseNameEn: 'Gold',
    hex: '#eab308',
    isDualColor: true,
    stripeNameAr: 'أخضر ليموني',
    stripeNameEn: 'Lime',
    stripeHex: '#84cc16',
  },
  14: {
    number: 14,
    nameAr: 'أخضر ليموني',
    nameEn: 'Lime',
    baseNameAr: 'أخضر ليموني',
    baseNameEn: 'Lime',
    hex: '#84cc16',
    isDualColor: false,
  },
  15: {
    number: 15,
    nameAr: 'أخضر ليموني (شريط لافندر)',
    nameEn: 'Lime w/ Lavender',
    baseNameAr: 'أخضر ليموني',
    baseNameEn: 'Lime',
    hex: '#84cc16',
    isDualColor: true,
    stripeNameAr: 'لافندر',
    stripeNameEn: 'Lavender',
    stripeHex: '#c084fc',
  },
  16: {
    number: 16,
    nameAr: 'لافندر (بنفسجي فاتح)',
    nameEn: 'Lavender',
    baseNameAr: 'لافندر',
    baseNameEn: 'Lavender',
    hex: '#c084fc',
    isDualColor: false,
  },
  17: {
    number: 17,
    nameAr: 'لافندر (شريط رمادي)',
    nameEn: 'Lavender w/ Gray',
    baseNameAr: 'لافندر',
    baseNameEn: 'Lavender',
    hex: '#c084fc',
    isDualColor: true,
    stripeNameAr: 'رمادي',
    stripeNameEn: 'Gray',
    stripeHex: '#94a3b8',
  },
  18: {
    number: 18,
    nameAr: 'رمادي',
    nameEn: 'Gray',
    baseNameAr: 'رمادي',
    baseNameEn: 'Gray',
    hex: '#94a3b8',
    isDualColor: false,
  },
  19: {
    number: 19,
    nameAr: 'رمادي (شريط فيروزي)',
    nameEn: 'Gray w/ Turquoise',
    baseNameAr: 'رمادي',
    baseNameEn: 'Gray',
    hex: '#94a3b8',
    isDualColor: true,
    stripeNameAr: 'فيروزي',
    stripeNameEn: 'Turquoise',
    stripeHex: '#06b6d4',
  },
  20: {
    number: 20,
    nameAr: 'فيروزي',
    nameEn: 'Turquoise',
    baseNameAr: 'فيروزي',
    baseNameEn: 'Turquoise',
    hex: '#06b6d4',
    isDualColor: false,
  },
  21: {
    number: 21,
    nameAr: 'فيروزي (شريط أصفر)',
    nameEn: 'Turquoise w/ Yellow',
    baseNameAr: 'فيروزي',
    baseNameEn: 'Turquoise',
    hex: '#06b6d4',
    isDualColor: true,
    stripeNameAr: 'أصفر',
    stripeNameEn: 'Yellow',
    stripeHex: '#facc15',
  },
  22: {
    number: 22,
    nameAr: 'أصفر',
    nameEn: 'Yellow',
    baseNameAr: 'أصفر',
    baseNameEn: 'Yellow',
    hex: '#facc15',
    isDualColor: false,
  },
  23: {
    number: 23,
    nameAr: 'أصفر (شريط أحمر)',
    nameEn: 'Yellow w/ Red',
    baseNameAr: 'أصفر',
    baseNameEn: 'Yellow',
    hex: '#facc15',
    isDualColor: true,
    stripeNameAr: 'أحمر',
    stripeNameEn: 'Red',
    stripeHex: '#dc2626',
  },
  24: {
    number: 24,
    nameAr: 'أحمر',
    nameEn: 'Red',
    baseNameAr: 'أحمر',
    baseNameEn: 'Red',
    hex: '#dc2626',
    isDualColor: false,
  },
  25: {
    number: 25,
    nameAr: 'أحمر (شريط أبيض)',
    nameEn: 'Red w/ White',
    baseNameAr: 'أحمر',
    baseNameEn: 'Red',
    hex: '#dc2626',
    isDualColor: true,
    stripeNameAr: 'أبيض',
    stripeNameEn: 'White',
    stripeHex: '#f8fafc',
  },
  26: {
    number: 26,
    nameAr: 'أبيض',
    nameEn: 'White',
    baseNameAr: 'أبيض',
    baseNameEn: 'White',
    hex: '#f8fafc',
    isDualColor: false,
  },
  27: {
    number: 27,
    nameAr: 'أبيض (شريط أزرق)',
    nameEn: 'White w/ Blue',
    baseNameAr: 'أبيض',
    baseNameEn: 'White',
    hex: '#f8fafc',
    isDualColor: true,
    stripeNameAr: 'أزرق',
    stripeNameEn: 'Blue',
    stripeHex: '#2563eb',
  },
  28: {
    number: 28,
    nameAr: 'أزرق',
    nameEn: 'Blue',
    baseNameAr: 'أزرق',
    baseNameEn: 'Blue',
    hex: '#2563eb',
    isDualColor: false,
  },
  29: {
    number: 29,
    nameAr: 'أزرق (شريط بني داكن)',
    nameEn: 'Blue w/ Dark Brown',
    baseNameAr: 'أزرق',
    baseNameEn: 'Blue',
    hex: '#2563eb',
    isDualColor: true,
    stripeNameAr: 'بني داكن',
    stripeNameEn: 'Dark Brown',
    stripeHex: '#451a03',
  },
  30: {
    number: 30,
    nameAr: 'بني داكن',
    nameEn: 'Dark Brown',
    baseNameAr: 'بني داكن',
    baseNameEn: 'Dark Brown',
    hex: '#451a03',
    isDualColor: false,
  },
  31: {
    number: 31,
    nameAr: 'بني داكن (شريط برتقالي)',
    nameEn: 'Dark Brown w/ Orange',
    baseNameAr: 'بني داكن',
    baseNameEn: 'Dark Brown',
    hex: '#451a03',
    isDualColor: true,
    stripeNameAr: 'برتقالي',
    stripeNameEn: 'Orange',
    stripeHex: '#ea580c',
  },
  32: {
    number: 32,
    nameAr: 'برتقالي',
    nameEn: 'Orange',
    baseNameAr: 'برتقالي',
    baseNameEn: 'Orange',
    hex: '#ea580c',
    isDualColor: false,
  },
  33: {
    number: 33,
    nameAr: 'برتقالي (شريط أخضر داكن)',
    nameEn: 'Orange w/ Dark Green',
    baseNameAr: 'برتقالي',
    baseNameEn: 'Orange',
    hex: '#ea580c',
    isDualColor: true,
    stripeNameAr: 'أخضر داكن',
    stripeNameEn: 'Dark Green',
    stripeHex: '#14532d',
  },
  34: {
    number: 34,
    nameAr: 'أخضر داكن',
    nameEn: 'Dark Green',
    baseNameAr: 'أخضر داكن',
    baseNameEn: 'Dark Green',
    hex: '#14532d',
    isDualColor: false,
  },
  35: {
    number: 35,
    nameAr: 'أخضر داكن (شريط أرجواني)',
    nameEn: 'Dark Green w/ Purple',
    baseNameAr: 'أخضر داكن',
    baseNameEn: 'Dark Green',
    hex: '#14532d',
    isDualColor: true,
    stripeNameAr: 'أرجواني',
    stripeNameEn: 'Purple',
    stripeHex: '#7e22ce',
  },
  36: {
    number: 36,
    nameAr: 'أرجواني (بنفسجي)',
    nameEn: 'Purple',
    baseNameAr: 'أرجواني',
    baseNameEn: 'Purple',
    hex: '#7e22ce',
    isDualColor: false,
  },
  37: {
    number: 37,
    nameAr: 'أرجواني (شريط أسود)',
    nameEn: 'Purple w/ Black',
    baseNameAr: 'أرجواني',
    baseNameEn: 'Purple',
    hex: '#7e22ce',
    isDualColor: true,
    stripeNameAr: 'أسود',
    stripeNameEn: 'Black',
    stripeHex: '#18181b',
  },
  38: {
    number: 38,
    nameAr: 'أسود',
    nameEn: 'Black',
    baseNameAr: 'أسود',
    baseNameEn: 'Black',
    hex: '#18181b',
    isDualColor: false,
  },
  39: {
    number: 39,
    nameAr: 'أسود (شريط فيروزي داكن)',
    nameEn: 'Black w/ Dark Turquoise',
    baseNameAr: 'أسود',
    baseNameEn: 'Black',
    hex: '#18181b',
    isDualColor: true,
    stripeNameAr: 'فيروزي داكن',
    stripeNameEn: 'Dark Turquoise',
    stripeHex: '#0e7490',
  },
  40: {
    number: 40,
    nameAr: 'فيروزي داكن',
    nameEn: 'Dark Turquoise',
    baseNameAr: 'فيروزي داكن',
    baseNameEn: 'Dark Turquoise',
    hex: '#0e7490',
    isDualColor: false,
  },
  41: {
    number: 41,
    nameAr: 'فيروزي داكن (شريط خردلي)',
    nameEn: 'Dark Turquoise w/ Mustard',
    baseNameAr: 'فيروزي داكن',
    baseNameEn: 'Dark Turquoise',
    hex: '#0e7490',
    isDualColor: true,
    stripeNameAr: 'خردلي',
    stripeNameEn: 'Mustard',
    stripeHex: '#ca8a04',
  },
  42: {
    number: 42,
    nameAr: 'خردلي',
    nameEn: 'Mustard',
    baseNameAr: 'خردلي',
    baseNameEn: 'Mustard',
    hex: '#ca8a04',
    isDualColor: false,
  },
  43: {
    number: 43,
    nameAr: 'خردلي (شريط مارون)',
    nameEn: 'Mustard w/ Maroon',
    baseNameAr: 'خردلي',
    baseNameEn: 'Mustard',
    hex: '#ca8a04',
    isDualColor: true,
    stripeNameAr: 'مارون',
    stripeNameEn: 'Maroon',
    stripeHex: '#831843',
  },
  44: {
    number: 44,
    nameAr: 'مارون (عنابي)',
    nameEn: 'Maroon',
    baseNameAr: 'مارون',
    baseNameEn: 'Maroon',
    hex: '#831843',
    isDualColor: false,
  },
  45: {
    number: 45,
    nameAr: 'مارون (شريط كريمي)',
    nameEn: 'Maroon w/ Cream',
    baseNameAr: 'مارون',
    baseNameEn: 'Maroon',
    hex: '#831843',
    isDualColor: true,
    stripeNameAr: 'كريمي',
    stripeNameEn: 'Cream',
    stripeHex: '#fef08a',
  },
  46: {
    number: 46,
    nameAr: 'كريمي',
    nameEn: 'Cream',
    baseNameAr: 'كريمي',
    baseNameEn: 'Cream',
    hex: '#fef08a',
    isDualColor: false,
  },
  47: {
    number: 47,
    nameAr: 'كريمي (شريط كحلي داكن)',
    nameEn: 'Cream w/ Dark Blue',
    baseNameAr: 'كريمي',
    baseNameEn: 'Cream',
    hex: '#fef08a',
    isDualColor: true,
    stripeNameAr: 'كحلي داكن',
    stripeNameEn: 'Dark Blue',
    stripeHex: '#1e3a8a',
  },
  48: {
    number: 48,
    nameAr: 'كحلي داكن',
    nameEn: 'Dark Blue',
    baseNameAr: 'كحلي داكن',
    baseNameEn: 'Dark Blue',
    hex: '#1e3a8a',
    isDualColor: false,
  },
  49: {
    number: 49,
    nameAr: 'كحلي داكن (شريط نحاسي)',
    nameEn: 'Dark Blue w/ Copper',
    baseNameAr: 'كحلي داكن',
    baseNameEn: 'Dark Blue',
    hex: '#1e3a8a',
    isDualColor: true,
    stripeNameAr: 'نحاسي',
    stripeNameEn: 'Copper',
    stripeHex: '#b45309',
  },
  50: {
    number: 50,
    nameAr: 'نحاسي',
    nameEn: 'Copper',
    baseNameAr: 'نحاسي',
    baseNameEn: 'Copper',
    hex: '#b45309',
    isDualColor: false,
  },
};

export const NELSON_D3000_PLATES_INFO = {
  green_spray: {
    id: 'green_spray',
    nameAr: 'الطبق الأخضر القلاب (Green Flip Plate)',
    subtitle: 'Fine / Medium Spray',
    colorHex: '#22c55e',
    wettedDiameterM: '8.5 - 10.5 م',
    description: 'توزيع رذاذ ناعم إلى متوسط، ممتاز للتربة الخفيفة والإنبات لمنع دمك التربة.',
    recommendedPressurePsi: '10 - 15 PSI',
  },
  blue_wind: {
    id: 'blue_wind',
    nameAr: 'الطبق الأزرق القلاب (Blue Flip Plate)',
    subtitle: 'Deep Groove Wind-Fighter',
    colorHex: '#3b82f6',
    wettedDiameterM: '9.0 - 11.5 م',
    description: 'أخاديد عميقة تُخرج قطرات ماء مركزة لمقاومة الرياح الصحراوية والتبخر الشديد.',
    recommendedPressurePsi: '10 - 20 PSI',
  },
  orange_wide: {
    id: 'orange_wide',
    nameAr: 'الطبق البرتقالي القلاب (Orange Flip Plate)',
    subtitle: 'Maximum Throw / Wide Coverage',
    colorHex: '#f97316',
    wettedDiameterM: '10.0 - 12.5 م',
    description: 'أقصى قطر لدائرة الرش وتغطية مائية واسعة تزيد من معدل التداخل بين البخاخات.',
    recommendedPressurePsi: '15 - 20 PSI',
  },
  yellow_lepa: {
    id: 'yellow_lepa',
    nameAr: 'الطبق الأصفر القلاب (Yellow Flip Plate)',
    subtitle: 'LEPA Hose Bubbler',
    colorHex: '#eab308',
    wettedDiameterM: '1.5 - 3.0 م',
    description: 'تقنية الري المباشر المنخفض الطاقة (LEPA) بنظام الفقاعات عند مستوى المحصول.',
    recommendedPressurePsi: '6 - 10 PSI',
  },
};

export const NELSON_ORBITOR_HILAL_INFO = {
  modelNameAr: 'بخاخ الهلال - نيلسون أوربيتر (Nelson Orbitor O3000)',
  modelNameEn: 'Nelson Orbitor O3000 / Crescent Strutless Sprinkler',
  designAr: 'تصميم مقوس فريد بدون أذرع خارجية (Strutless C-Bracket) يشبه الهلال، يمر الماء دون اعتراض أو تفتت غير مرغوب، ويمنع تراكم الشوائب.',
  motionAr: 'حركة مدارية اهتزازية متوازنة (Orbital Action) توفر قطرات متجانسة جداً ومقاومة فائقة للرياح الصحراوية والتبخر.',
  nozzleSystem: 'فوهات 3TN القياسية سريعة الفك والتركيب (Fast-Change 3TN System)',
  recommendedPressurePsi: '10 - 15 - 20 PSI',
  plates: [
    {
      id: 'orbitor_blue_standard',
      nameAr: 'طبق الهلال الأزرق (Blue Standard)',
      desc: 'تدفق قياسي 9 مجاري مائية لمقاومة الرياح وتغطية عريضة',
      colorHex: '#3b82f6',
      throwM: '12.0 - 14.5 م',
    },
    {
      id: 'orbitor_black_low_angle',
      nameAr: 'طبق الهلال الأسود (Black Low Drift)',
      desc: 'زاوية رذاذ منخفضة لتقليل التبخر والانجراف في المناطق شديدة الرياح',
      colorHex: '#0f172a',
      throwM: '10.0 - 12.5 م',
    },
    {
      id: 'orbitor_purple_multi',
      nameAr: 'طبق الهلال البنفسجي (Purple Multi-Stream)',
      desc: 'توزيع رذاذ ناعم ومتجانس لحماية البذور والمحاصيل الحساسة',
      colorHex: '#9333ea',
      throwM: '11.0 - 13.5 م',
    },
    {
      id: 'orbitor_part_circle',
      nameAr: 'هلال نصفي لحماية الأبراج (PC-Orbitor 180°)',
      desc: 'رش نصف دائري 180 درجة بعيداً عن مسار عجلات البرج لمنع التغريز وحماية القوائم',
      colorHex: '#f59e0b',
      throwM: '9.5 - 12.0 م',
    },
  ],
};

export const HUNTER_SUPER_SPRAY_INFO = {
  modelNameAr: 'بخاخ سوبر سبراي - هنتر / سيننجر (Hunter Super Spray® UP3)',
  modelNameEn: 'Hunter Super Spray® (Senninger / Hunter Industries)',
  officialUrl: 'https://www.hunterirrigation.com/irrigation-product/spray-nozzles/super-sprayr',
  designAr: 'تقنية رشاشات ثابتة ذات كفاءة استثنائية مع 22 صفيحة توجيه (Deflector Pads) قابلة للتبديل، وضغط تشغيل فائق الانخفاض يبدأ من 6 إلى 20 PSI لتوفير الطاقة وتقليل تكلفة الضخ بنظام فوهات UP3 العالمية.',
  motionAr: 'رش رذاذي ثابت متعدد التشكيل (Multi-Trajectory Spray Pattern) بقطرات مائية دقيقة ومقاومة للرياح والانجراف.',
  nozzleSystem: 'فوهات UP3® العالمية الملونة (المقاسات من #4 إلى #26 بمضاعفات 1/64 بوصة)',
  recommendedPressurePsi: '6 - 10 - 15 - 20 PSI (0.41 - 1.38 bar)',
  flowRangeGpm: '0.27 - 29.96 GPM (60 - 6800 L/hr)',
  pads: [
    {
      id: 'flat_medium',
      nameAr: 'طبق مسطح بأخاديد متوسطة (أسود · Flat)',
      subtitle: 'Flat Medium Groove Pad (Black)',
      desc: 'لون الصفيحة المعتمد: أسود (Black). زاوية انطلاق 0° مع أخاديد متوسطة لمقاومة الرياح وتوزيع منتظم.',
      colorHex: '#0f172a',
      padColorNameAr: 'أسود (Black)',
      throwM: '9.0 - 11.0 م',
      recommendedPressure: '10 - 15 PSI',
      grooves: 'متوسطة (Medium)',
      surface: 'مسطح (Flat)',
    },
    {
      id: 'flat_deep',
      nameAr: 'طبق مسطح بأخاديد عميقة (أسود · Flat Deep)',
      subtitle: 'Flat Deep Groove Wind Fighter (Black)',
      desc: 'لون الصفيحة المعتمد: أسود (Black). أخاديد عميقة تُنتج قطرات ماء مركزة وثقيلة لمقاومة الرياح الشديدة والتبخر.',
      colorHex: '#18181b',
      padColorNameAr: 'أسود (Black)',
      throwM: '9.5 - 11.5 م',
      recommendedPressure: '10 - 20 PSI',
      grooves: 'عميقة (Deep)',
      surface: 'مسطح (Flat)',
    },
    {
      id: 'concave_medium',
      nameAr: 'طبق مقعر لمدى تغطية أوسع (أزرق · Concave)',
      subtitle: 'Concave Medium Groove (Blue)',
      desc: 'لون الصفيحة المعتمد: أزرق (Blue). تصميم مقعر يوجه الرذاذ بزاوية تصاعدية لزيادة قطر دائرة التبلل.',
      colorHex: '#2563eb',
      padColorNameAr: 'أزرق (Blue)',
      throwM: '11.0 - 13.5 م',
      recommendedPressure: '15 - 20 PSI',
      grooves: 'متوسطة (Medium)',
      surface: 'مقعر (Concave)',
    },
    {
      id: 'convex_low_drift',
      nameAr: 'طبق محدب للرياح وتخفيف الانجراف (أخضر · Convex)',
      subtitle: 'Convex Downward Angle (Green)',
      desc: 'لون الصفيحة المعتمد: أخضر (Green). زاوية انحدار سفلية توجّه الرذاذ مباشرة للأسفل لتقليل الانجراف الهوائي.',
      colorHex: '#16a34a',
      padColorNameAr: 'أخضر (Green)',
      throwM: '8.5 - 10.5 م',
      recommendedPressure: '6 - 15 PSI',
      grooves: 'متوسطة (Medium)',
      surface: 'محدب (Convex)',
    },
    {
      id: 'smooth_spray',
      nameAr: 'طبق مسطح ناعم للإنبات (أسود أملس · Smooth)',
      subtitle: 'Flat Smooth Soft Mist (Black)',
      desc: 'لون الصفيحة المعتمد: أسود (Black). رذاذ فائق النعومة مخصص لحماية البذور في طور الإنبات ومنع دمك التربة.',
      colorHex: '#334155',
      padColorNameAr: 'أسود (Black)',
      throwM: '7.5 - 9.5 م',
      recommendedPressure: '6 - 10 PSI',
      grooves: 'ناعمة ملساء (Smooth)',
      surface: 'مسطح ناعم',
    },
    {
      id: 'chemigation_corn',
      nameAr: 'صفيحة التسميد والمكافحة (برتقالي · Chemigation)',
      subtitle: 'Corn & Cotton Chemigation (Orange)',
      desc: 'لون الصفيحة المعتمد: برتقالي (Orange). صفيحة مخصصة لرش الأسمدة والمبيدات تصاعدياً تحت مظلة المحصول.',
      colorHex: '#ea580c',
      padColorNameAr: 'برتقالي (Orange)',
      throwM: '8.0 - 10.0 م',
      recommendedPressure: '10 - 15 PSI',
      grooves: 'مخصصة للتسميد',
      surface: 'صفيحة تسميد',
    },
  ],
};

export function getNozzleColor(size: number): string {
  if (NOZZLE_COLOR_MAP[size]) return NOZZLE_COLOR_MAP[size];
  if (size < 6) return 'فونية دقيقة (Micro)';
  if (size > 40) return `فونية عملاقة (#${size} High-Flow)`;
  return `فونية رقم #${size}`;
}

export function getInitialNozzleConfig(hydraulicFlowM3PerHr: number): import('../types/pivot').NozzleConfig {
  return {
    inflowRateM3PerHour: Math.round(hydraulicFlowM3PerHr || 160),
    syncWithHydraulic: true,
    totalSprinklerCount: 130, // 130 sprinklers calculated for standard 7-tower pivot (355m pipe, 3m first nozzle, 108" spacing)
    autoSyncWithSpanMath: true,
    firstSprinklerDistanceM: 3.0, // بُعد أول بخاخ عن المركز (3 متر افتراضياً، ويمكن أن يصل إلى 60 متراً)
    regulatorPressurePsi: 10, // 10 PSI / 0.7 bar standard for pivot drops
    sprinklerModel: 'nelson_d3000',
    nelsonPlate: 'green_spray',
    superSprayPad: 'flat_medium',
    endGunFlowPercent: 10, // 10% of total flow diverted to end gun if installed
  };
}

export function calculateNozzlePackage(
  pivotConfig: PivotConfig,
  nozzleConfig: import('../types/pivot').NozzleConfig,
  pivotResults: PivotResults
): import('../types/pivot').NozzlePackageResults {
  const pipeLength = pivotResults.pivotPipeRadius; // Length covered by sprinklers
  const N = Math.max(nozzleConfig.totalSprinklerCount, 2);
  // Allow first sprinkler distance to reach up to 60 meters (or pipeLength - 2)
  const rFirst = Math.min(Math.max(nozzleConfig.firstSprinklerDistanceM || 1.5, 0.5), Math.max(pipeLength - 2, 0.5));
  
  // Spacing between sprinklers from first sprinkler to the end of the pipe
  const spacingMeters = N > 1 ? (pipeLength - rFirst) / (N - 1) : 0;

  // Effective inflow entering sprinklers (total minus end gun share)
  const totalInflowM3PerHr = nozzleConfig.syncWithHydraulic
    ? pivotResults.hydraulic.requiredFlowM3PerHour
    : nozzleConfig.inflowRateM3PerHour;

  const endGunShare = pivotConfig.hasEndGun ? (nozzleConfig.endGunFlowPercent / 100) : 0;
  const boomFlowM3PerHr = totalInflowM3PerHr * (1 - endGunShare);
  const boomFlowGpm = boomFlowM3PerHr * 4.40286756;

  // Calculate r_i for each sprinkler and compute sum of radii
  const radii: number[] = [];
  let sumOfRadii = 0;
  for (let i = 1; i <= N; i++) {
    const r_i = rFirst + (i - 1) * spacingMeters;
    radii.push(r_i);
    sumOfRadii += r_i;
  }

  const sprinklers: import('../types/pivot').IndividualSprinklerItem[] = [];

  // Tower boundaries in meters:
  const towerBoundaries: number[] = [];
  let cum = 0;
  for (let i = 0; i < pivotConfig.towerCount; i++) {
    cum += (pivotConfig.spanLengths[i] ?? pivotConfig.uniformSpanLength);
    towerBoundaries.push(cum);
  }

  const P = Math.max(nozzleConfig.regulatorPressurePsi, 5);
  const sqrtP = Math.sqrt(P);
  const isNelson =
    nozzleConfig.sprinklerModel === 'nelson_d3000' ||
    nozzleConfig.sprinklerModel === 'nelson_rotator' ||
    nozzleConfig.sprinklerModel === 'nelson_orbitor_hilal';

  for (let i = 1; i <= N; i++) {
    const r_i = radii[i - 1];

    // Which tower does this sprinkler belong to?
    let towerNumber = 1;
    let isOverhang = false;

    for (let t = 0; t < towerBoundaries.length; t++) {
      if (r_i <= towerBoundaries[t]) {
        towerNumber = t + 1;
        break;
      }
    }

    if (r_i > (towerBoundaries[towerBoundaries.length - 1] || 0)) {
      isOverhang = true;
      towerNumber = pivotConfig.towerCount; // on the overhang past last tower
    }

    // Required flow for this sprinkler:
    // q_i = Q_boom * (r_i / sumOfRadii)
    const requiredFlowGpm = sumOfRadii > 0 ? (boomFlowGpm * r_i) / sumOfRadii : 0;
    const requiredFlowLPerMin = requiredFlowGpm * 3.78541;
    const requiredFlowM3PerHr = requiredFlowGpm * 0.227125;

    let nozzleNumber: number;
    let orificeDiameterMm: number;
    let orificeDiameter64thInch: string;
    let colorCodeAr: string;
    let colorHex: string | undefined;

    if (isNelson) {
      // نظام فوهات نيلسون 3TN الرسمي (بمضاعفات 1/128 بوصة):
      // التدفق: q_GPM = 0.001723 * (N_3TN)^2 * sqrt(P)
      const raw3Tn = Math.sqrt(requiredFlowGpm / (0.001723 * sqrtP));
      nozzleNumber = Math.max(6, Math.min(50, Math.round(raw3Tn)));
      orificeDiameterMm = (nozzleNumber / 128) * 25.4;
      orificeDiameter64thInch = `${nozzleNumber}/128"`;

      const nelsonColor = NELSON_3TN_COLOR_MAP[nozzleNumber];
      if (nelsonColor) {
        colorCodeAr = nelsonColor.isDualColor
          ? `${nelsonColor.baseNameAr} (شريط ${nelsonColor.stripeNameAr})`
          : `${nelsonColor.baseNameAr} (${nelsonColor.baseNameEn})`;
        colorHex = nelsonColor.hex; // اللون الأساسي وفقاً لاختيار المستخدم
      } else {
        colorCodeAr = `فوهة 3TN #${nozzleNumber}`;
        colorHex = '#84cc16';
      }
    } else {
      // نظام الفوهات القياسي UP3 (المعتمد لبخاخ هنتر سوبر سبراي وسيننجر بمضاعفات 1/64 بوصة):
      // q_GPM = 0.002415 * (NozzleNumber)^2 * sqrt(P)
      const rawNozzleNum = Math.sqrt(requiredFlowGpm / (0.002415 * sqrtP));
      nozzleNumber = Math.max(4, Math.min(36, Math.round(rawNozzleNum)));
      orificeDiameterMm = (nozzleNumber / 64) * 25.4;
      orificeDiameter64thInch = `${nozzleNumber}/64"`;

      const up3Color = SENNINGER_UP3_COLOR_MAP[nozzleNumber];
      if (up3Color) {
        colorCodeAr = `${up3Color.nameAr} (${up3Color.nameEn})`;
        colorHex = up3Color.hex;
      } else {
        colorCodeAr = getNozzleColor(nozzleNumber);
        colorHex = '#38bdf8';
      }
    }

    sprinklers.push({
      index: i,
      distanceFromCenterM: r_i,
      towerNumber,
      isOverhang,
      requiredFlowGpm,
      requiredFlowLPerMin,
      requiredFlowM3PerHr,
      nozzleNumber,
      orificeDiameterMm,
      orificeDiameter64thInch,
      colorCodeAr,
      colorHex,
      pressurePsi: P,
    });
  }

  const totalCalculatedGpm = sprinklers.reduce((acc, s) => acc + s.requiredFlowGpm, 0);
  const totalCalculatedFlowM3PerHour = totalCalculatedGpm * 0.227125;
  const minFlowSprinklerGpm = sprinklers.length > 0 ? sprinklers[0].requiredFlowGpm : 0;
  const maxFlowSprinklerGpm = sprinklers.length > 0 ? sprinklers[sprinklers.length - 1].requiredFlowGpm : 0;
  const averageFlowPerSprinklerGpm = sprinklers.length > 0 ? totalCalculatedGpm / sprinklers.length : 0;
  const flowRatioMaxToMin = minFlowSprinklerGpm > 0 ? maxFlowSprinklerGpm / minFlowSprinklerGpm : 1;

  const firstSprinklerDistanceM = rFirst;
  const firstSprinklerTowerNumber = sprinklers.length > 0 ? sprinklers[0].towerNumber : 1;
  const unirrigatedCenterAreaM2 = Math.PI * (rFirst * rFirst);

  return {
    sprinklers,
    totalSprinklers: N,
    averageFlowPerSprinklerGpm,
    minFlowSprinklerGpm,
    maxFlowSprinklerGpm,
    totalCalculatedFlowM3PerHour,
    flowRatioMaxToMin,
    spacingMeters,
    pipeLengthMeters: pipeLength,
    firstSprinklerDistanceM,
    firstSprinklerTowerNumber,
    unirrigatedCenterAreaM2,
  };
}
