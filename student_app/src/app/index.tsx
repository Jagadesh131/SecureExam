import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// We mock the API login for now or use the actual endpoint later if we build a student auth endpoint.
// Currently students join by Name, Reg Number, and Exam Code.

export default function LoginScreen() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [examCode, setExamCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinExam = () => {
    if (!studentName || !regNumber || !examCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // In a real app, you would verify the examCode against the API here.
    // For now, we will pass these parameters to the exam screen.
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/exam',
        params: { studentName, regNumber, examCode }
      });
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>SecureExam Portal</Text>
        <Text style={styles.subtitle}>Enter your details to join</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9ca3af"
          value={studentName}
          onChangeText={setStudentName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Registration Number"
          placeholderTextColor="#9ca3af"
          value={regNumber}
          onChangeText={setRegNumber}
          autoCapitalize="characters"
        />

        <TextInput
          style={styles.input}
          placeholder="Exam Code"
          placeholderTextColor="#9ca3af"
          value={examCode}
          onChangeText={setExamCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleJoinExam}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Join Exam</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
