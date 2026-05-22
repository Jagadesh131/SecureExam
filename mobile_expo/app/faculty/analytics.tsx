import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FacultySidebar from '../../components/FacultySidebar';

export default function AnalyticsScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const exams = [
    { exam_name: "Data Structures", student_avg: 76, class_avg: 72, diff: 4 },
    { exam_name: "Algorithm Design", student_avg: 68, class_avg: 70, diff: -2 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {sidebarOpen && (
          <View style={{ position: 'absolute', zIndex: 10, left: 0, top: 0, bottom: 0 }}>
            <FacultySidebar isGlobal={true} />
          </View>
        )}

        <View style={styles.mainContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
              <MaterialCommunityIcons name="menu" size={28} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 20 }}>
            
            <View style={styles.analyticsPanel}>
              <Text style={styles.panelTitle}>Performance Trends</Text>
              
              <View style={styles.chartCanvas}>
                <Text style={styles.chartText}>📈 Line Chart Placeholder</Text>
                <Text style={styles.chartSubtext}>(Student Performance Over Time)</Text>
              </View>

              <Text style={styles.metricsTitle}>Historical Metrics</Text>

              {exams.map((e, i) => (
                <View key={i} style={styles.metricRow}>
                  <Text style={styles.examName}>{e.exam_name}</Text>
                  
                  <View style={styles.metricDataRow}>
                    <View style={styles.metricDataCol}>
                      <Text style={styles.dataLabel}>Student Avg</Text>
                      <Text style={styles.dataValueStudent}>{e.student_avg}%</Text>
                    </View>
                    <View style={styles.metricDataCol}>
                      <Text style={styles.dataLabel}>Class Avg</Text>
                      <Text style={styles.dataValue}>{e.class_avg}%</Text>
                    </View>
                    <View style={styles.metricDataCol}>
                      <Text style={styles.dataLabel}>Difference</Text>
                      <Text style={[styles.dataValue, e.diff > 0 ? styles.diffPos : styles.diffNeg]}>
                        {e.diff > 0 ? '+' : ''}{e.diff}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { flex: 1, flexDirection: 'row' },
  mainContent: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  menuButton: { padding: 4 },
  scrollArea: { flex: 1 },
  
  analyticsPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 24,
  },
  panelTitle: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  
  chartCanvas: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  chartText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  chartSubtext: { color: '#94A3B8', fontSize: 13, marginTop: 4 },

  metricsTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  
  metricRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  examName: { color: '#0F172A', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  
  metricDataRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricDataCol: { flex: 1 },
  dataLabel: { color: '#64748B', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 },
  dataValue: { color: '#334155', fontSize: 14, fontWeight: '500' },
  dataValueStudent: { color: '#3B82F6', fontSize: 14, fontWeight: '700' },
  
  diffPos: { color: '#10B981', fontWeight: '700' },
  diffNeg: { color: '#EF4444', fontWeight: '700' },
});
