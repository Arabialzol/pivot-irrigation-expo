import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import {
  FeddanStandard,
  NozzleConfig,
  PivotConfig,
} from './src/types/pivot';
import {
  calculatePivot,
  getInitialConfig,
  getInitialNozzleConfig,
  calculateNozzlePackage,
  calculatePivotSpanNozzles,
} from './src/utils/pivotMath';
import { Header } from './src/components/Header';
import { PivotForm } from './src/components/PivotForm';
import { PivotCanvas } from './src/components/PivotCanvas';
import { ResultsDashboard } from './src/components/ResultsDashboard';
import { NozzleCalculator } from './src/components/NozzleCalculator';
import { NozzleLockGateway } from './src/components/NozzleLockGateway';
import { AdminLoginModal } from './src/components/AdminLoginModal';
import { ClientRequestsModal } from './src/components/ClientRequestsModal';
import { HydraulicCalculator } from './src/components/HydraulicCalculator';
import { ReportModal } from './src/components/ReportModal';
import { NozzleReportModal } from './src/components/NozzleReportModal';
import { GuideModal } from './src/components/GuideModal';
import {
  isAdminAuthenticated,
  setAdminAuthenticated,
  getClientRequests,
  ClientNozzleRequest,
} from './src/utils/nozzleRequests';

type ActiveTab = 'overview' | 'visualizer' | 'nozzles' | 'hydraulic';

