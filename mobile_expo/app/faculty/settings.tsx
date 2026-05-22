import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, useWindowDimensions, Platform, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApiService } from '../../api';
import FacultySidebar from '../../components/FacultySidebar';

export default function ExamSettingsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const examCode = 'CS101-MID-2024'; // Hardcoded for demo, normally fetched from context/params
  
  const [settings, setSettings] = useState({
    exam_name: '',
    subject: '',
    duration: '60',
    instructions: '',
    passing_percentage: 40,
    randomize_questions: false,
    shuffle_options: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await ApiService.getExam(examCode);
      if (response && response.exam) {
        setSettings({
          exam_name: response.exam.exam_name || '',
          subject: response.exam.subject || '',
          duration: response.exam.duration?.toString() || '60',
          instructions: response.exam.instructions || '',
          passing_percentage: response.exam.passing_percentage || 40,
          randomize_questions: !!response.exam.randomize_questions,
          shuffle_options: !!response.exam.shuffle_options
        });
      }
    } catch (error) {
      console.error('Failed to load exam settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...settings,
        duration: parseInt(settings.duration) || 60,
      };
      const response = await ApiService.updateExamSettings(examCode, payload);
      if (response.success) {
        Alert.alert('Success', 'Exam settings saved successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to save settings');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const MainContent = () => (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentScroll} showsVerticalScrollIndicator={false}>
      
      {/* Share Link Card */}
      <View style={styles.shareCard}>
        <View style={styles.shareIconBox}>
          <MaterialCommunityIcons name="link-variant" size={24} color="#10B981" />
        </View>
        <View style={styles.shareContent}>
          <Text style={styles.shareTitle}>Share Exam Link</Text>
          <Text style={styles.shareSubtitle}>Share this link with students to let them access the exam</Text>
          <View style={styles.linkBox}>
            <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
              https://secureexam.university.edu/student/access?code={examCode}
            </Text>
          </View>
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.copyBtn}>
              <MaterialCommunityIcons name="content-copy" size={16} color="white" />
              <Text style={styles.copyBtnText}>Copy Link</Text>
            </TouchableOpacity>
            <Text style={styles.codeText}>Code: <Text style={styles.codeHighlight}>{examCode}</Text></Text>
          </View>
          <Text style={styles.shareNote}>Students can also enter just the code "{examCode}" on the student access page</Text>
        </View>
      </View>

      {/* Basic Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        
        <Text style={styles.label}>Exam Name</Text>
        <TextInput 
          style={styles.input}
          value={settings.exam_name}
          onChangeText={(text) => setSettings({...settings, exam_name: text})}
          placeholder="e.g. Data Structures Midterm"
        />

        <View style={styles.row}>
          <View style={[styles.col, {marginRight: 16}]}>
            <Text style={styles.label}>Subject</Text>
            <TextInput 
              style={styles.input}
              value={settings.subject}
              onChangeText={(text) => setSettings({...settings, subject: text})}
              placeholder="e.g. Computer Science"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput 
              style={styles.input}
              value={settings.duration}
              onChangeText={(text) => setSettings({...settings, duration: text})}
              keyboardType="number-pad"
              placeholder="60"
            />
          </View>
        </View>
      </View>

      {/* Instructions Editor */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Instructions Editor</Text>
        <View style={styles.textAreaContainer}>
          <TextInput 
            style={styles.textArea}
            value={settings.instructions}
            onChangeText={(text) => setSettings({...settings, instructions: text})}
            multiline={true}
            numberOfLines={4}
            placeholder="Answer all questions. No negative marking. Use of calculators is not allowed."
            textAlignVertical="top"
          />
          <MaterialCommunityIcons name="resize-bottom-right" size={16} color="#CBD5E1" style={styles.resizeIcon} />
        </View>
      </View>

      {/* Advanced Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advanced Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={{flex: 1}}>
            <Text style={styles.settingLabel}>Passing Percentage</Text>
            {/* Fake Slider for Visual Match */}
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, {width: `${settings.passing_percentage}%`}]} />
              <View style={[styles.sliderThumb, {left: `${settings.passing_percentage}%`}]} />
            </View>
          </View>
          <Text style={styles.percentageText}>{settings.passing_percentage}%</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{flex: 1}}>
            <Text style={styles.settingLabel}>Randomize Questions</Text>
            <Text style={styles.settingDesc}>Show questions in random order</Text>
          </View>
          <Switch 
            value={settings.randomize_questions} 
            onValueChange={(val) => setSettings({...settings, randomize_questions: val})}
            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
            thumbColor={settings.randomize_questions ? "#1D61FF" : "#FFFFFF"}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{flex: 1}}>
            <Text style={styles.settingLabel}>Shuffle Options</Text>
            <Text style={styles.settingDesc}>Randomize answer options (A,B,C,D)</Text>
          </View>
          <Switch 
            value={settings.shuffle_options} 
            onValueChange={(val) => setSettings({...settings, shuffle_options: val})}
            trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
            thumbColor={settings.shuffle_options ? "#1D61FF" : "#FFFFFF"}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveBtn} 
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveBtnText}>Save Settings</Text>
        )}
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#1D61FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.layout, isDesktop ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
        {isDesktop && <FacultySidebar />}
        <MainContent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  layout: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mainContentScroll: {
    padding: 32,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Share Card
  shareCard: {
    backgroundColor: '#F0FDF4', // Very light green
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 24,
    flexDirection: 'row',
    marginBottom: 24,
  },
  shareIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
  },
  shareSubtitle: {
    fontSize: 13,
    color: '#047857',
    marginTop: 4,
    marginBottom: 16,
  },
  linkBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  linkText: {
    color: '#64748B',
    fontSize: 13,
  },
  shareActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  copyBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  codeText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
  },
  codeHighlight: {
    fontWeight: '800',
  },
  shareNote: {
    fontSize: 11,
    color: '#047857',
  },

  // Standard Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  
  // Text Area
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  textArea: {
    padding: 16,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 120,
  },
  resizeIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },

  // Advanced Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  
  // Fake Slider
  sliderTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 12,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1D61FF',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1D61FF',
    marginLeft: -8,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D61FF',
    marginLeft: 16,
  },

  saveBtn: {
    backgroundColor: '#1D61FF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
