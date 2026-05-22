import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApiService } from '../../api';

export default function ManageQuestionsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Using hardcoded demo exam code
  const examCode = 'CS101-MID-2024'; 
  const examName = 'Data Structures Midterm';

  const [questions, setQuestions] = useState([]);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [form, setForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    difficulty: 'Medium'
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await ApiService.getQuestions(examCode);
      if (response && response.questions) {
        setQuestions(response.questions);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingQuestionId(null);
    setForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      difficulty: 'Medium'
    });
    setModalVisible(true);
  };

  const openEditModal = (q) => {
    setEditingQuestionId(q.id);
    setForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty || 'Medium'
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    // In React Native, Alert works for confirming
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this question?")) {
        confirmDelete(id);
      }
    } else {
      Alert.alert(
        "Delete Question",
        "Are you sure you want to delete this question?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => confirmDelete(id) }
        ]
      );
    }
  };

  const confirmDelete = async (id) => {
    try {
      const response = await ApiService.deleteQuestion(examCode, id);
      if (response.success) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        Alert.alert('Error', response.message || 'Failed to delete');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while deleting');
    }
  };

  const handleSave = async () => {
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      Alert.alert('Error', 'Please fill all question and option fields');
      return;
    }

    setIsSaving(true);
    try {
      let response;
      if (editingQuestionId) {
        response = await ApiService.updateQuestion(examCode, editingQuestionId, form);
      } else {
        response = await ApiService.addQuestion(examCode, form);
      }
      
      if (response.success) {
        setModalVisible(false);
        loadQuestions(); // Reload to get the new list with IDs
      } else {
        Alert.alert('Error', response.message || 'Failed to save question');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while saving question');
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
      
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#0F172A" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Manage Questions: {examName}</Text>
          <Text style={styles.headerSubtitle}>{questions.length} questions • Edit, Add, or Delete</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.addBtnText}>Add New Question</Text>
        </TouchableOpacity>

        {/* Questions List */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>All Questions ({questions.length})</Text>
          
          {questions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No questions added yet.</Text>
            </View>
          ) : (
            questions.map((q, index) => (
              <View key={q.id} style={styles.questionItem}>
                <View style={styles.qHeader}>
                  <Text style={styles.qText}>Q{index + 1}. {q.question_text}</Text>
                  <View style={styles.qActions}>
                    <TouchableOpacity style={styles.actionBtnEdit} onPress={() => openEditModal(q)}>
                      <MaterialCommunityIcons name="pencil" size={14} color="#3B82F6" />
                      <Text style={styles.actionBtnEditText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnDelete} onPress={() => handleDelete(q.id)}>
                      <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EF4444" />
                      <Text style={styles.actionBtnDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.optionsList}>
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const optionKey = `option_${opt.toLowerCase()}`;
                    const isCorrect = q.correct_answer === opt;
                    return (
                      <Text key={opt} style={[styles.optionText, isCorrect && styles.optionTextCorrect]}>
                        {opt}) {q[optionKey]}
                      </Text>
                    );
                  })}
                </View>

                <View style={styles.badgesRow}>
                  <View style={styles.badgeDiff}>
                    <Text style={styles.badgeDiffText}>{q.difficulty || 'Medium'}</Text>
                  </View>
                  <View style={styles.badgeAnswer}>
                    <Text style={styles.badgeAnswerText}>Answer: {q.correct_answer}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingQuestionId ? 'Edit Question' : 'Add New Question'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Question Text *</Text>
                <TextInput 
                  style={[styles.input, {minHeight: 80}]}
                  value={form.question_text}
                  onChangeText={(val) => setForm({...form, question_text: val})}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Option A *</Text>
                <TextInput style={styles.input} value={form.option_a} onChangeText={(val) => setForm({...form, option_a: val})} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Option B *</Text>
                <TextInput style={styles.input} value={form.option_b} onChangeText={(val) => setForm({...form, option_b: val})} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Option C *</Text>
                <TextInput style={styles.input} value={form.option_c} onChangeText={(val) => setForm({...form, option_c: val})} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Option D *</Text>
                <TextInput style={styles.input} value={form.option_d} onChangeText={(val) => setForm({...form, option_d: val})} />
              </View>

              <View style={styles.row}>
                <View style={[styles.col, {marginRight: 16}]}>
                  <Text style={styles.label}>Correct Answer *</Text>
                  <View style={styles.radioGroup}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <TouchableOpacity 
                        key={opt} 
                        style={[styles.radioBtn, form.correct_answer === opt && styles.radioBtnActive]}
                        onPress={() => setForm({...form, correct_answer: opt})}
                      >
                        <Text style={[styles.radioText, form.correct_answer === opt && styles.radioTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Difficulty *</Text>
                  <View style={styles.radioGroup}>
                    {['Easy', 'Medium', 'Hard'].map(diff => (
                      <TouchableOpacity 
                        key={diff} 
                        style={[styles.radioBtn, form.difficulty === diff && styles.radioBtnActiveDiff]}
                        onPress={() => setForm({...form, difficulty: diff})}
                      >
                        <Text style={[styles.radioText, form.difficulty === diff && styles.radioTextActiveDiff]}>{diff}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.modalSaveText}>Save Question</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    padding: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 60,
  },
  
  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 900,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  
  // Add Button
  addBtn: {
    backgroundColor: '#10B981', // Green from screenshot
    width: '100%',
    maxWidth: 900,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  addBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },

  // List Card
  listCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 900,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#64748B',
    fontSize: 15,
  },

  // Question Item
  questionItem: {
    borderWidth: 1,
    borderColor: '#BFDBFE', // Light blue border from screenshot
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  qText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    paddingRight: 16,
  },
  qActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionBtnEditText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionBtnDeleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  optionsList: {
    marginBottom: 16,
  },
  optionText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  optionTextCorrect: {
    color: '#10B981', // Green highlighting for correct answer
    fontWeight: '700',
  },

  badgesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeDiff: {
    backgroundColor: '#DBEAFE', // Light blue
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeDiffText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeAnswer: {
    backgroundColor: '#D1FAE5', // Light green
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeAnswerText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 700,
    borderRadius: 12,
    padding: 32,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
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
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  radioBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  radioText: {
    color: '#64748B',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#10B981',
  },
  radioBtnActiveDiff: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radioTextActiveDiff: {
    color: '#3B82F6',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1D61FF',
  },
  modalSaveText: {
    color: 'white',
    fontWeight: '700',
  },
});
