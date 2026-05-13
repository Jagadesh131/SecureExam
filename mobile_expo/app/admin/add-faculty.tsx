import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';
import Constants from 'expo-constants';

export default function AdminAddFacultyScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    faculty_id: '',
    department: '',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.faculty_id || !formData.department) {
      Alert.alert("MISSING CREDENTIALS", "Please provide all required identity parameters to proceed.");
      return;
    }

    setLoading(true);
    try {
      const data = await ApiService.facultyRegister(formData);
      
      if (data.success) {
        Alert.alert("IDENTITY SECURED", "Faculty account successfully initialized within the system cluster.", [
          { text: "PROCEED", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("REGISTRATION FAILURE", data.message || "Failed to link identity stream.");
      }
    } catch (error) {
      Alert.alert("NETWORK FAILURE", error.message || "Unable to establish link with the primary registration cluster.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Register Faculty</Text>
          <Text style={styles.headerSubtitle}>Authorized Identity Creation</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="account-plus" size={40} color={Colors.midnight.primary} />
            </View>
            <Text style={styles.formTitle}>Identity Profile</Text>
            <Text style={styles.formSubtitle}>System will automatically assign 'password123' as the initial access key.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Legal Name</Text>
              <View style={styles.inputWrapper}>
                 <MaterialCommunityIcons name="account-outline" size={20} color="#475569" style={styles.inputIcon} />
                 <TextInput
                   style={styles.input}
                   placeholder="Professor John Doe"
                   placeholderTextColor="#475569"
                   value={formData.name}
                   onChangeText={(v) => updateField('name', v)}
                 />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institutional Email</Text>
              <View style={styles.inputWrapper}>
                 <MaterialCommunityIcons name="email-outline" size={20} color="#475569" style={styles.inputIcon} />
                 <TextInput
                   style={styles.input}
                   placeholder="faculty.member@university.edu"
                   placeholderTextColor="#475569"
                   keyboardType="email-address"
                   autoCapitalize="none"
                   value={formData.email}
                   onChangeText={(v) => updateField('email', v)}
                 />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
                <Text style={styles.label}>Faculty ID</Text>
                <View style={styles.inputWrapper}>
                   <TextInput
                     style={[styles.input, { paddingLeft: 20 }]}
                     placeholder="FAC-001"
                     placeholderTextColor="#475569"
                     autoCapitalize="characters"
                     value={formData.faculty_id}
                     onChangeText={(v) => updateField('faculty_id', v.toUpperCase())}
                   />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.inputWrapper}>
                   <TextInput
                     style={[styles.input, { paddingLeft: 20 }]}
                     placeholder="CSE"
                     placeholderTextColor="#475569"
                     autoCapitalize="characters"
                     value={formData.department}
                     onChangeText={(v) => updateField('department', v.toUpperCase())}
                   />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text style={styles.submitText}>COMMIT IDENTITY</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="white" style={{marginLeft: 10}} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.securityBriefing}>
             <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10B981" />
             <Text style={styles.briefText}>New credentials are encrypted upon submission and synchronized with the primary authentication cluster.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 24,
    paddingBottom: 60,
  },
  formCard: {
    backgroundColor: Colors.midnight.card,
    borderRadius: 40,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.midnight.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 5,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.1)',
  },
  formTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    color: Colors.midnight.textMuted,
    fontSize: 13,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 28,
  },
  label: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 18,
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  submitBtn: {
    backgroundColor: Colors.midnight.primary,
    width: '100%',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: Colors.midnight.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  submitText: {
    color: 'white',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 14,
  },
  securityBriefing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    marginTop: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.05)',
  },
  briefText: {
    flex: 1,
    color: '#10B981',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});
