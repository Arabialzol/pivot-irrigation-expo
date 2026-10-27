export type FeddanStandard = 'egyptian' | 'sudanese';

export type ManufacturerId = 'valley' | 'zimmatic' | 'reinke' | 'bauer' | 'custom';

export interface ManufacturerPreset {
  id: ManufacturerId;
  nameAr: string;
  nameEn: string;
  country: string;
  defaultSpan: number;
  availableSpans: number[];
  defaultOverhang: number;
  availableOverhangs: number[];
  standardPipeDiameterInch: number;
  typicalMaxSpeedMPerHr: number;
  description: string;
}

export interface PresetFieldSize {
  name: string;
  towers: number;
  estimatedFeddans: string;
  manufacturer: ManufacturerId;
  spanLength: number;
  overhang: number;
  endGun: boolean;
}

export interface StandardSpanPreset {
  id: string;
  feet: number;
  meters: number;
  labelAr: string;
  manufacturerHint?: string;
  popular?: boolean;
}

export type SpacingPresetType =
  | 'standard_108'
  | 'dense_72'
  | 'dense_40'
  | 'custom';

export type CropType =
  | 'wheat'
  | 'corn'
  | 'alfalfa'
  | 'potatoes'
  | 'barley'
  | 'soybean'
  | 'forage'
  | 'custom';

export interface CropInfo {
  id: CropType;
  nameAr: string;
  nameEn?: string;
  kcPeak: number;
  recommendedTypicalMm?: number;
  typicalRangeMm?: string;
  seasonAr?: string;
  descriptionAr?: string;
  kcInitial?: number;
  kcMid?: number;
  rootDepthM?: number;
  notes?: string;
}

export type ClimateSeasonType =
  | 'summer_peak'
  | 'summer_mild'
  | 'spring_autumn'
  | 'winter'
  | 'arid_desert';

export interface ClimateSeasonInfo {
  id: ClimateSeasonType;
  nameAr: string;
  nameEn?: string;
  baseEToMm: number;
  baseEtoMm?: number;
  descriptionAr?: string;
  description?: string;
  tempReferenceC?: number;
}

export interface AgronomicResults {
  cropNameAr: string;
  climateNameAr: string;
  temperatureC: number;
  recommendedDepthMm: number;
  etoMm: number;
  cropKc: number;
  grossDailyVolumeM3PerFeddan: number;
  explanationAr: string;
}

export interface TowerRingData {
  towerIndex: number;
  spanLength: number;
  innerRadius: number;
  outerRadius: number;
  ringAreaM2: number;
  ringFeddans: number;
  cumulativeFeddans: number;
  percentageOfTotal: number;
  outerCircumferenceM: number;
}

export interface OverhangRingData {
  name: string;
  innerRadius: number;
  outerRadius: number;
  ringAreaM2: number;
  ringFeddans: number;
  percentageOfTotal: number;
}

export interface EndGunRingData {
  name: string;
  innerRadius: number;
  outerRadius: number;
  ringAreaM2: number;
  ringFeddans: number;
  percentageOfTotal: number;
}

export interface PivotConfig {
  manufacturer: ManufacturerId;
  towerCount: number;
  spanLengths: number[];
  uniformSpanLength: number;
  isUniformSpan: boolean;
  overhangLength: number;
  hasEndGun: boolean;
  endGunThrow: number;
  feddanStandard: FeddanStandard;
  cropType: CropType;
  climateSeason: ClimateSeasonType;
  ambientTemperatureC: number;
  targetWaterDepthMm: number;
  inflowRateM3PerHour: number;
  hydraulicInputMode: 'depth' | 'flow';
  dailyOperatingHours: number;
  timerPercent: number;
  desiredCycleHours: number;
  lastTowerSpeedAt100: number;
  spanSpacingPreset: SpacingPresetType;
  customSpanSpacingM: number;
  customSpanNozzleCounts?: number[];
}

export interface FeddanBreakdown {
  feddans: number;
  qirats: number;
  sahms: number;
}

export interface HydraulicResults {
  requiredFlowM3PerHour: number;
  requiredFlowLitersPerSec: number;
  requiredFlowGpm: number;
  waterVolumeM3PerDay: number;
}

export interface OperationalResults {
  rotationHoursAt100: number;
  actualRotationHours: number;
  actualRotationDays: number;
  calendarDaysWithPumpHours: number;
  lastTowerSpeedActualMPerHr: number;
  lastTowerCircumferenceM: number;
  appliedDepthMmPerPass: number;
}

export interface PivotResults {
  pivotPipeRadius: number;
  totalWettedRadius: number;
  pipeAreaM2: number;
  endGunAreaM2: number;
  totalAreaM2: number;
  totalFeddans: number;
  feddanBreakdown: FeddanBreakdown;
  totalHectares: number;
  totalSquareMeters: number;
  towerRings: TowerRingData[];
  overhangRing: OverhangRingData;
  endGunRing?: EndGunRingData;
  hydraulic: HydraulicResults;
  operational: OperationalResults;
  agronomic: AgronomicResults;
}

export type SprinklerModelType =
  | 'nelson_d3000'
  | 'nelson_rotator'
  | 'nelson_orbitor_hilal'
  | 'hunter_super_spray'
  | 'senninger_iwob';

export type NelsonD3000PlateType = string;
export type SuperSprayPadType = string;

export interface NozzleConfig {
  inflowRateM3PerHour: number;
  syncWithHydraulic: boolean;
  totalSprinklerCount: number;
  autoSyncWithSpanMath: boolean;
  firstSprinklerDistanceM: number;
  regulatorPressurePsi: number;
  sprinklerModel: SprinklerModelType;
  nelsonPlate: NelsonD3000PlateType;
  superSprayPad: SuperSprayPadType;
  endGunFlowPercent: number;
}

export interface IndividualSprinklerItem {
  index: number;
  distanceFromCenterM: number;
  towerNumber: number;
  isOverhang: boolean;
  requiredFlowGpm: number;
  requiredFlowLPerMin: number;
  requiredFlowM3PerHr: number;
  nozzleNumber: number;
  orificeDiameterMm: number;
  orificeDiameter64thInch: string;
  colorCodeAr: string;
  colorHex?: string;
  pressurePsi: number;
}

export interface NozzlePackageResults {
  sprinklers: IndividualSprinklerItem[];
  totalSprinklers: number;
  averageFlowPerSprinklerGpm: number;
  minFlowSprinklerGpm: number;
  maxFlowSprinklerGpm: number;
  totalCalculatedFlowM3PerHour: number;
  flowRatioMaxToMin: number;
  spacingMeters: number;
  pipeLengthMeters: number;
  firstSprinklerDistanceM: number;
  firstSprinklerTowerNumber: number;
  unirrigatedCenterAreaM2: number;
}

export interface SpanNozzleBreakdown {
  spanIndex: number;
  spanNumber: number;
  lengthMeters: number;
  lengthFeet: number;
  nozzleCount: number;
  isOverhang: boolean;
}

export interface PivotNozzleCalculationResult {
  spans?: SpanNozzleBreakdown[];
  spansBreakdown?: SpanNozzleBreakdown[];
  overhangBreakdown?: SpanNozzleBreakdown;
  totalCalculatedNozzles: number;
  effectiveSpacingM?: number;
  effectiveSpacingInches?: number;
  totalPipeLengthM?: number;
  spacingMeters?: number;
  spacingInches?: number;
  spacingPreset?: string;
  perSpanCount?: number;
}
