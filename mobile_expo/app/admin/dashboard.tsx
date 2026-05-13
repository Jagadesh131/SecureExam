import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const stats = [
    { label: 'Total Faculty', value: '24', icon: 'account-tie-outline', color: '#EF4444' },
    { label: 'Total Exams', value: '156', icon: 'file-document-outline', color: '#6366F1' },
    { label: 'Active Students', value: '1.2k', icon: 'account-group-outline', color: '#10B981' },
    { label: 'Avg Score', value: '78%', icon: 'chart-bell-curve', color: '#F59E0B' },
  ];

  const quickActions = [
    { title: 'Faculty', icon: 'account-settings-outline', route: '/admin/faculty' },
    { title: 'Exams', icon: 'file-eye-outline', route: '/admin/exams' },
    { title: 'Attempts', icon: 'history', route: '/admin/attempts' },
    { title: 'Analytics', icon: 'chart-line', route: '/admin/analytics' },
    { title: 'Backup', icon: 'database-sync', route: '/admin/backup' },
    { title: 'System', icon: 'cog-outline', route: '/admin/settings' },
  ];

  const Sidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.logoMini}>
          <MaterialCommunityIcons name="shield-crown" size={24} color={Colors.midnight.primary} />
        </View>
        <View>
          <Text style={styles.sidebarTitle}>SECURE ADMIN</Text>
          <Text style={styles.sidebarStatus}>SYSTEM SUPERUSER</Text>
        </View>
      </View>

      <ScrollView style={styles.sidebarMenu}>
        <Text style={styles.menuSection}>Core Management</Text>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={20} color="white" />
          <Text style={[styles.menuText, styles.menuTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/faculty')}>
          <MaterialCommunityIcons name="account-tie-outline" size={20} color={Colors.midnight.textMuted} />
          <Text style={styles.menuText}>All Faculty</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/exams')}>
          <MaterialCommunityIcons name="file-document-multiple-outline" size={20} color={Colors.midnight.textMuted} />
          <Text style={styles.menuText}>All Exams</Text>
        </TouchableOpacity>
        
        <Text style={styles.menuSection}>Data & Insights</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/analytics')}>
          <MaterialCommunityIcons name="chart-box-outline" size={20} color={Colors.midnight.textMuted} />
          <Text style={styles.menuText}>System Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/attempts')}>
          <MaterialCommunityIcons name="account-group-outline" size={20} color={Colors.midnight.textMuted} />
          <Text style={styles.menuText}>Student Attempts</Text>
        </TouchableOpacity>

        <Text style={styles.menuSection}>Maintenance</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/backup')}>
          <MaterialCommunityIcons name="database-arrow-up-outline" size={20} color={Colors.midnight.textMuted} />
          <Text style={styles.menuText}>Backup & Restore</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/admin/login')}>
        <MaterialCommunityIcons name="power" size={20} color="white" />
        <Text style={styles.logoutText}>SHUTDOWN SESSION</Text>
      </TouchableOpacity>
    </View>
  );

  const MainContent = () => (
    <ScrollView style={[styles.mainContent, isDesktop && { padding: 40 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.mainTitle}>System Command</Text>
          <Text style={styles.mainSubtitle}>Greetings, Chief Administrator. All nodes active.</Text>
        </View>
        {!isDesktop && (
          <TouchableOpacity style={styles.mobileProfileBtn}>
             <MaterialCommunityIcons name="shield-account" size={24} color={Colors.midnight.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[styles.statsGrid, isDesktop ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, !isDesktop && {marginBottom: 16}]}>
            <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
              <MaterialCommunityIcons name={stat.icon} size={28} color={stat.color} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Access Control</Text>
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, idx) => (
          <TouchableOpacity key={idx} style={styles.actionCard} onPress={() => router.push(action.route)}>
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name={action.icon} size={24} color="white" />
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Intelligence Logs</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.logCard}>
          {[1,2,3,4].map((item, idx) => (
            <View key={idx} style={[styles.logItem, idx === 3 && { borderBottomWidth: 0 }]}>
              <View style={styles.logIndicator} />
              <View style={styles.logContent}>
                <Text style={styles.logTitle}>Faculty Approval Requested</Text>
                <Text style={styles.logDesc}>Dr. Sarah Jenkins (ID: FAC092) submitted registration.</Text>
                <Text style={styles.logTime}>4 MINUTES AGO</Text>
              </View>
              <TouchableOpacity style={styles.logActionBtn}>
                 <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.midnight.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {!isDesktop && (
        <View style={styles.mobileNavbar}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="menu-variant" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>SECURE<Text style={{color: Colors.midnight.primary}}>ADMIN</Text></Text>
          <TouchableOpacity style={styles.logoutIcon} onPress={() => router.replace('/admin/login')}>
            <MaterialCommunityIcons name="power" size={24} color={Colors.midnight.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.layout, isDesktop ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
        {isDesktop && <Sidebar />}
        <MainContent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight.background,
  },
  layout: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: Colors.midnight.sidebar,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: Colors.midnight.border,
  },
  sidebarHeader: {
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.midnight.border,
  },
  logoMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.2)',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sidebarStatus: {
    color: Colors.midnight.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 1,
  },
  sidebarMenu: {
    flex: 1,
    paddingTop: 32,
  },
  menuSection: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 32,
    marginBottom: 16,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: Colors.midnight.primary,
  },
  menuText: {
    color: Colors.midnight.textMuted,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '700',
  },
  menuTextActive: {
    color: 'white',
    fontWeight: '900',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 51, 51, 0.1)',
    margin: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.2)',
  },
  logoutText: {
    color: 'white',
    fontWeight: '900',
    marginLeft: 10,
    fontSize: 12,
    letterSpacing: 1,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 14,
    color: Colors.midnight.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  mobileProfileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.midnight.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  statsGrid: {
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.midnight.card,
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.midnight.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  statIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.midnight.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  viewAllText: {
    color: Colors.midnight.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 40,
  },
  actionCard: {
    width: '30.5%',
    backgroundColor: Colors.midnight.card,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  actionTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activitySection: {
    marginBottom: 60,
  },
  logCard: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midnight.border,
  },
  logIndicator: {
    width: 4,
    height: 48,
    backgroundColor: Colors.midnight.primary,
    borderRadius: 2,
    marginRight: 20,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  logDesc: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  logTime: {
    color: '#334155',
    fontSize: 11,
    marginTop: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logActionBtn: {
    padding: 8,
  },
  mobileNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.midnight.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.midnight.border,
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  logoutIcon: {
    padding: 4,
  },
});
