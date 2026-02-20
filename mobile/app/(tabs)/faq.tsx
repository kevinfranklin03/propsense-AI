import { StyleSheet, View, Text, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQ_DATA = [
    {
        question: "How do I report an emergency?",
        answer: "For immediate emergencies like major gas leaks or severe flooding, please call the 24/7 hotline at 0800-EMERGENCY immediately, then raise a High Priority ticket in the Report tab."
    },
    {
        question: "When is my rent due?",
        answer: "Rent is typically due on the 1st of every month. You can set up direct debit or view your upcoming payment schedule in the Bills tab."
    },
    {
        question: "How do I request a new key?",
        answer: "To request a replacement or spare key, please open a General ticket. Note that a £25 replacement fee typically applies unless the lock is faulty."
    },
    {
        question: "What is the guest policy?",
        answer: "Guests are welcome! However, guests staying longer than 14 consecutive days must be registered with the property management office for fire safety and insurance reasons."
    },
    {
        question: "How do I connect to the building WiFi?",
        answer: "If your tenancy includes communal or private WiFi, you can find the network credentials in the welcome pack email sent upon move-in, or ask the AI Assistant for your specific flat's details."
    }
];

export default function FAQScreen() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <Text style={styles.headerSubtitle}>Frequently asked questions</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contactCard}>
                    <IconSymbol name="phone.fill" size={24} color="#2563EB" />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactRole}>Property Manager</Text>
                        <Text style={styles.contactName}>Emma Robertson</Text>
                        <Text style={styles.contactNumber}>020 7946 0812</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Common Queries</Text>
                
                <View style={styles.faqList}>
                    {FAQ_DATA.map((item, index) => {
                        const isExpanded = expandedIndex === index;
                        return (
                            <View key={index} style={styles.faqItem}>
                                <TouchableOpacity 
                                    style={styles.faqQuestion} 
                                    onPress={() => toggleExpand(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.questionText, isExpanded && styles.questionTextActive]}>
                                        {item.question}
                                    </Text>
                                    <IconSymbol 
                                        name={isExpanded ? "chevron.up" : "chevron.down"} 
                                        size={20} 
                                        color={isExpanded ? "#2563EB" : "#9CA3AF"} 
                                    />
                                </TouchableOpacity>
                                {isExpanded && (
                                    <View style={styles.faqAnswer}>
                                        <Text style={styles.answerText}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 24, paddingTop: 60, paddingBottom: 20 },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4, fontWeight: '500' },
    scrollContent: { padding: 24, paddingBottom: 100 },
    contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 20, borderRadius: 20, marginBottom: 32, borderWidth: 1, borderColor: '#DBEAFE' },
    contactInfo: { flex: 1, marginLeft: 16 },
    contactRole: { fontSize: 13, color: '#3B82F6', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    contactName: { fontSize: 18, fontWeight: '700', color: '#1E3A8A' },
    contactNumber: { fontSize: 15, color: '#60A5FA', marginTop: 2, fontWeight: '500' },
    callButton: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    callButtonText: { color: '#fff', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
    faqList: { backgroundColor: '#fff', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
    faqItem: { overflow: 'hidden' },
    faqQuestion: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' },
    questionText: { fontSize: 16, fontWeight: '600', color: '#374151', flex: 1, paddingRight: 16, lineHeight: 22 },
    questionTextActive: { color: '#2563EB' },
    faqAnswer: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
    answerText: { fontSize: 15, color: '#6B7280', lineHeight: 24 },
});
