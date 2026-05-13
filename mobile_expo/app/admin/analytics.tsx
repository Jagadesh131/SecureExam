import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, useWindowDimensions, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiService } from '../../api';

export default function AdminAnalyticsScreen() {
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminAnalytics();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = [
    { label: 'Total Attempts', value: analytics?.stats?.total_attempts || '0', icon: 'account-group-outline', colors: ['#FF3333', '#660000'] },
    { label: 'Avg Pass Rate', value: `${analytics?.deep_stats?.pass_rate || 0}%`, icon: 'percent-outline', colors: ['#6366F1', '#312E81'] },
    { label: 'Peak Activity', value: analytics?.deep_stats?.peak_day || 'N/A', icon: 'chart-line', colors: ['#F59E0B', '#78350F'] },
    { label: 'Active Exams', value: analytics?.stats?.active_exams || '0', icon: 'file-document-outline', colors: ['#10B981', '#064E3B'] },
  ];

  const topExams = [
    { name: 'CS101 Midterm', attempts: 245, passRate: 72 },
    { name: 'Data Structures', attempts: 180, passRate: 58 },
    { name: 'Machine Learning', attempts: 156, passRate: 85 },
  ];

  const topFaculty = [
    { name: 'Dr. Sarah Wilson', exams: 12, rating: 4.8 },
    { name: 'Prof. James Miller', exams: 9, rating: 4.5 },
    { name: 'Dr. David Chen', exams: 8, rating: 4.9 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Intelligence Hub</Text>
          <Text style={styles.headerSubtitle}>Global Performance Metrics</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAnalytics}>
          <MaterialCommunityIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={Colors.midnight.primary} />
        </View>
      ) : (

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {metrics.map((item, idx) => (
            <LinearGradient key={idx} colors={item.colors} style={styles.metricCard} start={{x:0, y:0}} end={{x:1, y:1}}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name={item.icon} size={22} color="rgba(255,255,255,0.7)" />
                <Text style={styles.metricValue}>{item.value}</Text>
              </View>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </LinearGradient>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Rankings</Text>
          
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <MaterialCommunityIcons name="trophy-outline" size={20} color={Colors.midnight.primary} />
               <Text style={styles.cardTitle}>TOP PERFORMING EXAMS</Text>
            </View>
            {topExams.map((exam, idx) => (
              <View key={idx} style={[styles.listItem, idx === topExams.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listMain}>
                  <Text style={styles.listName}>{exam.name}</Text>
                  <Text style={styles.listSub}>{exam.attempts} ENROLLED ATTEMPTS</Text>
                </View>
                <View style={styles.listStat}>
                  <Text style={[styles.statValue, { color: exam.passRate > 70 ? '#10B981' : '#F59E0B' }]}>{exam.passRate}%</Text>
                  <Text style={styles.statLabel}>PASS RATE</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, { marginTop: 24 }]}>
            <View style={styles.cardHeader}>
               <MaterialCommunityIcons name="account-star-outline" size={20} color="#6366F1" />
               <Text style={styles.cardTitle}>MOST ACTIVE FACULTY</Text>
            </View>
            {topFaculty.map((fac, idx) => (
              <View key={idx} style={[styles.listItem, idx === topFaculty.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listMain}>
                  <Text style={styles.listName}>{fac.name}</Text>
                  <Text style={styles.listSub}>{fac.exams} ACTIVE MODULES</Text>
                </View>
                <View style={styles.listStat}>
                  <View style={styles.ratingRow}>
                     <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                     <Text style={styles.ratingText}>{fac.rating}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
           <View style={styles.infoIconBox}>
              <MaterialCommunityIcons name="shield-refresh-outline" size={20} color={Colors.midnight.primary} />
           </View>
           <View style={{flex: 1}}>
              <Text style={styles.infoTitle}>INTELLIGENCE UPDATE</Text>
              <Text style={styles.infoText}>Metric synchronization occurs every 15 minutes. For sub-second granularity, utilize the SecureExam Command Console.</Text>
           </View>
        </View>

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
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  metricCard: {
    width: '47.8%',
    borderRadius: 24,
    padding: 20,
    height: 120,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  cardTitle: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  listMain: {
    flex: 1,
  },
  listName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  listSub: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listStat: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    color: Colors.midnight.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  infoText: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
