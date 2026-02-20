import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const API_URL = 'http://100.65.231.42:8000/status';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData((prev: any) => ({ ...prev, risk_level: 'Offline' }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logic for marketing slides
  useEffect(() => {
      let currentIndex = 0;
      const totalSlides = 4; // We will have 4 slides total
      
      const slideInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % totalSlides;
          if (scrollRef.current) {
              // The interval is width - 48 (card width) + 16 (gap)
              scrollRef.current.scrollTo({ x: currentIndex * (width - 32), animated: true });
          }
      }, 3000); // 3 seconds

      return () => clearInterval(slideInterval);
  }, [width]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const myProperty = data?.properties?.find((p: any) => p.property_id === 1) || data?.properties?.[0];
  const risk = myProperty?.risk_level || data?.risk_level || 'Unknown';

  const isHighRisk = risk === 'High';
  const isMediumRisk = risk === 'Medium';
  const isNormal = risk === 'Low';
  
  const bgColor = isHighRisk ? '#FEF2F2' : isMediumRisk ? '#FFFBEB' : isNormal ? '#F0FDF4' : '#F3F4F6';
  const titleColor = isHighRisk ? '#991B1B' : isMediumRisk ? '#92400E' : isNormal ? '#166534' : '#374151';
  const statusText = isHighRisk ? 'High Risk' : isMediumRisk ? 'Attention Needed' : 'All Normal';
  const statusSubtext = isHighRisk ? 'Please report this immediately or contact emergency services.' : isMediumRisk ? 'Sub-optimal conditions detected.' : 'Your home environment is perfectly balanced.';
  
  // Emojis requested by user
  const statusEmoji = isHighRisk ? '🚨' : isMediumRisk ? '😟' : isNormal ? '😊' : '🤔';

  // Faux graph data (randomized slightly for visual effect)
  const renderFauxGraph = (color: string) => {
      const bars = [40, 60, 45, 80, 50, 65, 55, 75, 60, 45, 70, 85];
      return (
          <View style={styles.graphContainer}>
              {bars.map((height, i) => (
                  <View key={i} style={[styles.graphBar, { height: `${height}%`, backgroundColor: color }]} />
              ))}
          </View>
      );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
            <View>
                <Text style={styles.headerGreeting}>Good Evening,</Text>
                <Text style={styles.headerTitle}>{myProperty?.tenant_name || 'Resident'}</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon}>
                <Text style={styles.profileInitials}>{myProperty?.tenant_name ? myProperty.tenant_name.charAt(0) : 'R'}</Text>
            </TouchableOpacity>
        </View>

        {/* Marketing Slides */}
        <ScrollView 
            ref={scrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            pagingEnabled 
            snapToInterval={width - 32} // Card width (width - 48) + gap (16)
            decelerationRate="fast"
            contentContainerStyle={styles.marketingScroll}
        >
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop' }} 
                style={styles.marketingCard}
                imageStyle={{ borderRadius: 24 }}
            >
                <View style={[styles.marketingOverlay, { backgroundColor: 'rgba(30, 58, 138, 0.7)' }]} />
                <View style={styles.marketingContent}>
                    <Text style={[styles.marketingTag, { color: '#60A5FA' }]}>NEW PERK</Text>
                    <Text style={styles.marketingTitle}>Building Gym Open!</Text>
                    <Text style={styles.marketingSub}>Claim your free pass downstairs.</Text>
                </View>
                <IconSymbol name="figure.strengthtraining.traditional" size={48} color="rgba(255,255,255,0.2)" style={styles.marketingIconBg} />
            </ImageBackground>
            
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1470&auto=format&fit=crop' }} 
                style={styles.marketingCard}
                imageStyle={{ borderRadius: 24 }}
            >
                <View style={[styles.marketingOverlay, { backgroundColor: 'rgba(5, 150, 105, 0.7)' }]} />
                <View style={styles.marketingContent}>
                    <Text style={[styles.marketingTag, { color: '#A7F3D0' }]}>REFERRAL</Text>
                    <Text style={styles.marketingTitle}>Refer a Friend</Text>
                    <Text style={styles.marketingSub}>Get £250 off your next rent bill.</Text>
                </View>
                <IconSymbol name="gift.fill" size={48} color="rgba(255,255,255,0.2)" style={styles.marketingIconBg} />
            </ImageBackground>

            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470&auto=format&fit=crop' }} 
                style={styles.marketingCard}
                imageStyle={{ borderRadius: 24 }}
            >
                <View style={[styles.marketingOverlay, { backgroundColor: 'rgba(153, 27, 27, 0.7)' }]} />
                <View style={styles.marketingContent}>
                    <Text style={[styles.marketingTag, { color: '#FCA5A5' }]}>COMMUNITY</Text>
                    <Text style={styles.marketingTitle}>Roof Terrace Party</Text>
                    <Text style={styles.marketingSub}>Friday 8PM. Drinks & Pizza on us.</Text>
                </View>
                <IconSymbol name="sparkles" size={48} color="rgba(255,255,255,0.2)" style={styles.marketingIconBg} />
            </ImageBackground>

            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1470&auto=format&fit=crop' }} 
                style={styles.marketingCard}
                imageStyle={{ borderRadius: 24 }}
            >
                <View style={[styles.marketingOverlay, { backgroundColor: 'rgba(126, 34, 206, 0.7)' }]} />
                <View style={styles.marketingContent}>
                    <Text style={[styles.marketingTag, { color: '#D8B4FE' }]}>SERVICES</Text>
                    <Text style={styles.marketingTitle}>Housekeeping</Text>
                    <Text style={styles.marketingSub}>Book a deep clean starting at £40.</Text>
                </View>
                <IconSymbol name="house.fill" size={48} color="rgba(255,255,255,0.2)" style={styles.marketingIconBg} />
            </ImageBackground>
        </ScrollView>

        <Text style={styles.sectionTitle}>Home Health Overview</Text>
        <View style={[styles.statusCard, { backgroundColor: bgColor }]}>
            <Text style={styles.statusEmoji}>{statusEmoji}</Text>
            <Text style={[styles.statusTitle, { color: titleColor }]}>{statusText}</Text>
            <Text style={[styles.statusSubtext, { color: titleColor, opacity: 0.8 }]}>{statusSubtext}</Text>
        </View>

        <Text style={styles.sectionTitle}>Sensors & Metrics</Text>
        
        {/* Sensor Graphs */}
        <View style={styles.grid}>
            {/* Temp Sensor with Graph */}
            <View style={styles.sensorCard}>
                <View style={styles.sensorHeader}>
                    <View style={styles.sensorLabelRow}>
                        <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                            <IconSymbol size={20} name="thermometer" color="#2563EB" />
                        </View>
                        <Text style={styles.sensorLabel}>Temperature</Text>
                    </View>
                    <Text style={styles.sensorValue}>20.5°</Text>
                </View>
                {renderFauxGraph('#3B82F6')}
            </View>

            {/* Humidity Sensor with Graph */}
            <View style={styles.sensorCard}>
                <View style={styles.sensorHeader}>
                    <View style={styles.sensorLabelRow}>
                        <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                            <IconSymbol size={20} name="drop.fill" color="#0284C7" />
                        </View>
                        <Text style={styles.sensorLabel}>Humidity</Text>
                    </View>
                    <Text style={styles.sensorValue}>48%</Text>
                </View>
                {renderFauxGraph('#0284C7')}
            </View>
        </View>

        <Text style={styles.lastUpdated}>
           System Online • {data ? 'Connected to PropSense' : 'Connecting...'}
        </Text>

      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerGreeting: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#111827', marginTop: 4, letterSpacing: -0.5 },
  profileIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  profileInitials: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  marketingScroll: { gap: 16, marginBottom: 32, paddingRight: width - (width - 48) }, // Correct padding for snap
  marketingCard: { width: width - 48, borderRadius: 24, padding: 24, paddingVertical: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, justifyContent: 'flex-end', minHeight: 180 },
  marketingOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  marketingContent: { zIndex: 2 },
  marketingTag: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6 },
  marketingTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 6, letterSpacing: -0.5 },
  marketingSub: { color: '#E2E8F0', fontSize: 16, fontWeight: '500' },
  marketingIconBg: { position: 'absolute', right: 5, bottom: 5, zIndex: 1, transform: [{ scale: 1.4 }] },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  statusCard: { borderRadius: 28, padding: 24, paddingVertical: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 4, marginBottom: 32 },
  statusEmoji: { fontSize: 64, marginBottom: 16 },
  statusTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 },
  statusSubtext: { fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500', paddingHorizontal: 16 },
  
  grid: { gap: 16 },
  sensorCard: { backgroundColor: '#fff', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  sensorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sensorLabelRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sensorLabel: { fontSize: 16, fontWeight: '700', color: '#374151' },
  sensorValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
  
  graphContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 40, paddingTop: 8 },
  graphBar: { width: '6%', borderRadius: 4, opacity: 0.8 },

  lastUpdated: { textAlign: 'center', color: '#D1D5DB', fontSize: 13, marginTop: 40, fontWeight: '600' },

  fab: { position: 'absolute', bottom: 32, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8, zIndex: 100 },
});
