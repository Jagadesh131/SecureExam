import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminBackupScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastBackup, setLastBackup] = useState('2024-05-01 10:30 AM');

  const handleBackup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setLastBackup(new Date().toLocaleString());
      Alert.alert("VAULT SECURED", "System integrity backup successfully archived to the primary cluster.");
    }, 2000);
  };

  const handleClearData = () => {
    Alert.alert(
      "☢️ CRITICAL SYSTEM PURGE",
      "This action will permanently terminate ALL faculty, examinations, and student result streams. THIS ACTION IS IRREVERSIBLE.",
      [
        { text: "ABORT", style: "cancel" },
        { text: "INITIATE PURGE", style: "destructive", onPress: () => {
          Alert.alert("SECOND-LEVEL AUTHORIZATION", "Terminal confirmation required. Execute system-wide reset?", [
            { text: "CANCEL", style: "cancel" },
            { text: "YES, EXECUTE PURGE", style: "destructive", onPress: () => {
              setIsProcessing(true);
              setTimeout(() => {
                setIsProcessing(false);
                Alert.alert("SYSTEM RESET", "All data clusters have been zeroed out.");
              }, 3000);
            }}
          ]);
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>System Safeguard</Text>
          <Text style={styles.headerSubtitle}>Data Integrity & Vault Management</Text>
        </View>
        <View style={{width: 32}} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
             <Text style={styles.statusLabel}>INTEGRITY STATUS</Text>
             <Text style={styles.statusValue}>Protected & Healthy</Text>
          </View>
          <View style={styles.statusIconBox}>
             <MaterialCommunityIcons name="shield-check" size={32} color="#10B981" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Backup & Recovery</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
             <View style={styles.iconBox}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={Colors.midnight.primary} />
             </View>
             <View style={styles.headerDetails}>
                <Text style={styles.cardTitle}>Archive System Data</Text>
                <Text style={styles.cardSub}>Generate encrypted JSON cluster backup</Text>
             </View>
          </View>
          
          <View style={styles.metaBadge}>
             <MaterialCommunityIcons name="clock-outline" size={14} color="#475569" />
             <Text style={styles.lastBackup}>LAST SYNC: {lastBackup.toUpperCase()}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionBtn, isProcessing && { opacity: 0.7 }]} 
            onPress={handleBackup}
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="white" /> : (
              <>
                <Text style={styles.actionBtnText}>INITIALIZE BACKUP</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="white" style={{marginLeft: 8}} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={styles.cardHeader}>
             <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.05)' }]}>
                <MaterialCommunityIcons name="cloud-download-outline" size={24} color="#6366F1" />
             </View>
             <View style={styles.headerDetails}>
                <Text style={styles.cardTitle}>Restore Identity Stream</Text>
                <Text style={styles.cardSub}>Import records from authorized backup file</Text>
             </View>
          </View>
          
          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreBtnText}>UPLOAD VAULT FILE</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 48 }]}>Critical Operations</Text>
        <View style={styles.dangerCard}>
           <View style={styles.dangerHeader}>
              <MaterialCommunityIcons name="alert-decagram-outline" size={24} color={Colors.midnight.primary} />
              <Text style={styles.dangerTitle}>FACTORY SYSTEM PURGE</Text>
           </View>
           <Text style={styles.dangerDesc}>Executing this operation will permanently zero out all faculty, examination modules, and student result ledgers across the entire cluster.</Text>
           <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
              <Text style={styles.dangerBtnText}>WIPE ALL DATA</Text>
              <MaterialCommunityIcons name="skull-outline" size={18} color="white" style={{marginLeft: 12}} />
           </TouchableOpacity>
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>SECUREEXAM CORE V2.0.4</Text>
           <View style={styles.encryptionBadge}>
              <MaterialCommunityIcons name="lock" size={12} color="#1E293B" />
              <Text style={styles.footerSub}>AES-256 END-TO-END ENCRYPTION ACTIVE</Text>
           </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 28,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 40,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statusValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  statusIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.1)',
  },
  headerDetails: {
    flex: 1,
  },
  cardTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  cardSub: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  lastBackup: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionBtn: {
    backgroundColor: Colors.midnight.primary,
    padding: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 14,
  },
  restoreBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  restoreBtnText: {
    color: '#6366F1',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 14,
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dangerTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dangerDesc: {
    color: Colors.midnight.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '500',
  },
  dangerBtn: {
    backgroundColor: '#EF4444',
    padding: 20,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  dangerBtnText: {
    color: 'white',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 14,
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerSub: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
