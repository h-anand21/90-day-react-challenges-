import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, Dimensions, TouchableOpacity, ImageBackground, Platform, FlatList, Image, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, ArrowLeft, MapPin, Users, ShieldCheck, Plus, Wallet, Plane, ClipboardList, Building2, Car, CheckCircle2, Circle, Mountain, TreePine, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [ { id: '1' }, { id: '2' }, { id: '3' } ];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const skipToLogin = () => navigation.replace('Login');
  
  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      skipToLogin();
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      slidesRef.current.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const renderSlide1 = () => (
    <View style={{ width, flex: 1, paddingBottom: 100 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={skipToLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <ArrowRight size={14} color="#a3a3a3" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>01</Text>
            <View style={styles.stepDots}>
              <View style={styles.dotSmall} />
              <View style={styles.dotSmall} />
              <View style={styles.dotSmall} />
            </View>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleWhite}>Every</Text>
            <Text style={styles.titleOrange}>unforgettable</Text>
            <Text style={styles.titleWhite}>trip starts</Text>
            <Text style={styles.titleWhite}>with a plan<Text style={{color: '#ea580c'}}>.</Text></Text>
          </View>
          <View style={styles.dash} />
          <Text style={styles.heroSubtitle}>
            Dream, explore and create{"\n"}the perfect journey.
          </Text>

          <View style={styles.bottomArea}>
            <View style={styles.glassCard}>
              <View style={styles.featureCol}>
                <View style={[styles.iconBadge, { shadowColor: '#f97316' }]}>
                  <MapPin size={22} color="#f97316" />
                </View>
                <Text style={styles.featureTitle}>Plan Better</Text>
                <Text style={styles.featureSub}>Organize itineraries with smart day-by-day planning.</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.featureCol}>
                <View style={[styles.iconBadge, { shadowColor: '#8b5cf6' }]}>
                  <Users size={22} color="#8b5cf6" />
                </View>
                <Text style={styles.featureTitle}>Plan Together</Text>
                <Text style={styles.featureSub}>Collaborate in real-time and keep everyone in sync.</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.featureCol}>
                <View style={[styles.iconBadge, { shadowColor: '#10b981' }]}>
                  <ShieldCheck size={22} color="#10b981" />
                </View>
                <Text style={styles.featureTitle}>Travel Confidently</Text>
                <Text style={styles.featureSub}>Everything in one place so you can relax and enjoy the moment.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  const renderSlide2 = () => (
    <View style={{ width, flex: 1, paddingBottom: 100 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={skipToLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <ArrowRight size={14} color="#a3a3a3" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>02</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleWhite}>Plan together.</Text>
            <Text style={styles.titleOrange}>Stay perfectly</Text>
            <Text style={styles.titleOrange}>synced.</Text>
          </View>
          <View style={styles.dash} />
          <Text style={styles.heroSubtitle}>
            Invite your friends, share ideas{"\n"}and build the best itinerary{"\n"}together in real-time.
          </Text>

          <View style={styles.slide2BottomWidgets}>
            {/* Left Itinerary Card */}
            <View style={styles.itineraryCard}>
              <View style={styles.itineraryHeader}>
                <Text style={styles.itineraryTitle}>India Trip</Text>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysText}>5 Days</Text>
                </View>
              </View>
              
              <View style={styles.avatarsRow}>
                <Image source={{uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}} style={styles.avatar} />
                <Image source={{uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'}} style={[styles.avatar, {marginLeft: -8}]} />
                <Image source={{uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'}} style={[styles.avatar, {marginLeft: -8}]} />
                <View style={[styles.avatarPlus, {marginLeft: -8}]}>
                  <Plus size={10} color="#fff" />
                </View>
              </View>

              {/* Timeline Items */}
              <View style={styles.timelineContainer}>
                <View style={styles.timelineLine} />
                <View style={styles.timelineLineActive} />

                <View style={styles.timelineItem}>
                  <View style={styles.timelineDotActive} />
                  <View style={[styles.timelineBox, styles.timelineBoxActive]}>
                    <Image source={{uri: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=200&q=80'}} style={styles.timelineImageMock} />
                    <View style={{flex: 1}}>
                      <Text style={styles.timelineDayOrange}>Day 1</Text>
                      <Text style={styles.timelineLocation} numberOfLines={1}>Agra, Uttar Pradesh</Text>
                    </View>
                    <View style={styles.usersCountBadge}>
                      <Users size={8} color="#f97316" />
                      <Text style={styles.usersCountText}>4</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineBox}>
                    <Image source={{uri: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=200&q=80'}} style={styles.timelineImageMock} />
                    <View style={{flex: 1}}>
                      <Text style={styles.timelineDay}>Day 2</Text>
                      <Text style={styles.timelineLocation} numberOfLines={1}>Jaipur, Rajasthan</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineBox}>
                    <Image source={{uri: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=200&q=80'}} style={styles.timelineImageMock} />
                    <View style={{flex: 1}}>
                      <Text style={styles.timelineDay}>Day 3</Text>
                      <Text style={styles.timelineLocation} numberOfLines={1}>Kerala, India</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Mini Info Card */}
            <View style={styles.infoCardWrapper}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                  <Users size={18} color="#f97316" />
                </View>
                <Text style={styles.infoTitle}>Everyone{"\n"}in the loop</Text>
                <Text style={styles.infoSub}>Real-time updates keep everyone informed and on the same page.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  const renderSlide3 = () => (
    <View style={{ width, flex: 1, paddingBottom: 100 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={skipToLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
            <ArrowRight size={14} color="#a3a3a3" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>03</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.titleWhite}>Budgets, bookings,</Text>
            <Text style={styles.titleWhite}>memories —</Text>
            <Text style={styles.titleOrange}>all in one place.</Text>
          </View>
          <View style={styles.dash} />
          <Text style={styles.heroSubtitle}>
            Track expenses, manage bookings{"\n"}and never forget a thing.
          </Text>

          {/* DENSE DASHBOARD VIEW */}
          <View style={styles.dashboardContainer}>
            
            {/* ROW 1 */}
            <View style={styles.dashboardRow}>
              {/* Budget Overview */}
              <View style={[styles.dashCard, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.dashCardTitle}>Budget Overview</Text>
                <View style={styles.budgetMainRow}>
                  <View>
                    <Text style={styles.budgetAmount}>₹24,500</Text>
                    <Text style={styles.budgetSub}>of ₹40,000</Text>
                  </View>
                  <View style={styles.budgetRing}>
                    <Text style={styles.budgetRingText}>61%</Text>
                  </View>
                </View>
                <View style={styles.sparklineMock} />
              </View>

              {/* Expense Breakdown */}
              <View style={[styles.dashCard, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.dashCardTitle}>Expense Breakdown</Text>
                <View style={styles.expenseRow}>
                  <View style={styles.donutMock}>
                    <Wallet size={12} color="#fff" />
                  </View>
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#f97316'}]}/><Text style={styles.legendText}>Accom.</Text><Text style={styles.legendPct}>41%</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#8b5cf6'}]}/><Text style={styles.legendText}>Food</Text><Text style={styles.legendPct}>24%</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#3b82f6'}]}/><Text style={styles.legendText}>Transp.</Text><Text style={styles.legendPct}>16%</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#10b981'}]}/><Text style={styles.legendText}>Activ.</Text><Text style={styles.legendPct}>11%</Text></View>
                  </View>
                </View>
              </View>
            </View>

            {/* ROW 2 */}
            <View style={styles.dashboardRow}>
              {/* Bookings */}
              <View style={[styles.dashCard, { flex: 1.2, marginRight: 8 }]}>
                <Text style={styles.dashCardTitle}>Bookings & Res.</Text>
                
                <View style={styles.bookingItem}>
                  <View style={[styles.bookingIcon, {backgroundColor: 'rgba(139, 92, 246, 0.2)'}]}><Plane size={12} color="#8b5cf6" /></View>
                  <View style={styles.bookingTextCont}><Text style={styles.bookingTitle}>Flight to Bali</Text><Text style={styles.bookingSub}>May 12 • 08:30 AM</Text></View>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>Confirmed</Text></View>
                </View>
                
                <View style={styles.bookingItem}>
                  <View style={[styles.bookingIcon, {backgroundColor: 'rgba(249, 115, 22, 0.2)'}]}><Building2 size={12} color="#f97316" /></View>
                  <View style={styles.bookingTextCont}><Text style={styles.bookingTitle}>Sunset Resort</Text><Text style={styles.bookingSub}>May 12 - May 20</Text></View>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>Confirmed</Text></View>
                </View>

                <View style={styles.bookingItem}>
                  <View style={[styles.bookingIcon, {backgroundColor: 'rgba(59, 130, 246, 0.2)'}]}><Car size={12} color="#3b82f6" /></View>
                  <View style={styles.bookingTextCont}><Text style={styles.bookingTitle}>Car Rental</Text><Text style={styles.bookingSub}>May 12 - May 20</Text></View>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>Confirmed</Text></View>
                </View>
                
                <Text style={styles.viewAllText}>View all reservations {'>'}</Text>
              </View>

              {/* Checklist */}
              <View style={[styles.dashCard, { flex: 0.8, marginLeft: 8 }]}>
                <View style={styles.checklistHeader}>
                  <Text style={styles.dashCardTitle}>Checklist</Text>
                  <Text style={styles.checklistCount}><Text style={{color: '#f97316'}}>12</Text> / 18</Text>
                </View>
                
                <View style={styles.checkItem}><CheckCircle2 size={12} color="#f97316" /><Text style={styles.checkText}>Passport</Text></View>
                <View style={styles.checkItem}><CheckCircle2 size={12} color="#f97316" /><Text style={styles.checkText}>Flight Tickets</Text></View>
                <View style={styles.checkItem}><CheckCircle2 size={12} color="#f97316" /><Text style={styles.checkText}>Hotel Voucher</Text></View>
                <View style={styles.checkItem}><Circle size={12} color="#555" /><Text style={styles.checkTextOff}>Travel Insur.</Text></View>
                <View style={styles.checkItem}><Circle size={12} color="#555" /><Text style={styles.checkTextOff}>Universal Adap.</Text></View>
              </View>
            </View>

            {/* ROW 3 */}
            <View style={[styles.dashCard, { marginTop: 0 }]}>
              <Text style={styles.dashCardTitle}>Upcoming Itinerary</Text>
              <View style={styles.itineraryHScroll}>
                
                <View style={styles.itineraryHItem}>
                  <Text style={styles.itineraryHDateOrange}>May 12</Text>
                  <View style={[styles.itineraryHCircle, {borderColor: '#f97316'}]}><Plane size={14} color="#f97316" /></View>
                  <Text style={styles.itineraryHTitle}>Arrival</Text>
                </View>
                <View style={styles.itineraryHDash} />

                <View style={styles.itineraryHItem}>
                  <Text style={styles.itineraryHDate}>May 13</Text>
                  <View style={[styles.itineraryHCircle, {borderColor: '#8b5cf6'}]}><Navigation size={14} color="#8b5cf6" /></View>
                  <Text style={styles.itineraryHTitle}>Temple</Text>
                </View>
                <View style={styles.itineraryHDash} />

                <View style={styles.itineraryHItem}>
                  <Text style={styles.itineraryHDate}>May 14</Text>
                  <View style={[styles.itineraryHCircle, {borderColor: '#3b82f6'}]}><Mountain size={14} color="#3b82f6" /></View>
                  <Text style={styles.itineraryHTitle}>Tour</Text>
                </View>
                <View style={styles.itineraryHDash} />

                <View style={styles.itineraryHItem}>
                  <Text style={styles.itineraryHDate}>May 15</Text>
                  <View style={[styles.itineraryHCircle, {borderColor: '#10b981'}]}><TreePine size={14} color="#10b981" /></View>
                  <Text style={styles.itineraryHTitle}>Beach</Text>
                </View>

              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/sunset_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={currentIndex === 0 ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)'] : ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
          style={styles.overlay}
        />

        <FlatList 
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          renderItem={({ item }) => {
            if (item.id === '1') return renderSlide1();
            if (item.id === '2') return renderSlide2();
            if (item.id === '3') return renderSlide3();
            return null;
          }}
        />

        {/* Global Footer Controls */}
        <View style={styles.globalFooter}>
          <TouchableOpacity 
            style={[styles.backButton, currentIndex === 0 && { opacity: 0 }]} 
            onPress={scrollToPrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.pagination}>
            {SLIDES.map((_, i) => (
              <View 
                key={i} 
                style={currentIndex === i ? styles.dotActive : styles.dotInactive} 
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.nextArrowButton} 
            activeOpacity={0.9}
            onPress={scrollToNext}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              style={styles.nextArrowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ArrowRight size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 20 : 10 },
  skipButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  skipText: { color: '#a3a3a3', fontWeight: '500', fontSize: 14 },
  mainContent: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 140, justifyContent: 'center' },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.4)' },
  stepText: { color: '#ea580c', fontSize: 16, fontWeight: '700', marginRight: 10 },
  stepDots: { flexDirection: 'row', alignItems: 'center' },
  dotSmall: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 3 },
  titleContainer: { marginBottom: 20 },
  titleWhite: { color: '#ffffff', fontSize: width < 380 ? 32 : 40, fontWeight: '900', lineHeight: width < 380 ? 38 : 46, letterSpacing: -0.5 },
  titleOrange: { color: '#f97316', fontSize: width < 380 ? 32 : 40, fontWeight: '900', lineHeight: width < 380 ? 38 : 46, letterSpacing: -0.5 },
  dash: { width: 36, height: 4, backgroundColor: '#ea580c', borderRadius: 2, marginBottom: 20 },
  heroSubtitle: { color: '#d4d4d4', fontSize: 15, fontWeight: '400', lineHeight: 22, marginBottom: 20 },
  
  /* Slide 1 Bottom Area */
  bottomArea: { },
  glassCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(15, 15, 15, 0.75)', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  featureCol: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 2 },
  iconBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  featureTitle: { color: '#fff', fontSize: 11, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  featureSub: { color: '#9ca3af', fontSize: 9, textAlign: 'center', lineHeight: 14 },
  
  /* Slide 2 Custom Widgets */
  slide2BottomWidgets: { flexDirection: 'row', marginTop: 10, minHeight: 320, width: '100%' },
  itineraryCard: { flex: 0.65, backgroundColor: 'rgba(20,20,20,0.85)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
  itineraryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itineraryTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  daysBadge: { backgroundColor: 'rgba(234, 88, 12, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  daysText: { color: '#ea580c', fontSize: 10, fontWeight: '700' },
  avatarsRow: { flexDirection: 'row', marginBottom: 20 },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#111' },
  avatarPlus: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#111', backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  
  timelineContainer: { flex: 1, position: 'relative' },
  timelineLine: { position: 'absolute', left: 4, top: 10, bottom: 20, width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  timelineLineActive: { position: 'absolute', left: 4, top: 10, height: 40, width: 1, backgroundColor: '#ea580c' },
  timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#555', marginLeft: 1, marginRight: 12 },
  timelineDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ea580c', marginRight: 11, shadowColor: '#ea580c', shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 },
  timelineBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 12 },
  timelineBoxActive: { backgroundColor: 'rgba(234, 88, 12, 0.08)', borderWidth: 1, borderColor: 'rgba(234, 88, 12, 0.2)' },
  timelineImageMock: { width: 32, height: 32, borderRadius: 8, marginRight: 10 },
  timelineDay: { color: '#a3a3a3', fontSize: 10, fontWeight: '500' },
  timelineDayOrange: { color: '#ea580c', fontSize: 10, fontWeight: '700' },
  timelineLocation: { color: '#fff', fontSize: 11, fontWeight: '600' },
  usersCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(234, 88, 12, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 5 },
  usersCountText: { color: '#ea580c', fontSize: 9, fontWeight: '700', marginLeft: 3 },
  
  infoCardWrapper: { flex: 0.35, justifyContent: 'flex-end' },
  infoCard: { backgroundColor: 'rgba(20,20,20,0.85)', borderRadius: 24, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  infoIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(234, 88, 12, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  infoTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  infoSub: { color: '#9ca3af', fontSize: 9, lineHeight: 14 },

  /* Slide 3 Complex Dashboard Widgets */
  dashboardContainer: { marginTop: 15, paddingBottom: 0 },
  dashboardRow: { flexDirection: 'row', marginBottom: 12 },
  dashCard: { backgroundColor: 'rgba(20,20,20,0.85)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dashCardTitle: { color: '#fff', fontSize: 10, fontWeight: '700', marginBottom: 10 },
  
  /* Budget Card */
  budgetMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetAmount: { color: '#fff', fontSize: 16, fontWeight: '800' },
  budgetSub: { color: '#9ca3af', fontSize: 8, marginTop: 2 },
  budgetRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#333', borderTopColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  budgetRingText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  sparklineMock: { height: 10, borderBottomWidth: 1, borderColor: '#f97316', marginTop: 10, opacity: 0.5 },

  /* Expense Card */
  expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  donutMock: { width: 40, height: 40, borderRadius: 20, borderWidth: 6, borderColor: '#3b82f6', borderTopColor: '#f97316', borderRightColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' },
  legendContainer: { flex: 1, marginLeft: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  legendText: { color: '#ccc', fontSize: 8, flex: 1 },
  legendPct: { color: '#fff', fontSize: 8, fontWeight: '600' },

  /* Bookings Card */
  bookingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bookingIcon: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bookingTextCont: { flex: 1 },
  bookingTitle: { color: '#fff', fontSize: 10, fontWeight: '600' },
  bookingSub: { color: '#9ca3af', fontSize: 8 },
  statusBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: '#10b981', fontSize: 7, fontWeight: '700' },
  viewAllText: { color: '#f97316', fontSize: 9, fontWeight: '700', marginTop: 4 },

  /* Checklist Card */
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  checklistCount: { color: '#fff', fontSize: 9, fontWeight: '700' },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkText: { color: '#fff', fontSize: 9, marginLeft: 6 },
  checkTextOff: { color: '#9ca3af', fontSize: 9, marginLeft: 6, textDecorationLine: 'line-through' },

  /* Itinerary HScroll */
  itineraryHScroll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 },
  itineraryHItem: { alignItems: 'center' },
  itineraryHDate: { color: '#9ca3af', fontSize: 8, marginBottom: 4 },
  itineraryHDateOrange: { color: '#f97316', fontSize: 8, marginBottom: 4, fontWeight: '700' },
  itineraryHCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 4 },
  itineraryHTitle: { color: '#fff', fontSize: 8 },
  itineraryHDash: { height: 1, width: 16, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },

  /* Global Footer */
  globalFooter: { position: 'absolute', bottom: Platform.OS === 'ios' ? 40 : 20, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  pagination: { flexDirection: 'row', alignItems: 'center' },
  dotActive: { width: 20, height: 6, borderRadius: 3, backgroundColor: '#ea580c', marginHorizontal: 4 },
  dotInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  nextArrowButton: { width: 56, height: 56, borderRadius: 28, shadowColor: '#ea580c', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 8 },
  nextArrowGradient: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }
});
