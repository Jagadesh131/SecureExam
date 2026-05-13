import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // The computer's local IP address found via ipconfig
  // Ensure the phone and computer are on the same Wi-Fi!
  static const String baseUrl = 'http://172.25.51.163:5050/api';

  static Future<Map<String, dynamic>> getExam(String examCode) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/exam/$examCode'));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Exam not found or inactive');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  static Future<Map<String, dynamic>> submitExam(
      String examCode,
      String studentName,
      String regNumber,
      Map<String, String> answers) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/exam/$examCode/submit'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'student_name': studentName,
          'reg_number': regNumber,
          'answers': answers,
        }),
      );
      
      final data = json.decode(response.body);
      if (response.statusCode == 200) {
        return data;
      } else {
        throw Exception(data['error'] ?? 'Submission failed');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
