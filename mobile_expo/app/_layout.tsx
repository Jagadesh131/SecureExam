import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="faculty-login" />
        <Stack.Screen name="faculty-dashboard" />
        <Stack.Screen name="student-access" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
