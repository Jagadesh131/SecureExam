import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

export default function FacultySidebar({ activeExamCode = 'CS101-MID-2024', activeExamName = 'Data Structures Midterm', isGlobal = false }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const pathname = usePathname();

  const toggleAccordion = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarTop}>
        
        {!isGlobal ? (
          // STATE 1: Simplified Context Sidebar
          <>
            <View style={styles.sidebarHeader}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.push('/faculty-dashboard')}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.sidebarHeaderLabel}>EXAM ACCESS</Text>
            </View>

            <View style={styles.activeExamBadge}>
              <Text style={styles.activeExamTitle}>{activeExamName}</Text>
              <Text style={styles.activeExamCode}>{activeExamCode}</Text>
            </View>

            <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
              <Text style={styles.menuSection}>Exam Management</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/settings')}>
                <MaterialCommunityIcons name="cog-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>Exam Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/edit-exam')}>
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>Edit Exam</Text>
              </TouchableOpacity>

              <Text style={styles.menuSection}>Question Management</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/manage-questions')}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>Manage Questions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/bulk-upload')}>
                <MaterialCommunityIcons name="upload-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>Bulk Upload CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/categories')}>
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

              <Text style={styles.menuSection}>General Tools</Text>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty-dashboard')}>
                <MaterialCommunityIcons name="folder-multiple-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>All Exams</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/create-exam')}>
                <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#94A3B8" />
                <Text style={styles.menuText}>Create New Exam</Text>
              </TouchableOpacity>
              <View style={{height: 100}} />
            </ScrollView>
          </>
        ) : (
          // STATE 2: Advanced Context Sidebar (Accordion)
          <>
            <View style={styles.sidebarHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 24}}>🎓</Text>
                <Text style={{color: 'white', fontSize: 18, fontWeight: '800', marginLeft: 8}}>SecureExam</Text>
              </View>
            </View>
            
            <View style={{backgroundColor: '#0D9488', alignSelf: 'flex-start', marginLeft: 16, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 24}}>
              <Text style={{color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1}}>FACULTY PORTAL</Text>
            </View>

            <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
              
              <TouchableOpacity style={[styles.menuItem, pathname === '/faculty-dashboard' && styles.menuItemActive]} onPress={() => router.push('/faculty-dashboard')}>
                <MaterialCommunityIcons name="home-outline" size={18} color={pathname === '/faculty-dashboard' ? "white" : "#94A3B8"} />
                <Text style={[styles.menuText, pathname === '/faculty-dashboard' && {color: 'white'}]}>Dashboard</Text>
              </TouchableOpacity>

              {/* Accordion: Exam Management */}
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('exams')}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="folder-outline" size={18} color="#94A3B8" />
                  <Text style={styles.menuText}>Exam Management</Text>
                </View>
                <MaterialCommunityIcons name={expandedSection === 'exams' ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
              </TouchableOpacity>
              {expandedSection === 'exams' && (
                <View style={styles.accordionContent}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty-dashboard')}>
                    <Text style={styles.menuText}>Exam List</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/create-exam')}>
                    <Text style={styles.menuText}>Create Exam</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Accordion: Analytics */}
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('analytics')}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="chart-pie" size={18} color="#94A3B8" />
                  <Text style={styles.menuText}>Analytics</Text>
                </View>
                <MaterialCommunityIcons name={expandedSection === 'analytics' ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
              </TouchableOpacity>
              {expandedSection === 'analytics' && (
                <View style={styles.accordionContent}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/analytics')}>
                    <Text style={styles.menuText}>Class Analytics</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Performance Trends</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Accordion: Reports */}
              <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('reports')}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color="#94A3B8" />
                  <Text style={styles.menuText}>Reports</Text>
                </View>
                <MaterialCommunityIcons name={expandedSection === 'reports' ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
              </TouchableOpacity>
              {expandedSection === 'reports' && (
                <View style={styles.accordionContent}>
                  <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faculty/export-reports')}>
                    <Text style={styles.menuText}>Export Reports</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Custom Reports</Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>
          </>
        )}
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
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#0F172A',
    height: '100%',
    justifyContent: 'space-between',
  },
  sidebarTop: {
    flex: 1,
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
  menuItemActive: {
    backgroundColor: '#3B82F6',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  accordionContent: {
    paddingLeft: 24,
    marginBottom: 8,
  }
});
