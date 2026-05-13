import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';
import Constants from 'expo-constants';

export default function AdminAttemptsScreen() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Passed, Failed

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminAttempts();
      if (data.success) {
        setAttempts(data.attempts);
      }
    } catch (error) {
      console.error('Failed to load attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleDelete = (id) => {
    Alert.alert("CONFIRM DELETION", "Permanently remove this student attempt record from the system roster?", [
      { text: "ABORT", style: "cancel" },
      { text: "DELETE", style: 'destructive', onPress: () => {
        setAttempts(attempts.filter(a => a.id !== id));
      }}
    ]);
  };

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.exam_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || 
                          (filter === 'Passed' && a.status === 'Pass') || 
                          (filter === 'Failed' && a.status === 'Fail');
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
          <Text style={styles.headerTitle}>Results Ledger</Text>
          <Text style={styles.headerSubtitle}>Live Student Data Stream</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAttempts}>
           <MaterialCommunityIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterTabs}>
          {['All', 'Passed', 'Failed'].map((item) => (
            <TouchableOpacity 
              key={item} 
              style={[styles.tab, filter === item && styles.tabActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.tabText, filter === item && styles.tabTextActive]}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
           <MaterialCommunityIcons name="magnify" size={22} color={Colors.midnight.textMuted} style={styles.searchIcon} />
           <TextInput 
             style={styles.searchInput}
             placeholder="Search by student, ID or session..."
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
          {filteredAttempts.map((item, idx) => (
            <View key={idx} style={styles.attemptCard}>
              <View style={styles.cardHeader}>
                <View style={styles.studentInfo}>
                   <View style={styles.avatar}>
                      <MaterialCommunityIcons name="account-circle-outline" size={24} color={Colors.midnight.primary} />
                   </View>
                   <View>
                      <Text style={styles.studentName}>{item.student_name}</Text>
                      <Text style={styles.studentId}>{item.student_id || 'UID-PENDING'}</Text>
                   </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pass' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 51, 51, 0.1)' }]}>
                   <Text style={[styles.statusText, { color: item.status === 'Pass' ? '#10B981' : Colors.midnight.primary }]}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.examInfo}>
                 <Text style={styles.examLabel}>EXAMINATION STREAM</Text>
                 <Text style={styles.examName}>{item.exam_name}</Text>
              </View>

              <View style={styles.statsRow}>
                 <View style={styles.statBox}>
                    <Text style={styles.statVal}>{item.score}%</Text>
                    <Text style={styles.statLabel}>SCORE</Text>
                 </View>
                 <View style={styles.statBox}>
                    <Text style={styles.statVal}>{item.time_taken}M</Text>
                    <Text style={styles.statLabel}>DURATION</Text>
                 </View>
                 <View style={styles.statBox}>
                    <Text style={styles.statVal}>{item.date || 'N/A'}</Text>
                    <Text style={styles.statLabel}>TIMESTAMP</Text>
                 </View>
                 <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.midnight.primary} />
                 </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredAttempts.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="database-off-outline" size={64} color="#1E293B" />
              <Text style={styles.emptyText}>Zero Data Records</Text>
              <Text style={styles.emptySubtext}>No student attempts found matching your criteria.</Text>
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
    padding: 20,
    paddingBottom: 0,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.midnight.card,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Colors.midnight.primary,
  },
  tabText: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tabTextActive: {
    color: 'white',
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
  attemptCard: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 28,
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  studentName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  studentId: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  examInfo: {
    marginBottom: 20,
  },
  examLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  examName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.1)',
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
