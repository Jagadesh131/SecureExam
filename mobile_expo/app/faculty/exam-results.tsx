import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import FacultySidebar from '../../components/FacultySidebar';

export default function ExamResultsScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock Data
  const exam = { exam_name: "Data Structures Midterm", exam_code: "CS101-MID-2024", subject: "Computer Science" };
  const results = [
    { student_name: "Alice Johnson", reg_number: "REG-001", attempt_date: "2024-05-20", score: 45, total_questions: 50, percentage: 90 },
    { student_name: "Bob Smith", reg_number: "REG-002", attempt_date: "2024-05-20", score: 15, total_questions: 50, percentage: 30 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {sidebarOpen && (
          <View style={{ position: 'absolute', zIndex: 10, left: 0, top: 0, bottom: 0 }}>
            <FacultySidebar activeExamCode={exam.exam_code} activeExamName={exam.exam_name} isGlobal={false} />
          </View>
        )}

        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
              <MaterialCommunityIcons name="menu" size={28} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 20 }}>
            
            {/* Banner */}
            <View style={styles.bannerPurple}>
              <TouchableOpacity onPress={() => router.push('/faculty-dashboard')} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <MaterialCommunityIcons name="arrow-left" size={16} color="rgba(255,255,255,0.8)" style={{marginRight: 8}} />
                <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Back to Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.bannerTitle}>Results: {exam.exam_name}</Text>
              <Text style={styles.bannerSubtitle}>Subject: {exam.subject} | Code: {exam.exam_code}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>TOTAL ATTEMPTS</Text>
                <Text style={styles.statValue}>125</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>PASSED</Text>
                <Text style={[styles.statValue, {color: '#10B981'}]}>112</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>FAILED</Text>
                <Text style={[styles.statValue, {color: '#EF4444'}]}>13</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>AVERAGE</Text>
                <Text style={styles.statValue}>78%</Text>
              </View>
            </View>

            {/* Results Panel */}
            <View style={styles.resultsPanel}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsHeaderText}>Student Results (125)</Text>
              </View>

              {results.map((r, i) => {
                const isPass = r.percentage >= 40;
                return (
                  <View key={i} style={[styles.resultRow, isPass ? styles.rowPass : styles.rowFail]}>
                    <View style={{flex: 1}}>
                      <Text style={styles.studentName}>{r.student_name}</Text>
                      <Text style={styles.regNumber}>{r.reg_number}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <View style={[styles.pillBadge, isPass ? styles.badgePass : styles.badgeFail]}>
                        <Text style={[styles.pillText, isPass ? {color: '#10B981'} : {color: '#EF4444'}]}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </Text>
                      </View>
                      <Text style={styles.scoreText}>{r.percentage}% ({r.score}/{r.total_questions})</Text>
                    </View>
                  </View>
                );
              })}
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
  
  bannerPurple: {
    backgroundColor: '#4C1D95', // Deep Purple
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerTitle: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  statValue: { color: '#0F172A', fontSize: 24, fontWeight: '800' },

  resultsPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  resultsHeader: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultsHeaderText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  rowPass: { borderLeftWidth: 4, borderLeftColor: '#10B981' },
  rowFail: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  
  studentName: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
  regNumber: { color: '#64748B', fontSize: 13, marginTop: 2 },
  scoreText: { color: '#334155', fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgePass: { backgroundColor: '#D1FAE5' },
  badgeFail: { backgroundColor: '#FEE2E2' },
  pillText: { fontSize: 11, fontWeight: '700' },
});
