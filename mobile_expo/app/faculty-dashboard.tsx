import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/theme';
import { ApiService } from '../api';

export default function FacultyDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const { facultyId, facultyName } = useLocalSearchParams();

  const [activeMenu, setActiveMenu] = useState('All Exams');
  const [dashboardStats, setDashboardStats] = useState({ total_exams: 0, active_exams: 0, total_attempts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await ApiService.getFacultyDashboard(facultyId || 'FAC001');
      if (data.success) {
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Sidebar Component (Dark Theme as per screenshot)
  const Sidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarTop}>
        <View style={styles.sidebarHeader}>
          <TouchableOpacity style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.sidebarHeaderLabel}>EXAM ACCESS</Text>
        </View>

        <TouchableOpacity style={styles.dropdownSelector}>
          <Text style={styles.dropdownTitle}>Data Structures Midterm</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>
        
        <View style={styles.activeExamBadge}>
          <Text style={styles.activeExamTitle}>Data Structures Midterm</Text>
          <Text style={styles.activeExamCode}>CS101-MID-2024</Text>
        </View>

        <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
          <Text style={styles.menuSection}>Exam Management</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/settings')}>
            <MaterialCommunityIcons name="cog-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Exam Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/manage-questions')}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Edit Exam</Text>
          </TouchableOpacity>

          <Text style={styles.menuSection}>Question Management</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/manage-questions')}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Manage Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="upload-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Bulk Upload CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="tag-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Categories</Text>
          </TouchableOpacity>

          <Text style={styles.menuSection}>Results & Analytics</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/exam-results')}>
            <MaterialCommunityIcons name="poll" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Exam Results</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/attendance')}>
            <MaterialCommunityIcons name="account-group-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/analytics')}>
            <MaterialCommunityIcons name="chart-line" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/exam-results')}>
            <MaterialCommunityIcons name="file-export-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Export Report</Text>
          </TouchableOpacity>

          <Text style={styles.menuSection}>General Tools</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="folder-multiple-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>All Exams</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/create-exam')}>
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#94A3B8" />
            <Text style={styles.menuText}>Create New Exam</Text>
          </TouchableOpacity>
          <View style={{height: 100}} />
        </ScrollView>
      </View>

      <View style={styles.sidebarBottom}>
        <View style={styles.profileBox}>
          <View style={styles.avatarMini}>
            <MaterialCommunityIcons name="account" size={20} color="white" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.profileName}>Demo Faculty</Text>
            <Text style={styles.profileEmail}>faculty@university.edu</Text>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons name="cog" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <View style={styles.logoutContent}>
            <View style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Center Main Content Component (Light Theme as per screenshot)
  const MainContent = () => (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.mainHeader}>
        <Text style={styles.mainTitle}>Data Structures Midterm</Text>
        <Text style={styles.mainSubtitle}>Exam Code: CS101-MID-2024 | Subject: Computer Science</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Exam Status</Text>
            <Text style={[styles.statValue, {color: '#0F172A'}]}>Active</Text>
          </View>
          <View style={styles.statIconWrapper}>
            <MaterialCommunityIcons name="file-edit" size={24} color="#EF4444" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Students Attempted</Text>
            <Text style={styles.statValue}>5</Text>
          </View>
          <View style={styles.statIconWrapper}>
            <MaterialCommunityIcons name="account-group" size={24} color="#6366F1" />
          </View>
        </View>

        <View style={styles.statCard}>
          <View>
            <Text style={styles.statLabel}>Exam Avg Score</Text>
            <Text style={styles.statValue}>72%</Text>
          </View>
          <View style={styles.statIconWrapper}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#10B981" />
          </View>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarMonth}>May 2026</Text>
          <TouchableOpacity style={styles.scheduleBtn}>
            <Text style={styles.scheduleBtnText}>Schedule Exam</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarSubHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.calendarDayLabel}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {Array.from({length: 5}).map((_, i) => <View key={`empty-${i}`} style={styles.calendarCell} />)}
          {Array.from({length: 31}).map((_, i) => {
            const date = i + 1;
            const isActive = date === 2;
            return (
              <View key={date} style={[styles.calendarCell, isActive && styles.calendarCellActive]}>
                <Text style={[styles.calendarDateText, isActive && styles.calendarDateTextActive]}>{date}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsHeader}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.qaButton} onPress={() => router.push('/faculty/manage-questions')}>
            <MaterialCommunityIcons name="file-document" size={18} color="#CBD5E1" />
            <Text style={styles.qaButtonText}>Manage Questions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaButton} onPress={() => router.push('/faculty/exam-results')}>
            <MaterialCommunityIcons name="chart-box" size={18} color="#CBD5E1" />
            <Text style={styles.qaButtonText}>View Results</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaButton} onPress={() => router.push('/faculty/settings')}>
            <MaterialCommunityIcons name="cog" size={18} color="#CBD5E1" />
            <Text style={styles.qaButtonText}>Exam Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qaButton} onPress={() => router.push('/faculty/exam-results')}>
            <MaterialCommunityIcons name="file-export" size={18} color="#CBD5E1" />
            <Text style={styles.qaButtonText}>Export Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // Right Sidebar (Activity - Light Theme)
  const ActivityPanel = () => (
    <View style={styles.activityPanel}>
      <Text style={styles.activityTitle}>CS101-MID-2024 Activity</Text>
      <Text style={styles.activitySubtitle}>Showing results for this exam only</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {[
          { name: 'David Martinez', score: '4/5 (80%)', time: '3/10/2026, 9:00:00 PM', initial: 'D' },
          { name: 'Sarah Wilson', score: '2/5 (40%)', time: '3/10/2026, 8:45:00 PM', initial: 'S' },
          { name: 'Michael Brown', score: '3/5 (60%)', time: '3/10/2026, 8:30:00 PM', initial: 'M' },
          { name: 'Emily Davis', score: '5/5 (100%)', time: '3/10/2026, 8:15:00 PM', initial: 'E' },
          { name: 'John Smith', score: '4/5 (80%)', time: '3/10/2026, 8:00:00 PM', initial: 'J' },
        ].map((item, index, arr) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineConnector}>
              <View style={styles.timelinePoint}>
                <Text style={styles.timelineInitial}>{item.initial}</Text>
              </View>
              {index < arr.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineName}>{item.name}</Text>
              <Text style={styles.timelineDesc}>Completed CS101-MID-2024 - Score: {item.score}</Text>
              <Text style={styles.timelineTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#1D61FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.layout, isDesktop ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
        {isDesktop && <Sidebar />}
        <MainContent />
        {isDesktop && <ActivityPanel />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  layout: {
    flex: 1,
  },
  // Sidebar Styles (Dark)
  sidebar: {
    width: 260,
    backgroundColor: '#0F172A',
    height: '100%',
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  closeBtn: {
    marginRight: 12,
  },
  sidebarHeaderLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  activeExamBadge: {
    backgroundColor: '#1D61FF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  activeExamTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  activeExamCode: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  sidebarMenu: {
    flex: 1,
  },
  menuSection: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    color: '#94A3B8',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarBottom: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1D61FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#64748B',
    fontSize: 11,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 4,
    height: 16,
    backgroundColor: 'white',
    opacity: 0.3,
    marginRight: 10,
    borderRadius: 2,
  },
  logoutText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 14,
  },

  // Main Content Styles (Light)
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContentScroll: {
    padding: 32,
  },
  mainHeader: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  calendarMonth: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scheduleBtn: {
    backgroundColor: '#1D61FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  scheduleBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  calendarSubHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  calendarCellActive: {
    backgroundColor: '#EBF2FF',
    borderColor: '#1D61FF',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  calendarDateText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  calendarDateTextActive: {
    color: '#1D61FF',
    fontWeight: '800',
  },

  quickActionsContainer: {
    marginBottom: 40,
  },
  quickActionsHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  qaButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1D61FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
  },
  qaButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 10,
  },

  // Activity Panel (Right)
  activityPanel: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
    padding: 24,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelinePoint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1D61FF',
  },
  timelineInitial: {
    color: '#1D61FF',
    fontWeight: '800',
    fontSize: 14,
  },
  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: '#EBF2FF',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  timelineTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
});
