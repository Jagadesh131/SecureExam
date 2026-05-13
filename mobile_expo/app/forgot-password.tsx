import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [facultyId, setFacultyId] = useState('');

  const isFormFilled = email.length > 0 || facultyId.length > 0;

  return (
    <LinearGradient
      colors={['#000000', Colors.midnight.background]} 
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <View style={styles.headerArea}>
          <SafeAreaView>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
              <Text style={styles.backText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <View style={styles.avatar}>
                <LinearGradient
                  colors={[Colors.midnight.primary, '#8B0000']}
                  style={styles.avatarGradient}
                >
                  <MaterialCommunityIcons name="key-variant" size={28} color="white" />
                </LinearGradient>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>Key Recovery</Text>
                <Text style={styles.subtitle}>Enter your identity tags to restore access</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Communication Link (Email)</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your.email@university.edu"
                      placeholderTextColor="#475569"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <Text style={styles.divider}>— OR —</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Faculty Identity Tag</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="account-key-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="FAC001"
                      placeholderTextColor="#475569"
                      value={facultyId}
                      onChangeText={setFacultyId}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isFormFilled ? styles.submitButtonActive : styles.submitButtonDisabled]}
                  disabled={!isFormFilled}
                >
                  <Text style={[styles.submitButtonText, isFormFilled ? styles.submitButtonTextActive : styles.submitButtonTextDisabled]}>
                    INITIATE RECOVERY
                  </Text>
                  {isFormFilled && <MaterialCommunityIcons name="chevron-right" size={20} color="white" style={{marginLeft: 8}} />}
                </TouchableOpacity>

              </View>
            </View>

            <TouchableOpacity style={styles.helpBox}>
               <Text style={styles.helpText}>Need immediate assistance? Contact <Text style={{color: Colors.midnight.primary, fontWeight: '900'}}>System Admin</Text></Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerArea: {
    height: 120,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 12,
  },
  backText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 10,
    letterSpacing: 1,
  },
  keyboardView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    paddingTop: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
    position: 'relative',
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 24,
    position: 'absolute',
    top: -42,
    alignSelf: 'center',
    backgroundColor: Colors.midnight.card,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.midnight.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.midnight.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: '#475569',
    fontWeight: '900',
    fontSize: 11,
    marginVertical: 12,
    letterSpacing: 2,
  },
  submitButton: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonActive: {
    backgroundColor: Colors.midnight.primary,
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  submitButtonTextActive: {
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#94A3B8',
  },
  helpBox: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  }
});
