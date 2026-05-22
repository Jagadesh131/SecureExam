import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FacultySubScreen from '../../components/FacultySubScreen';
import { ApiService } from '../../api';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // A simple predefined color palette to cycle through for new categories
  const colorPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Assuming CS101-MID-2024 as default active exam for demo purposes
      const response = await fetch(`${ApiService.API_BASE_URL}/api/faculty/exam/CS101-MID-2024/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name.');
      return;
    }

    try {
      const response = await fetch(`${ApiService.API_BASE_URL}/api/faculty/exam/CS101-MID-2024/category/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: selectedColor,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setNewCategoryName('');
        // Pick a random new color for the next category
        setSelectedColor(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
        fetchCategories();
      } else {
        Alert.alert('Error', data.message || 'Failed to add category');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Could not add category.');
    }
  };

  const handleDeleteCategory = async (categoryId, name) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? Questions in this category will become uncategorized.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${ApiService.API_BASE_URL}/api/faculty/category/${categoryId}/delete`, {
                method: 'DELETE',
              });
              const data = await response.json();
              if (data.success) {
                fetchCategories();
              } else {
                Alert.alert('Error', data.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Network error while deleting.');
            }
          }
        }
      ]
    );
  };

  return (
    <FacultySubScreen title="Question Categories" icon="tag-multiple">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add New Category</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Category name..."
            placeholderTextColor="#94A3B8"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TouchableOpacity 
            style={[styles.colorBox, { backgroundColor: selectedColor }]}
            onPress={() => {
              // Cycle through colors on tap
              const currentIndex = colorPalette.indexOf(selectedColor);
              const nextIndex = (currentIndex + 1) % colorPalette.length;
              setSelectedColor(colorPalette[nextIndex]);
            }}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddCategory}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#1D61FF" style={{marginTop: 40}} />
        ) : (
          <View style={styles.listContainer}>
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <View key={cat.id} style={[styles.catItem, index !== categories.length - 1 && styles.catItemBorder]}>
                  <View style={styles.catInfo}>
                    <View style={[styles.catDot, { backgroundColor: cat.color || '#3B82F6' }]} />
                    <View>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catCount}>{cat.question_count} questions</Text>
                    </View>
                  </View>
                  <View style={styles.catActions}>
                    <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'Edit functionality will be available soon.')}>
                      <Text style={styles.editBtn}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id, cat.name)}>
                      <Text style={styles.deleteBtn}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No categories found. Create one above!</Text>
            )}
          </View>
        )}
      </View>
    </FacultySubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginLeft: 12,
  },
  addBtn: {
    backgroundColor: '#1D61FF',
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  catItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  catCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editBtn: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    padding: 20,
    fontStyle: 'italic',
  }
});