function AppInner() {
  const [config, setConfig] = useState<PivotConfig>(getInitialConfig);
  const [nozzleConfig, setNozzleConfig] = useState<NozzleConfig>(() =>
    getInitialNozzleConfig(180)
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isNozzleReportOpen, setIsNozzleReportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [requestsList, setRequestsList] = useState<ClientNozzleRequest[]>(() => getClientRequests());

  // Compute pivot geometric, area, and hydraulic results
  const results = useMemo(() => calculatePivot(config), [config]);

  // Compute sprinkler nozzle package
  const nozzleResults = useMemo(
    () => calculateNozzlePackage(config, nozzleConfig, results),
    [config, nozzleConfig, results]
  );

  const handleStandardChange = (std: FeddanStandard) => {
    setConfig((prev) => ({ ...prev, feddanStandard: std }));
  };

  const handleReset = () => {
    setConfig(getInitialConfig());
    setNozzleConfig(getInitialNozzleConfig(180));
  };

  // Synchronized pivot config change: updates nozzles automatically if autoSync is active
  const handlePivotConfigChange = (updated: PivotConfig) => {
    setConfig(updated);
    if (nozzleConfig.autoSyncWithSpanMath !== false) {
      const calc = calculatePivotSpanNozzles(
        updated,
        nozzleConfig.firstSprinklerDistanceM
      );
      setNozzleConfig((prev) => ({
        ...prev,
        totalSprinklerCount: calc.totalCalculatedNozzles,
      }));
    }
  };

  // Synchronized nozzle config change: recalculates total if first sprinkler distance changes
  const handleNozzleConfigChange = (updated: NozzleConfig) => {
    if (
      updated.autoSyncWithSpanMath !== false &&
      updated.firstSprinklerDistanceM !== nozzleConfig.firstSprinklerDistanceM
    ) {
      const calc = calculatePivotSpanNozzles(
        config,
        updated.firstSprinklerDistanceM
      );
      setNozzleConfig({
        ...updated,
        totalSprinklerCount: calc.totalCalculatedNozzles,
      });
    } else {
      setNozzleConfig(updated);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Main Engineering Header */}
      <Header
        config={config}
        onStandardChange={handleStandardChange}
        onReset={handleReset}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Tab Content Body */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentScrollInner}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'overview' && (
            <View>
              {/* Executive Results Dashboard */}
              <ResultsDashboard config={config} results={results} />

              {/* Pivot Specifications & Dimensions Form */}
              <PivotForm
                config={config}
                onChange={handlePivotConfigChange}
                firstSprinklerDistanceM={nozzleConfig.firstSprinklerDistanceM}
                onSyncNozzles={(count) =>
                  setNozzleConfig((prev) => ({
                    ...prev,
                    totalSprinklerCount: count,
                    autoSyncWithSpanMath: true,
                  }))
                }
              />
            </View>
          )}

          {activeTab === 'visualizer' && (
            <View>
              {/* 2D Interactive Radar & Tower Rings Visualizer */}
              <PivotCanvas config={config} results={results} />
              
              {/* Quick Results Summary under canvas */}
              <ResultsDashboard config={config} results={results} />
            </View>
          )}

          {activeTab === 'nozzles' && (
            <View>
              {/* Sprinkler Nozzle Sizing & Programming */}
              <NozzleCalculator
                pivotConfig={config}
                pivotResults={results}
                nozzleConfig={nozzleConfig}
                nozzleResults={nozzleResults}
                onChange={handleNozzleConfigChange}
                onPivotConfigChange={handlePivotConfigChange}
                onOpenReport={() => setIsReportOpen(true)}
                onOpenNozzleReport={() => setIsNozzleReportOpen(true)}
                isAdmin={isAdmin}
                onOpenLogin={() => setIsLoginOpen(true)}
                onLogout={() => {
                  setAdminAuthenticated(false);
                  setIsAdmin(false);
                }}
                onOpenRequests={() => {
                  setRequestsList([...getClientRequests()]);
                  setIsRequestsOpen(true);
                }}
                requestsCount={requestsList.length}
                onRequestSubmitted={() => {
                  setRequestsList([...getClientRequests()]);
                }}
              />
            </View>
          )}

          {activeTab === 'hydraulic' && (
            <View>
              {/* Operational & Agronomic Water Requirement Calculator */}
              <HydraulicCalculator
                config={config}
                results={results}
                onChange={setConfig}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          onPress={() => setActiveTab('overview')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calculator-variant-outline"
            size={22}
            color={activeTab === 'overview' ? '#38bdf8' : '#64748b'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'overview' && styles.tabLabelActive]}
          >
            المواصفات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'visualizer' && styles.tabItemActive]}
          onPress={() => setActiveTab('visualizer')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="radar"
            size={22}
            color={activeTab === 'visualizer' ? '#38bdf8' : '#64748b'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'visualizer' && styles.tabLabelActive]}
          >
            المخطط 2D
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'nozzles' && styles.tabItemActive]}
          onPress={() => setActiveTab('nozzles')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="water-pump"
            size={22}
            color={activeTab === 'nozzles' ? '#38bdf8' : '#64748b'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'nozzles' && styles.tabLabelActive]}
          >
            الفونيات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'hydraulic' && styles.tabItemActive]}
          onPress={() => setActiveTab('hydraulic')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="gauge"
            size={22}
            color={activeTab === 'hydraulic' ? '#38bdf8' : '#64748b'}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'hydraulic' && styles.tabLabelActive]}
          >
            التشغيل والري
          </Text>
        </TouchableOpacity>
      </View>

      {/* Engineering Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        config={config}
        results={results}
        nozzleConfig={nozzleConfig}
        nozzleResults={nozzleResults}
      />

      {/* Supervisor Detailed Nozzles Report Modal */}
      <NozzleReportModal
        isOpen={isNozzleReportOpen}
        onClose={() => setIsNozzleReportOpen(false)}
        config={config}
        results={results}
        nozzleConfig={nozzleConfig}
        nozzleResults={nozzleResults}
      />

      {/* Engineering Knowledge & Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Admin Login Modal for muzamil */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          const currentReqs = getClientRequests();
          setRequestsList([...currentReqs]);
          // When supervisor logs in, automatically show the incoming requests with parameters!
          if (currentReqs.length > 0) {
            setIsRequestsOpen(true);
          }
        }}
      />

      {/* Supervisor Incoming Requests with Full Parameters Modal */}
      <ClientRequestsModal
        isOpen={isRequestsOpen}
        onClose={() => {
          setIsRequestsOpen(false);
          setRequestsList([...getClientRequests()]);
        }}
        onRequestSelect={(selectedReq) => {
          // If supervisor wants to load the exact parameters into the live calculator
          if (selectedReq.flowM3PerHour) {
            setConfig((prev) => ({
              ...prev,
              inflowRateM3PerHour: selectedReq.flowM3PerHour,
            }));
          }
          if (selectedReq.regulatorPressurePsi) {
            setNozzleConfig((prev) => ({
              ...prev,
              regulatorPressurePsi: selectedReq.regulatorPressurePsi || 15,
            }));
          }
        }}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollInner: {
    padding: 16,
    paddingBottom: 24,
  },
  tabBar: {
    flexDirection: 'row-reverse',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
});
