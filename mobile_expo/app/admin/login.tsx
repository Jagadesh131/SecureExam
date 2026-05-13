import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';
import Constants from 'expo-constants';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('Please enter all credentials');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await ApiService.adminLogin({ username, password });
      if (response.success) {
        router.push('/admin/dashboard');
      } else {
        setErrorMsg('Invalid Admin credentials');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.midnight.sidebar, '#111']}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.replace('/')}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
            <Text style={styles.backText}>Exit</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={styles.logoBadge}>
               <MaterialCommunityIcons name="shield-crown" size={40} color={Colors.midnight.primary} />
            </View>
            <Text style={styles.headerTitle}>SECURE ADMIN</Text>
            <Text style={styles.headerSubtitle}>System Control & Oversight</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.title}>System Authentication</Text>
            
            <View style={styles.form}>
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons name="alert-decagram" size={18} color={Colors.midnight.primary} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="shield-account" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Admin Username"
                    placeholderTextColor="#444"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Access Key</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="key-variant" size={20} color={Colors.midnight.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#444"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off" : "eye"} 
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
                    <Text style={styles.loginButtonText}>UNLOCK SYSTEM</Text>
                    <MaterialCommunityIcons name="lock-open-outline" size={20} color="white" style={{marginLeft: 8}} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.demoBox} 
              onPress={() => { setUsername('admin'); setPassword('admin123'); }}
            >
              <Text style={styles.demoText}>Quick Access: <Text style={{color: Colors.midnight.primary}}>Tap to populate</Text></Text>
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
    paddingHorizontal: 20,
  },
  gradientBackground: {
    height: 300,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,51,51,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,51,51,0.2)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.midnight.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  keyboardView: {
    flex: 1,
    marginTop: -80,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,51,51,0.1)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,51,51,0.2)',
  },
  errorText: {
    color: Colors.midnight.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.midnight.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: Colors.midnight.border,
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
  loginButton: {
    backgroundColor: Colors.midnight.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  demoBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 13,
    color: Colors.midnight.textMuted,
    fontWeight: '600',
  },
});
