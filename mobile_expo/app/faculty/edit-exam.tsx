import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { ApiService } from '../../api';
import FacultySubScreen from '../../components/FacultySubScreen'; // Fallback layout wrapper for mobile

export default function EditExamScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Using the hardcoded demo exam code just like settings, or from context
  const examCode = 'CS101-MID-2024'; 

  const [form, setForm] = useState({
    exam_name: '',
    subject: '',
    duration: '60',
    passing_percentage: '40',
    instructions: ''
  });

  useEffect(() => {
    loadExamData();
  }, []);

  const loadExamData = async () => {
    try {
      const response = await ApiService.getExam(examCode);
      if (response && response.exam) {
        setForm({
          exam_name: response.exam.exam_name || '',
          subject: response.exam.subject || '',
          duration: response.exam.duration?.toString() || '60',
          passing_percentage: response.exam.passing_percentage?.toString() || '40',
          instructions: response.exam.instructions || ''
        });
      }
    } catch (error) {
      console.error('Failed to load exam data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.exam_name || !form.subject || !form.duration || !form.passing_percentage) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        exam_name: form.exam_name,
        subject: form.subject,
        duration: parseInt(form.duration) || 60,
        passing_percentage: parseInt(form.passing_percentage) || 40,
        instructions: form.instructions,
        // Preserve other settings we don't edit here (if they exist)
        randomize_questions: false, 
        shuffle_options: false
      };
      
      const response = await ApiService.updateExamSettings(examCode, payload);
      
      if (response.success) {
        Alert.alert('Success', 'Exam updated successfully', [
          { text: 'OK', onPress: () => router.push('/faculty-dashboard') }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update exam');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while updating exam');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#1D61FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Edit Exam</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Exam Name *</Text>
            <TextInput 
              style={styles.input}
              value={form.exam_name}
              onChangeText={(text) => setForm({...form, exam_name: text})}
              placeholder="e.g. Data Structures Midterm"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput 
              style={styles.input}
              value={form.subject}
              onChangeText={(text) => setForm({...form, subject: text})}
              placeholder="e.g. Computer Science"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.col, {marginRight: 16}]}>
              <Text style={styles.label}>Duration (minutes) *</Text>
              <TextInput 
                style={styles.input}
                value={form.duration}
                onChangeText={(text) => setForm({...form, duration: text})}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Passing Percentage *</Text>
              <TextInput 
                style={styles.input}
                value={form.passing_percentage}
                onChangeText={(text) => setForm({...form, passing_percentage: text})}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Instructions</Text>
            <View style={styles.textAreaContainer}>
              <TextInput 
                style={styles.textArea}
                value={form.instructions}
                onChangeText={(text) => setForm({...form, instructions: text})}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Answer all questions. No negative marking. Use of calculators is not allowed."
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.updateBtn} 
              onPress={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.updateBtnText}>Update Exam</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 32,
    alignItems: 'center', // Centers the card horizontally
    justifyContent: 'center', // Centers vertically if content is short
    minHeight: '100%',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 700, // Maximum width for desktop/tablet view
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  col: {
    flex: 1,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    padding: 16,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  updateBtn: {
    flex: 1,
    backgroundColor: '#1D61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0', // light gray
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
