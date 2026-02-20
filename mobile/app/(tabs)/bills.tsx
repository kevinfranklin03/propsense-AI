import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BillsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bills & Payments</Text>
                <Text style={styles.headerSubtitle}>Manage your tenancy finances</Text>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Upcoming Bill Card */}
                <Text style={styles.sectionTitle}>Upcoming Payment</Text>
                <View style={styles.upcomingCard}>
                    <View style={styles.upcomingHeader}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateMonth}>MAR</Text>
                            <Text style={styles.dateDay}>01</Text>
                        </View>
                        <View style={styles.upcomingDetails}>
                            <Text style={styles.billType}>Rent & Utilities</Text>
                            <Text style={styles.billStatus}>Due in 8 days</Text>
                        </View>
                        <IconSymbol name="creditcard.fill" size={28} color="#059669" />
                    </View>
                    
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceSymbol}>£</Text>
                        <Text style={styles.priceAmount}>1,450</Text>
                        <Text style={styles.priceCents}>.00</Text>
                    </View>

                    <TouchableOpacity style={styles.payButton}>
                        <Text style={styles.payButtonText}>Pay Now</Text>
                        <IconSymbol name="chevron.right" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Breakdown */}
                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Cost Breakdown</Text>
                <View style={styles.breakdownCard}>
                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelContainer}>
                            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                            <Text style={styles.breakdownLabel}>Base Rent</Text>
                        </View>
                        <Text style={styles.breakdownValue}>£1,200.00</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelContainer}>
                            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.breakdownLabel}>Water</Text>
                        </View>
                        <Text style={styles.breakdownValue}>£45.00</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelContainer}>
                            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.breakdownLabel}>Electricity</Text>
                        </View>
                        <Text style={styles.breakdownValue}>£85.00</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLabelContainer}>
                            <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
                            <Text style={styles.breakdownLabel}>Internet (1Gbps)</Text>
                        </View>
                        <Text style={styles.breakdownValue}>£40.00</Text>
                    </View>
                </View>

                {/* History */}
                <View style={styles.historyHeaderRow}>
                    <Text style={styles.sectionTitle}>Past Payments</Text>
                    <TouchableOpacity>
                        <Text style={styles.downloadText}>Download 2025 PDF</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.historyCard}>
                    {[
                        { month: 'Feb 01, 2026', amount: '£1,450.00', status: 'Paid', statusColor: '#10B981' },
                        { month: 'Jan 01, 2026', amount: '£1,450.00', status: 'Paid', statusColor: '#10B981' },
                        { month: 'Dec 01, 2025', amount: '£1,420.00', status: 'Paid', statusColor: '#10B981' },
                    ].map((item, i) => (
                        <View key={i} style={styles.historyItem}>
                            <View style={styles.historyIconBox}>
                                <IconSymbol name="checkmark.circle.fill" size={24} color={item.statusColor} />
                            </View>
                            <View style={styles.historyItemDetails}>
                                <Text style={styles.historyItemMonth}>{item.month}</Text>
                                <Text style={styles.historyItemStatus}>{item.status}</Text>
                            </View>
                            <Text style={styles.historyItemAmount}>{item.amount}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 24, paddingTop: 60, paddingBottom: 16 },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4, fontWeight: '500' },
    scrollContent: { padding: 24, paddingBottom: 100 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
    
    upcomingCard: { backgroundColor: '#D1FAE5', padding: 24, borderRadius: 28, marginBottom: 24 },
    upcomingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dateBadge: { backgroundColor: '#fff', borderRadius: 16, padding: 10, alignItems: 'center', minWidth: 64, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
    dateMonth: { fontSize: 13, fontWeight: '800', color: '#059669', marginBottom: 2 },
    dateDay: { fontSize: 24, fontWeight: '800', color: '#111827', lineHeight: 24 },
    upcomingDetails: { flex: 1, marginLeft: 16 },
    billType: { fontSize: 16, fontWeight: '700', color: '#065F46' },
    billStatus: { fontSize: 14, color: '#047857', marginTop: 2, fontWeight: '500' },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
    priceSymbol: { fontSize: 24, fontWeight: '700', color: '#065F46', marginTop: 8 },
    priceAmount: { fontSize: 48, fontWeight: '800', color: '#064E3B', letterSpacing: -1 },
    priceCents: { fontSize: 20, fontWeight: '700', color: '#065F46', marginTop: 8 },
    payButton: { backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 8 },

    breakdownCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    breakdownLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    breakdownLabel: { fontSize: 16, color: '#4B5563', fontWeight: '500' },
    breakdownValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
    breakdownDivider: { height: 1, backgroundColor: '#F3F4F6' },

    historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    downloadText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
    historyCard: { backgroundColor: '#fff', borderRadius: 24, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
    historyItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    historyIconBox: { width: 48, height: 48, backgroundColor: '#F0FDF4', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    historyItemDetails: { flex: 1 },
    historyItemMonth: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
    historyItemStatus: { fontSize: 14, color: '#10B981', fontWeight: '600' },
    historyItemAmount: { fontSize: 18, fontWeight: '800', color: '#374151' },
});
