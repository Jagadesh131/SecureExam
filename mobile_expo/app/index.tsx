import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function WelcomeScreen() {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);

  const handleLogoPress = () => {
    const nextTaps = logoTaps + 1;
    if (nextTaps >= 5) {
      setLogoTaps(0);
      setShowPinModal(true);
      setPinCode('');
      setPinError(false);
    } else {
      setLogoTaps(nextTaps);
    }
  };

  const handlePinSubmit = () => {
    if (pinCode === '91949') { // Master Passcode
      setShowPinModal(false);
      router.push('/admin/login');
    } else {
      setPinError(true);
      setPinCode('');
    }
  };

  return (
    <LinearGradient
      colors={['#000000', Colors.midnight.background]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="shield-check" size={64} color={Colors.midnight.primary} />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>SECURE<Text style={{color: Colors.midnight.primary}}>EXAM</Text></Text>
            <Text style={styles.subtitle}>MISSION CRITICAL ASSESSMENT PORTAL</Text>
          </View>

          <View style={styles.cardsContainer}>
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push('/faculty-login')}
            >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 51, 51, 0.1)' }]}>
                <MaterialCommunityIcons name="shield-account" size={30} color={Colors.midnight.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Faculty Portal</Text>
                <Text style={styles.cardSubtitle}>Intelligence & Management</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.midnight.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push('/student-access')}
            >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                <MaterialCommunityIcons name="account-group" size={30} color="white" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Student Entry</Text>
                <Text style={styles.cardSubtitle}>Initiate Examination Stream</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.midnight.textMuted} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showPinModal} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="lock-alert" size={48} color={pinError ? Colors.midnight.error : Colors.midnight.primary} style={{marginBottom: 16}} />
            <Text style={styles.modalTitle}>SYSTEM OVERRIDE</Text>
            <Text style={styles.modalSubtitle}>Enter Master Passcode to continue</Text>
            
            <TextInput 
              style={[styles.pinInput, pinError && {borderColor: Colors.midnight.error}]}
              value={pinCode}
              onChangeText={(val) => { setPinCode(val); setPinError(false); }}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              onSubmitEditing={handlePinSubmit}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowPinModal(false)}>
                <Text style={styles.modalBtnCancelText}>ABORT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSubmit} onPress={handlePinSubmit}>
                <Text style={styles.modalBtnSubmitText}>AUTHORIZE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.midnight.textMuted,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.midnight.card,
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.midnight.textMuted,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: Colors.midnight.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinInput: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 16,
    letterSpacing: 8,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.midnight.primary,
    alignItems: 'center',
  },
  modalBtnSubmitText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});
