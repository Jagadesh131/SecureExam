import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import FacultySubScreen from '../../components/FacultySubScreen';
import { Colors } from '../../constants/theme';
import { ApiService } from '../../api';

export default function BulkUploadScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadResult(null);
      }
    } catch (err) {
      console.log('Error selecting file', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'text/csv'
      });

      // Send to API
      // We assume CS101-MID-2024 for demo purposes, normally would be dynamic
      const response = await fetch(`${ApiService.API_BASE_URL}/api/faculty/exam/CS101-MID-2024/bulk_upload`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setUploadResult({
        success: response.ok,
        message: result.message || 'Upload failed',
      });
      if (response.ok) {
        setSelectedFile(null);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Network error occurred during upload',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FacultySubScreen title="Bulk Upload Questions" icon="upload">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bulk Upload Questions</Text>
        
        <View style={styles.uploadZone}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={48} color="#1D61FF" style={styles.uploadIcon} />
          <Text style={styles.uploadText}>Drop CSV file here or click to browse</Text>
          
          <TouchableOpacity 
            style={styles.chooseFileBtn} 
            onPress={handleSelectFile}
            disabled={isUploading}
          >
            <Text style={styles.chooseFileBtnText}>Choose File</Text>
          </TouchableOpacity>
          
          {selectedFile && (
            <View style={styles.selectedFileContainer}>
              <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
              <TouchableOpacity onPress={() => setSelectedFile(null)} disabled={isUploading}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {uploadResult && (
          <View style={[styles.resultBox, uploadResult.success ? styles.resultSuccess : styles.resultError]}>
            <Text style={[styles.resultText, uploadResult.success ? styles.resultTextSuccess : styles.resultTextError]}>
              {uploadResult.message}
            </Text>
          </View>
        )}

        {selectedFile && !uploadResult?.success && (
          <TouchableOpacity 
            style={[styles.uploadBtn, isUploading && styles.uploadBtnDisabled]} 
            onPress={handleUpload}
            disabled={isUploading}
          >
            <Text style={styles.uploadBtnText}>
              {isUploading ? 'Uploading...' : 'Upload Questions'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.templateBox}>
        <Text style={styles.templateText}>Need a template?</Text>
        <TouchableOpacity>
          <Text style={styles.templateLink}>Download Sample CSV</Text>
        </TouchableOpacity>
      </View>
    </FacultySubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  uploadZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  chooseFileBtn: {
    backgroundColor: '#1D61FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  chooseFileBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedFileName: {
    fontSize: 13,
    color: '#0F172A',
    marginRight: 8,
  },
  uploadBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resultBox: {
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  resultSuccess: {
    backgroundColor: '#D1FAE5',
  },
  resultError: {
    backgroundColor: '#FEE2E2',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultTextSuccess: {
    color: '#065F46',
  },
  resultTextError: {
    color: '#991B1B',
  },
  templateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
  },
  templateText: {
    fontSize: 13,
    color: '#64748B',
  },
  templateLink: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
