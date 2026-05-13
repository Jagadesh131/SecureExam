import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { ApiService } from '../api';
export default function FacultySignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Required credentials missing');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Access keys do not match');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await ApiService.facultyRegister({
        name: fullName,
        email,
        phone,
        birthday,
        department,
        password,
        confirm_password: confirmPassword
      });

      if (data.success) {
        alert(`REGISTRATION COMPLETE\nYour Faculty ID: ${data.faculty_id}`);
        router.push('/faculty-login');
      } else {
        setErrorMsg(data.message || 'Registration failure');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Communication link failure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', Colors.midnight.background]} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerArea}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
            <Text style={styles.backText}>BACK TO PORTAL</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="account-plus" size={32} color={Colors.midnight.primary} />
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>Faculty Roster</Text>
                <Text style={styles.subtitle}>Initialize your secure faculty profile</Text>
              </View>

              <View style={styles.form}>
                {errorMsg ? (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.midnight.error} />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Identity Name</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="Dr. John Doe" placeholderTextColor="#475569" value={fullName} onChangeText={setFullName} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Communication Link (Email)</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="john.doe@university.edu" placeholderTextColor="#475569" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Academic Department</Text>
                  <View style={styles.dropdown}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                      <MaterialCommunityIcons name="domain" size={20} color={Colors.midnight.primary} />
                      <Text style={{ color: 'white', fontWeight: '700' }}>{department}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.midnight.textMuted} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Secure Access Key</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#475569" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.midnight.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verify Access Key</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="check-decagram-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#475569" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isLoading && { opacity: 0.8 }]} 
                  onPress={handleSignup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>FINALIZE REGISTRATION</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/faculty-login')}>
                  <Text style={styles.footerText}>ALREADY REGISTERED? <Text style={styles.linkText}>SIGN IN</Text></Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 20, paddingTop: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: 'white', fontSize: 13, fontWeight: '900', marginLeft: 10, letterSpacing: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    marginTop: 40,
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
    top: -40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    backgroundColor: Colors.midnight.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.midnight.textMuted, fontWeight: '500' },
  form: { width: '100%' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: { color: Colors.midnight.error, fontSize: 13, fontWeight: '700', marginLeft: 8, flex: 1 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 11, fontWeight: '900', color: Colors.midnight.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: 'white', fontWeight: '600' },
  eyeIcon: { padding: 8 },
  dropdown: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: Colors.midnight.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  submitButtonText: { color: 'white', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  loginLink: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 12, color: Colors.midnight.textMuted, fontWeight: '800', letterSpacing: 0.5 },
  linkText: { color: Colors.midnight.primary, fontWeight: '900' }
});
