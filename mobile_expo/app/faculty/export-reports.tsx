import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FacultySidebar from '../../components/FacultySidebar';

export default function ExportReportsScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [columns, setColumns] = useState({
    regNumber: true,
    studentName: true,
    score: true,
    percentage: true,
    status: true,
    attemptDate: true,
  });

  const toggleColumn = (col) => setColumns({...columns, [col]: !columns[col]});

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
            
            <View style={styles.exportCard}>
              <Text style={styles.cardTitle}>Export Reports</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Exam *</Text>
                <View style={styles.inputControl}>
                  <Text style={{color: '#0F172A', fontSize: 14}}>Data Structures Midterm (CS101-MID)</Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#94A3B8" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Export Format *</Text>
                <View style={styles.segmentedControl}>
                  {['CSV', 'EXCEL', 'PDF'].map((fmt) => (
                    <TouchableOpacity 
                      key={fmt} 
                      style={[styles.segmentBtn, exportFormat === fmt && styles.segmentBtnActive]}
                      onPress={() => setExportFormat(fmt)}
                    >
                      <Text style={[styles.segmentBtnText, exportFormat === fmt && styles.segmentBtnTextActive]}>{fmt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Columns to Include</Text>
                <View style={styles.checkboxGrid}>
                  
                  {Object.entries({
                    regNumber: 'Reg Number', studentName: 'Student Name', 
                    score: 'Score', percentage: 'Percentage', 
                    status: 'Status', attemptDate: 'Attempt Date'
                  }).map(([key, label]) => (
                    <TouchableOpacity key={key} style={styles.checkboxLabel} onPress={() => toggleColumn(key)}>
                      <MaterialCommunityIcons 
                        name={columns[key] ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={20} 
                        color={columns[key] ? "#3B82F6" : "#CBD5E1"} 
                      />
                      <Text style={styles.checkboxText}>{label}</Text>
                    </TouchableOpacity>
                  ))}

                </View>
              </View>

              <TouchableOpacity style={styles.generateBtn} onPress={() => alert('Generating Report...')}>
                <Text style={styles.generateBtnText}>Generate & Download Report</Text>
              </TouchableOpacity>

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
  
  exportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: { color: '#0F172A', fontSize: 20, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  
  inputGroup: { marginBottom: 24 },
  label: { color: '#475569', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  segmentBtnTextActive: { color: '#3B82F6' },
  
  checkboxGrid: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  checkboxText: { color: '#334155', fontSize: 13, marginLeft: 8 },
  
  generateBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  generateBtnText: { color: 'white', fontSize: 15, fontWeight: '600' }
});
