import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PivotConfig, PivotResults, TowerRingData } from '../types/pivot';
import { formatNumber } from '../utils/pivotMath';

interface PivotCanvasProps {
  config: PivotConfig;
  results: PivotResults;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, 380);
const CENTER = CANVAS_SIZE / 2;

export const PivotCanvas: React.FC<PivotCanvasProps> = ({ config, results }) => {
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Maximum radius in meters
  const maxRadius = results.totalWettedRadius || 1;
  // Available drawing radius inside canvas with padding
  const DRAW_RADIUS = (CENTER - 28) * zoomLevel;
  const scale = DRAW_RADIUS / maxRadius;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setSelectedTower(null);
  };

  const selectedRing: TowerRingData | undefined =
    selectedTower !== null
      ? results.towerRings.find((r) => r.towerIndex === selectedTower)
      : undefined;

  return (
    <View style={styles.card}>
      {/* Header bar */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <MaterialCommunityIcons name="radar" size={18} color="#38bdf8" />
          <Text style={styles.titleText}>المخطط الهندسي التفاعلي 2D</Text>
        </View>

        {/* Zoom controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn}>
            <MaterialCommunityIcons name="plus" size={16} color="#e2e8f0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut}>
            <MaterialCommunityIcons name="minus" size={16} color="#e2e8f0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={handleResetZoom}>
            <MaterialCommunityIcons name="fit-to-screen-outline" size={16} color="#e2e8f0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG Canvas Area */}
      <View style={styles.canvasContainer}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Defs>
            <RadialGradient id="fieldGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#0f766e" stopOpacity="0.4" />
              <Stop offset="80%" stopColor="#047857" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#065f46" stopOpacity="0.1" />
            </RadialGradient>
            <RadialGradient id="endGunGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
            </RadialGradient>
          </Defs>

          {/* Background Grid Crosshairs */}
          <Line
            x1={CENTER}
            y1={10}
            x2={CENTER}
            y2={CANVAS_SIZE - 10}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <Line
            x1={10}
            y1={CENTER}
            x2={CANVAS_SIZE - 10}
            y2={CENTER}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {/* End Gun Spray Area if present */}
          {config.hasEndGun && config.endGunThrow > 0 && (
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={results.totalWettedRadius * scale}
              fill="url(#endGunGrad)"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5,3"
            />
          )}

          {/* Total Pipe Radius Circle (Spans + Overhang) */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={results.pivotPipeRadius * scale}
            fill="url(#fieldGrad)"
            stroke="#059669"
            strokeWidth={2}
          />

          {/* Concentric Tower Rings */}
          {results.towerRings.map((ring) => {
            const rPx = ring.outerRadius * scale;
            const isSelected = selectedTower === ring.towerIndex;

            return (
              <G key={ring.towerIndex}>
                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={rPx}
                  fill="transparent"
                  stroke={isSelected ? '#38bdf8' : '#334155'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  strokeDasharray={isSelected ? undefined : '3,3'}
                />
                {/* Tower Wheel Marker on East Axis */}
                <Circle
                  cx={CENTER + rPx}
                  cy={CENTER}
                  r={isSelected ? 4.5 : 3}
                  fill={isSelected ? '#38bdf8' : '#64748b'}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
              </G>
            );
          })}

          {/* Pivot Radial Pipe Boom (East direction) */}
          <Line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER + results.pivotPipeRadius * scale}
            y2={CENTER}
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Overhang Segment marker */}
          {config.overhangLength > 0 && (
            <Line
              x1={CENTER + (results.pivotPipeRadius - config.overhangLength) * scale}
              y1={CENTER}
              x2={CENTER + results.pivotPipeRadius * scale}
              y2={CENTER}
              stroke="#06b6d4"
              strokeWidth={3}
            />
          )}

          {/* Center Pivot Base Anchor Point */}
          <Circle cx={CENTER} cy={CENTER} r={6} fill="#38bdf8" stroke="#0284c7" strokeWidth={2} />
          <Circle cx={CENTER} cy={CENTER} r={2} fill="#ffffff" />

          {/* Center Point Label */}
          <SvgText
            x={CENTER}
            y={CENTER - 10}
            fill="#94a3b8"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            نقطة المركز
          </SvgText>

          {/* Wetted Radius Tag */}
          <SvgText
            x={CENTER + (results.totalWettedRadius * scale) / 2}
            y={CENTER + 16}
            fill="#34d399"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            {`${Math.round(results.totalWettedRadius)} م`}
          </SvgText>
        </Svg>
      </View>

      {/* Tower Selector Chips Bar */}
      <View style={styles.selectorBar}>
        <Text style={styles.selectorLabel}>فحص أبراج المحور:</Text>
        <View style={styles.chipsRow}>
          {results.towerRings.map((ring) => {
            const isSelected = selectedTower === ring.towerIndex;
            return (
              <TouchableOpacity
                key={ring.towerIndex}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedTower(isSelected ? null : ring.towerIndex)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {`ب ${ring.towerIndex}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Tower Details Panel */}
      {selectedRing ? (
        <View style={styles.detailsBox}>
          <View style={styles.detailsHeader}>
            <View style={styles.badgeTower}>
              <Text style={styles.badgeTowerText}>البرج رقم {selectedRing.towerIndex}</Text>
            </View>
            <Text style={styles.detailsRatio}>
              {`${formatNumber(selectedRing.percentageOfTotal, 1)}% من إجمالي الحقل`}
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{`${formatNumber(selectedRing.spanLength, 1)} م`}</Text>
              <Text style={styles.detailLabel}>طول الأسبان</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, { color: '#38bdf8' }]}>
                {`${formatNumber(selectedRing.ringFeddans, 2)} ف`}
              </Text>
              <Text style={styles.detailLabel}>مساحة حلقة البرج</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailValue, { color: '#34d399' }]}>
                {`${formatNumber(selectedRing.cumulativeFeddans, 2)} ف`}
              </Text>
              <Text style={styles.detailLabel}>التراكمي حتى البرج</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{`${Math.round(selectedRing.outerRadius)} م`}</Text>
              <Text style={styles.detailLabel}>نصف القطر الخارجي</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.hintBox}>
          <MaterialCommunityIcons name="gesture-tap" size={16} color="#64748b" />
          <Text style={styles.hintText}>
            اضغط على أي برج أعلاه لمعاينة طوله، مساحته بالفدان، والنسبة المئوية التراكمية.
          </Text>
        </View>
      )}

      {/* Legend Footer */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>أبراج المحور</Text>
        </View>
        {config.overhangLength > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#06b6d4' }]} />
            <Text style={styles.legendText}>الكابولي</Text>
          </View>
        )}
        {config.hasEndGun && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>المدفع النهائي</Text>
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
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  zoomBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    paddingVertical: 10,
  },
  selectorBar: {
    marginTop: 12,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 6,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  detailsBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  detailsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeTower: {
    backgroundColor: '#0c4a6e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeTowerText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsRatio: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f8fafc',
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  hintBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  hintText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    textAlign: 'right',
  },
  legendRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
