import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import FacultySidebar from './FacultySidebar';

export default function FacultySubScreen({ title, icon, children }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {!isDesktop && (
        <Modal visible={isSidebarOpen} animationType="slide" transparent={true} onRequestClose={() => setIsSidebarOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.mobileSidebarContainer}>
              <FacultySidebar />
            </View>
            <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsSidebarOpen(false)} />
          </View>
        </Modal>
      )}

      <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
        {isDesktop && <FacultySidebar />}
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            {!isDesktop && (
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <MaterialCommunityIcons name="chevron-left" size={28} color="#0F172A" />
              </TouchableOpacity>
            )}
            <View style={styles.titleWrapper}>
              <MaterialCommunityIcons name={icon} size={24} color="#1D61FF" style={styles.titleIcon} />
              <Text style={styles.title}>{title}</Text>
            </View>
            {!isDesktop ? (
              <TouchableOpacity style={styles.hamburgerBtn} onPress={() => setIsSidebarOpen(true)}>
                <MaterialCommunityIcons name="menu" size={28} color="#0F172A" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {children || (
              <View style={styles.placeholder}>
                <MaterialCommunityIcons name="progress-wrench" size={64} color="#CBD5E1" />
                <Text style={styles.placeholderText}>{title} Module</Text>
                <Text style={styles.placeholderSub}>This feature is coming soon in Phase 2.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  hamburgerBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  modalCloseArea: {
    flex: 1,
  },
  mobileSidebarContainer: {
    width: 260,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 20,
  },
  placeholderSub: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});
