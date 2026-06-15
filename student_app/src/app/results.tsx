import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultsScreen() {
  const router = useRouter();
  const { score, percentage, total, studentName } = useLocalSearchParams();

  // Determine grade colors based on percentage
  const numPercentage = parseFloat(percentage);
  let gradeColor = '#ef4444'; // Red for fail
  let gradeText = 'Failed';

  if (numPercentage >= 90) {
    gradeColor = '#10b981'; // Green
    gradeText = 'Excellent!';
  } else if (numPercentage >= 75) {
    gradeColor = '#3b82f6'; // Blue
    gradeText = 'Great Job!';
  } else if (numPercentage >= 50) {
    gradeColor = '#f59e0b'; // Yellow
    gradeText = 'Passed';
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Exam Completed</Text>
        <Text style={styles.subtitle}>Thank you, {studentName}</Text>

        <View style={styles.scoreCircle}>
          <Text style={[styles.percentageText, { color: gradeColor }]}>
            {numPercentage}%
          </Text>
          <Text style={styles.fractionText}>
            {score} / {total} Correct
          </Text>
        </View>

        <Text style={[styles.gradeText, { color: gradeColor }]}>
          {gradeText}
        </Text>

        <TouchableOpacity 
          style={styles.homeButton} 
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
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
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f9fafb',
    borderWidth: 8,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '900',
  },
  fractionText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '600',
  },
  gradeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
  },
  homeButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
