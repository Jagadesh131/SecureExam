import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FacultySidebar from '../../components/FacultySidebar';

export default function AttendanceScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const exam = { exam_name: "Data Structures Midterm", exam_code: "CS101-MID-2024" };
  const attempts = [
    { student_name: "Alice Johnson", reg_number: "REG-001", attempt_date: "2024-05-20", time_taken: 45 },
    { student_name: "Bob Smith", reg_number: "REG-002", attempt_date: "2024-05-20", time_taken: 52 },
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
              <MaterialCommunityIcons name="menu" size={28} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 20 }}>
            
            <View style={styles.attendancePanel}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Student Attendance - {exam.exam_name}</Text>
              </View>

              {attempts.map((a, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                    <Text style={styles.studentName}>{a.student_name} <Text style={styles.regNumber}>({a.reg_number})</Text></Text>
                    <View style={styles.pillSuccess}>
                      <Text style={styles.pillTextSuccess}>Completed</Text>
                    </View>
                  </View>
                  
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                      <Text style={styles.dataLabel}>Date</Text>
                      <Text style={styles.dataValue}>{a.attempt_date}</Text>
                    </View>
                    <View>
                      <Text style={styles.dataLabel}>Time Taken</Text>
                      <Text style={styles.dataValue}>{a.time_taken} min</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.exportBtn} onPress={() => alert('Exporting Attendance...')}>
              <MaterialCommunityIcons name="download" size={16} color="white" style={{marginRight: 8}} />
              <Text style={styles.exportBtnText}>Export Attendance List</Text>
            </TouchableOpacity>

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
  
  attendancePanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 24,
  },
  panelHeader: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  panelTitle: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  
  tableRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentName: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
  regNumber: { color: '#64748B', fontWeight: '400' },
  
  pillSuccess: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  pillTextSuccess: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  
  dataLabel: { color: '#94A3B8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 },
  dataValue: { color: '#334155', fontSize: 13, fontWeight: '500' },

  exportBtn: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  exportBtnText: { color: 'white', fontSize: 15, fontWeight: '600' }
});
