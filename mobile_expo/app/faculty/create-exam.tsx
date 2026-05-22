import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import FacultySidebar from '../../components/FacultySidebar';

export default function CreateExamScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            
            <View style={styles.bannerPurple}>
              <TouchableOpacity onPress={() => router.push('/faculty-dashboard')} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                <MaterialCommunityIcons name="arrow-left" size={16} color="rgba(255,255,255,0.8)" style={{marginRight: 8}} />
                <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 13}}>Back to Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.bannerTitle}>Create New Exam</Text>
              <Text style={styles.bannerSubtitle}>Fill out the details below to initialize a new secure assessment.</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Exam Name *</Text>
                <TextInput style={styles.inputControl} placeholder="e.g. Data Structures Midterm" placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject *</Text>
                <TextInput style={styles.inputControl} placeholder="e.g. Computer Science" placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.grid2}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.label}>Duration (min) *</Text>
                  <TextInput style={styles.inputControl} placeholder="60" keyboardType="number-pad" placeholderTextColor="#94A3B8" />
                </View>
                <View style={[styles.inputGroup, {flex: 1, marginLeft: 10}]}>
                  <Text style={styles.label}>Passing % *</Text>
                  <TextInput style={styles.inputControl} placeholder="40" keyboardType="number-pad" placeholderTextColor="#94A3B8" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Instructions (Optional)</Text>
                <TextInput 
                  style={[styles.inputControl, {height: 100, textAlignVertical: 'top'}]} 
                  placeholder="Provide any special instructions for students..." 
                  multiline 
                  placeholderTextColor="#94A3B8" 
                />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => alert('Exam Created!')}>
                <Text style={styles.submitBtnText}>Create Exam & Add Questions</Text>
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
  
  bannerPurple: {
    backgroundColor: '#4C1D95', // Deep Purple
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerTitle: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  bannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },

  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 40,
  },
  
  inputGroup: { marginBottom: 20 },
  label: { color: '#475569', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputControl: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: 14,
  },
  
  grid2: { flexDirection: 'row', justifyContent: 'space-between' },
  
  submitBtn: {
    backgroundColor: '#1D4ED8', // Royal Blue
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnText: { color: 'white', fontSize: 15, fontWeight: '700' }
});
