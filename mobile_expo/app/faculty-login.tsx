import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { ApiService } from '../api';
export default function FacultyLoginScreen() {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!facultyId || !password) {
      setErrorMsg('Please enter both Faculty ID and password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await ApiService.facultyLogin({ faculty_id: facultyId, password });

      if (data.success) {
        router.push({
          pathname: '/faculty-dashboard',
          params: { facultyId: data.user.id, facultyName: data.user.name }
        });
      } else {
        setErrorMsg(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', Colors.midnight.background]}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={styles.logoBadge}>
               <MaterialCommunityIcons name="shield-check" size={40} color={Colors.midnight.primary} />
            </View>
            <Text style={styles.headerTitle}>SECURE<Text style={{color: Colors.midnight.primary}}>EXAM</Text></Text>
            <Text style={styles.headerSubtitle}>FACULTY INTELLIGENCE PORTAL</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Faculty Access</Text>
              <Text style={styles.subtitle}>Secure authentication required for entry</Text>
            </View>

            <View style={styles.form}>
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.midnight.error} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Identity Tag</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-key-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. FAC-123456"
                    placeholderTextColor="#475569"
                    value={facultyId}
                    onChangeText={(val) => setFacultyId(val.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Access Key</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={Colors.midnight.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && { opacity: 0.8 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>INITIATE ENTRY</Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="white" style={{marginLeft: 8}} />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text style={styles.linkText}>RECOVER KEY</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={() => router.push('/faculty-signup')}>
                  <Text style={styles.linkText}>NEW ROSTER</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.demoBox} 
              onPress={() => { setFacultyId('FAC001'); setPassword('password123'); }}
            >
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>SYSTEM BYPASS</Text>
              </View>
              <Text style={styles.demoText}>Auto-fill test credentials</Text>
            </TouchableOpacity>
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
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gradientBackground: {
    height: 320,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
    width: 80,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.midnight.textMuted,
    marginTop: 8,
    fontWeight: '800',
    letterSpacing: 2,
  },
  keyboardView: {
    flex: 1,
    marginTop: -60,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
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
    fontSize: 14,
    color: Colors.midnight.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
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
  errorText: {
    color: Colors.midnight.error,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
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
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: Colors.midnight.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
  },
  linkText: {
    color: Colors.midnight.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  demoBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
  },
  demoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});

