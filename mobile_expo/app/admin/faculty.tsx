import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, Modal, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';
import Constants from 'expo-constants';

export default function AdminFacultyScreen() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFaculty, setEditingFaculty] = useState(null);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAdminFaculty();
      if (data.success) {
        setFaculty(data.faculty);
      }
    } catch (error) {
      console.error('Failed to load faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      "CONFIRM DELETION",
      "This will permanently terminate the faculty member and all associated examination data. INITIATE DELETION?",
      [
        { text: "ABORT", style: "cancel" },
        { text: "CONFIRM", style: "destructive", onPress: () => {
          setFaculty(faculty.filter(f => f.id !== id));
        }}
      ]
    );
  };

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.faculty_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Faculty Ledger</Text>
          <Text style={styles.headerSubtitle}>System Roster & Credentials</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/add-faculty')}>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
           <MaterialCommunityIcons name="magnify" size={22} color={Colors.midnight.textMuted} style={styles.searchIcon} />
           <TextInput 
             style={styles.searchInput}
             placeholder="Search by name, ID or department..."
             placeholderTextColor="#475569"
             value={searchQuery}
             onChangeText={setSearchQuery}
           />
           {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
               <MaterialCommunityIcons name="close-circle" size={20} color={Colors.midnight.textMuted} />
             </TouchableOpacity>
           )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.midnight.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filteredFaculty.map((item, idx) => (
            <View key={idx} style={styles.facultyCard}>
              <View style={styles.facultyInfo}>
                <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                   <MaterialCommunityIcons name="account-tie-outline" size={24} color={Colors.midnight.primary} />
                </View>
                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.deptDot, { backgroundColor: '#FF3333' }]} />
                    <Text style={styles.subtext}>{item.faculty_id} • {item.department}</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statChip}>
                       <MaterialCommunityIcons name="file-document-outline" size={12} color="#94A3B8" />
                      <Text style={styles.statLabel}>{item.exam_count || 0} EXAMS</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditingFaculty(item)}>
                  <MaterialCommunityIcons name="pencil-outline" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.midnight.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredFaculty.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={64} color="#1E293B" />
              <Text style={styles.emptyText}>Zero Faculty Matches</Text>
              <Text style={styles.emptySubtext}>No identities found matching your current filter.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={!!editingFaculty} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Faculty Profile</Text>
               <TouchableOpacity onPress={() => setEditingFaculty(null)}>
                  <MaterialCommunityIcons name="close" size={24} color="white" />
               </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>Modifying credentials for {editingFaculty?.name}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditingFaculty(null)}>
              <Text style={styles.modalCloseText}>UPDATE IDENTITY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: Colors.midnight.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  facultyCard: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  facultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  details: {
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subtext: {
    color: Colors.midnight.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    marginTop: 12,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,51,51,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,51,51,0.1)',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.midnight.card,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    paddingBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  modalDesc: {
    color: Colors.midnight.textMuted,
    fontSize: 14,
    marginBottom: 40,
    fontWeight: '500',
  },
  modalCloseBtn: {
    backgroundColor: Colors.midnight.primary,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  modalCloseText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
