import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'result_screen.dart';

class ExamScreen extends StatefulWidget {
  final String studentName;
  final String regNumber;
  final String examCode;

  const ExamScreen({
    super.key,
    required this.studentName,
    required this.regNumber,
    required this.examCode,
  });

  @override
  State<ExamScreen> createState() => _ExamScreenState();
}

class _ExamScreenState extends State<ExamScreen> {
  late Future<Map<String, dynamic>> _examFuture;
  Map<String, String> _answers = {};
  int _currentQuestionIndex = 0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _examFuture = ApiService.getExam(widget.examCode);
  }

  void _submitExam() async {
    setState(() => _isSubmitting = true);
    try {
      final result = await ApiService.submitExam(
        widget.examCode,
        widget.studentName,
        widget.regNumber,
        _answers,
      );
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => ResultScreen(
              score: result['score'],
              total: result['total'],
              percentage: result['percentage'].toDouble(),
              studentName: widget.studentName,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Exam: ${widget.examCode}'),
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _examFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final examData = snapshot.data!;
          final questions = examData['questions'] as List;

          if (questions.isEmpty) {
            return const Center(child: Text('No questions found for this exam.'));
          }

          final currentQuestion = questions[_currentQuestionIndex];
          final qId = currentQuestion['id'].toString();

          return Column(
            children: [
              LinearProgressIndicator(
                value: (_currentQuestionIndex + 1) / questions.length,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Question ${_currentQuestionIndex + 1} of ${questions.length}',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        currentQuestion['question_text'],
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 32),
                      ...['A', 'B', 'C', 'D'].map((opt) {
                        final optionText = currentQuestion['option_${opt.toLowerCase()}'];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            onTap: () {
                              setState(() {
                                _answers[qId] = opt;
                              });
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: _answers[qId] == opt
                                      ? const Color(0xFF6366F1)
                                      : Colors.grey[300]!,
                                  width: _answers[qId] == opt ? 2 : 1,
                                ),
                                borderRadius: BorderRadius.circular(12),
                                color: _answers[qId] == opt
                                    ? const Color(0xFF6366F1).withOpacity(0.05)
                                    : Colors.white,
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: _answers[qId] == opt
                                        ? const Color(0xFF6366F1)
                                        : Colors.grey[200],
                                    child: Text(
                                      opt,
                                      style: TextStyle(
                                        color: _answers[qId] == opt
                                            ? Colors.white
                                            : Colors.black,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(child: Text(optionText)),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (_currentQuestionIndex > 0)
                      TextButton(
                        onPressed: () {
                          setState(() => _currentQuestionIndex--);
                        },
                        child: const Text('Previous'),
                      )
                    else
                      const SizedBox(),
                    
                    if (_currentQuestionIndex < questions.length - 1)
                      ElevatedButton(
                        onPressed: _answers.containsKey(qId) 
                          ? () => setState(() => _currentQuestionIndex++)
                          : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Next Question'),
                      )
                    else
                      ElevatedButton(
                        onPressed: (_answers.containsKey(qId) && !_isSubmitting)
                          ? _confirmSubmit
                          : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                        ),
                        child: _isSubmitting 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white))
                          : const Text('Submit Exam'),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _confirmSubmit() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit Exam?'),
        content: const Text('Are you sure you want to finish and submit your answers?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _submitExam();
            },
            child: const Text('Submit', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
