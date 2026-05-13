import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';
import Constants from 'expo-constants';

export default function AdminExamsScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Active, Inactive

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminExams();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const toggleStatus = (id, currentStatus) => {
    Alert.alert(
      currentStatus ? "DEACTIVATE EXAM?" : "ACTIVATE EXAM?",
      `Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this examination module?`,
      [
        { text: "ABORT", style: "cancel" },
        { text: "CONFIRM", onPress: () => {
          setExams(exams.map(e => e.id === id ? { ...e, is_active: !currentStatus } : e));
        }}
      ]
    );
  };

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.exam_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || 
                          (filter === 'Active' && e.is_active) || 
                          (filter === 'Inactive' && !e.is_active);
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Exam Oversight</Text>
          <Text style={styles.headerSubtitle}>Global Stream Management</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchExams}>
           <MaterialCommunityIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['All', 'Active', 'Inactive'].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
           <MaterialCommunityIcons name="magnify" size={22} color={Colors.midnight.textMuted} style={styles.searchIcon} />
           <TextInput 
             style={styles.searchInput}
             placeholder="Search exams by name or code..."
             placeholderTextColor="#475569"
             value={searchQuery}
             onChangeText={setSearchQuery}
           />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.midnight.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredExams.map((exam, idx) => (
            <View key={idx} style={styles.examCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: exam.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 51, 51, 0.1)' }]}>
                   <View style={[styles.statusDot, { backgroundColor: exam.is_active ? '#10B981' : Colors.midnight.primary }]} />
                   <Text style={[styles.statusText, { color: exam.is_active ? '#10B981' : Colors.midnight.primary }]}>
                    {exam.is_active ? 'ACTIVE' : 'OFFLINE'}
                   </Text>
                </View>
                <Text style={styles.examCode}>{exam.exam_code}</Text>
              </View>

              <Text style={styles.examName}>{exam.exam_name}</Text>
              <Text style={styles.examMeta}>{exam.subject} • Authored by {exam.faculty_name || 'System'}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                   <MaterialCommunityIcons name="timer-outline" size={16} color={Colors.midnight.textMuted} />
                   <Text style={styles.footerText}>{exam.duration} MINUTES</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggleBtn, { backgroundColor: exam.is_active ? 'rgba(255,255,255,0.03)' : Colors.midnight.primary }]}
                  onPress={() => toggleStatus(exam.id, exam.is_active)}
                >
                  <Text style={[styles.toggleBtnText, {color: exam.is_active ? '#94A3B8' : 'white'}]}>{exam.is_active ? 'DEACTIVATE' : 'ACTIVATE'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredExams.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-search-outline" size={64} color="#1E293B" />
              <Text style={styles.emptyText}>Zero Exam Matches</Text>
              <Text style={styles.emptySubtext}>No modules found matching your current filter.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.midnight.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midnight.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
  },
  filterSection: {
    paddingTop: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.midnight.card,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
    borderColor: 'rgba(255, 51, 51, 0.2)',
  },
  filterText: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  filterTextActive: {
    color: Colors.midnight.primary,
  },
  searchSection: {
    padding: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  examCard: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  examCode: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  examName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  examMeta: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    marginBottom: 24,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 20,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 11,
    marginLeft: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: 'white',
    marginTop: 20,
    fontSize: 20,
    fontWeight: '900',
  },
  emptySubtext: {
    color: Colors.midnight.textMuted,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
