import { StyleSheet, View, TextInput, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';

const CATEGORIES = ['Boiler', 'Plumbing', 'Electrical', 'Environmental', 'Other'];

export default function ReportScreen() {
  const [topic, setTopic] = useState('');
  const [issueText, setIssueText] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!topic.trim() || !issueText.trim()) {
      Alert.alert('Missing Details', 'Please provide a title and description for the issue.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('http://100.65.231.42:8000/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Fixed for demo tenant
          title: topic,
          description: issueText,
          category: category,
          priority: 'High' // Default to High to grab admin attention
        }),
      });

      if (response.ok) {
        Alert.alert('Report Submitted', 'Your property manager has been notified instantly.');
        setTopic('');
        setIssueText('');
      } else {
        Alert.alert('Error', 'Failed to submit report. Please try again.');
      }
    } catch (error) {
       Alert.alert('Error', 'Could not connect to server.');
       console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Report Issue</Text>
            <Text style={styles.headerSubtitle}>Raise a maintenance ticket directly to building management.</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>Select Product / Category</Text>
                <View style={styles.swipeHint}>
                    <IconSymbol name="chevron.left" size={18} color="#9CA3AF" />
                    <Text style={styles.swipeText}>Swipe</Text>
                    <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
                </View>
            </View>
            {/* Added negative margin to break out of parent padding for a full-bleed scroll */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
            >
                {CATEGORIES.map(cat => (
                    <TouchableOpacity 
                        key={cat} 
                        style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.label}>Issue Summary</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Boiler losing pressure"
                placeholderTextColor="#9CA3AF"
                value={topic}
                onChangeText={setTopic}
            />

            <Text style={styles.label}>Detailed Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe exactly what's happening..."
                placeholderTextColor="#9CA3AF"
                value={issueText}
                onChangeText={setIssueText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
            />
            
            <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.submitButtonText}>Submit Ticket</Text>
                        <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={28} color="#DC2626" />
            <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Emergency?</Text>
                <Text style={styles.infoText}>For major gas leaks or severe floods, please immediately call the 24/7 hotline at 0800-EMERGENCY.</Text>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: '#111827', marginBottom: 8, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24, fontWeight: '500' },
  formContainer: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#374151' },
  swipeHint: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 2 },
  swipeText: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryScroll: { marginHorizontal: -24, marginBottom: 8 }, // Pulls scrollview out of padding bounds
  categoryScrollContent: { paddingHorizontal: 24, gap: 10 }, // Restores padding inside the scrollview
  categoryChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  categoryText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  categoryTextActive: { color: '#2563EB', fontWeight: 'bold' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, color: '#111827', fontWeight: '500' },
  textArea: { minHeight: 140, paddingTop: 20 },
  submitButton: { flexDirection: 'row', backgroundColor: '#2563EB', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', marginTop: 32, gap: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoContainer: { flexDirection: 'row', backgroundColor: '#FEF2F2', borderRadius: 20, padding: 24, marginTop: 32, gap: 16, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  infoTitle: { fontWeight: '800', color: '#B91C1C', fontSize: 18, marginBottom: 6, letterSpacing: -0.5 },
  infoText: { color: '#991B1B', fontSize: 15, lineHeight: 22, fontWeight: '500' },
});
