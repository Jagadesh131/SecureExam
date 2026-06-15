import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchExamDetails, submitExam } from '../api';

export default function ExamScreen() {
  const router = useRouter();
  const { studentName, regNumber, examCode } = useLocalSearchParams();

  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadExam();
  }, [examCode]);

  const loadExam = async () => {
    try {
      const data = await fetchExamDetails(examCode);
      setExamInfo(data.exam);
      setQuestions(data.questions);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not load exam');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert(
        'Incomplete', 
        'You have not answered all questions. Are you sure you want to submit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', style: 'destructive', onPress: confirmSubmit }
        ]
      );
    } else {
      confirmSubmit();
    }
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        student_name: studentName,
        reg_number: regNumber,
        answers: answers
      };
      
      const result = await submitExam(examCode, payload);
      
      router.replace({
        pathname: '/results',
        params: { 
          score: result.score, 
          percentage: result.percentage, 
          total: result.total_questions,
          studentName 
        }
      });
      
    } catch (error) {
      Alert.alert('Submission Failed', error.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10 }}>Loading Exam...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{examInfo?.exam_name || 'Live Exam'}</Text>
        <Text style={styles.headerSubtitle}>Subject: {examInfo?.subject}</Text>
        <Text style={styles.headerStudent}>{studentName} ({regNumber})</Text>
      </View>

      <ScrollView style={styles.scrollArea}>
        {questions.map((q, index) => (
          <View key={q.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{index + 1}. {q.question_text}</Text>
            
            {['A', 'B', 'C', 'D'].map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionButton,
                  answers[q.id] === opt && styles.optionSelected
                ]}
                onPress={() => handleSelectOption(q.id, opt)}
              >
                <Text style={[
                  styles.optionText,
                  answers[q.id] === opt && styles.optionTextSelected
                ]}>
                  {opt}. {q[`option_${opt.toLowerCase()}`]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Submit Exam</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: 16,
    marginTop: 4,
  },
  headerStudent: {
    color: '#e0e7ff',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.8,
  },
  scrollArea: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  optionSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
