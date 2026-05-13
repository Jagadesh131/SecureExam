import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiService } from '../api';
import { Colors } from '../constants/theme';

export default function StudentAccessScreen() {
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    if (!examCode) return;
    
    setLoading(true);
    try {
      const examData = await ApiService.getExam(examCode);
      Alert.alert('EXAM SECURED', `Successfully connected to: ${examData.exam.exam_name}`);
      // Future: router.push({ pathname: '/take-exam', params: { examCode } });
    } catch (error) {
      Alert.alert('LINK FAILURE', error.message || 'Verification failed. Please check the Exam Code and your network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#000000', Colors.midnight.background]}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
            <Text style={styles.backText}>EXIT</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="shield-key" size={40} color={Colors.midnight.primary} />
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Secure Entry</Text>
              <Text style={styles.subtitle}>Enter your designated private access code to initialize the examination stream</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Access Token</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="EXAM-XXXX"
                    placeholderTextColor="#475569"
                    value={examCode}
                    onChangeText={(val) => setExamCode(val.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={12}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, (!examCode || loading) && styles.buttonDisabled]}
                disabled={!examCode || loading}
                onPress={handleProceed}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>INITIATE SESSION</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="white" style={{marginLeft: 10}} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.securityBriefing}>
               <View style={styles.briefIcon}>
                 <MaterialCommunityIcons name="wifi-lock" size={20} color={Colors.midnight.primary} />
               </View>
               <View style={{flex: 1}}>
                 <Text style={styles.briefTitle}>ENCRYPTED CONNECTION REQUIRED</Text>
                 <Text style={styles.briefText}>Maintain a stable link to the university backbone to prevent session termination.</Text>
               </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.midnight.background,
  },
  gradientHeader: {
    height: 180,
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },
  backText: {
    fontSize: 13,
    fontWeight: '900',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
  keyboardView: {
    flex: 1,
    marginTop: -80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    paddingTop: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logoBadge: {
    position: 'absolute',
    top: -42,
    alignSelf: 'center',
    width: 84,
    height: 84,
    backgroundColor: Colors.midnight.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.midnight.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.midnight.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  inputWrapper: {
    backgroundColor: '#000',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 4,
    color: 'white',
  },
  actionButton: {
    backgroundColor: Colors.midnight.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.5,
    shadowOpacity: 0,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  securityBriefing: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 24,
    borderRadius: 24,
    marginTop: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  briefIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  briefTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.midnight.primary,
    marginBottom: 6,
    letterSpacing: 1,
  },
  briefText: {
    fontSize: 13,
    color: Colors.midnight.textMuted,
    lineHeight: 18,
    fontWeight: '600',
  },
});
