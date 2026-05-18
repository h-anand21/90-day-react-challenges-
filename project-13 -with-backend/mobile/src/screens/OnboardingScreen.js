import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Animated, 
  TouchableOpacity,
  ImageBackground,
  Platform
} from 'react-native';
import { Map, Wallet, Camera, ArrowRight, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Plan the Ultimate Trip',
    subtitle: 'Collaborate with your friends on shared itineraries in real-time. No more messy group chats.',
    Icon: Map,
    color: '#f97316'
  },
  {
    id: '2',
    title: 'Smart Budgeting',
    subtitle: 'Split expenses effortlessly and track every penny. We do the math so you can enjoy the trip.',
    Icon: Wallet,
    color: '#0ea5e9'
  },
  {
    id: '3',
    title: 'Memories Together',
    subtitle: 'Organize your journey flawlessly and focus on creating memories that last a lifetime.',
    Icon: Camera,
    color: '#10b981'
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const skipToLogin = () => {
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[item.color, item.color + '80']}
            style={styles.iconGlow}
          />
          <View style={styles.iconWrapper}>
            <item.Icon size={54} color={item.color} strokeWidth={1.5} />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Animated Background Colors based on Scroll */}
      <ImageBackground 
        source={require('../../assets/sunset_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 8 : 4}
      >
        <LinearGradient
          colors={['rgba(17,17,17,0.7)', 'rgba(17,17,17,1)']}
          style={styles.overlay}
        />
        
        {/* Skip Button */}
        <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={skipToLogin} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Carousel */}
        <View style={{ flex: 3 }}>
          <FlatList 
            data={SLIDES}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            scrollEventThrottle={32}
            ref={slidesRef}
          />
        </View>

        {/* Footer (Pagination & Button) */}
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp'
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp'
              });

              return (
                <Animated.View 
                  key={i.toString()} 
                  style={[styles.dot, { width: dotWidth, opacity }]} 
                />
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.nextButton} 
            activeOpacity={0.8}
            onPress={scrollToNext}
          >
            <LinearGradient
              colors={['#ea580c', '#c2410c']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>
                {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
              </Text>
              {currentIndex === SLIDES.length - 1 ? (
                <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
              ) : (
                <ChevronRight size={20} color="#fff" style={{ marginLeft: 4 }} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111'
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  skipText: {
    color: '#a3a3a3',
    fontWeight: '600',
    fontSize: 14,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: 160,
    height: 160,
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.15,
    transform: [{ scale: 1.2 }]
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(25,25,25,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 15,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    paddingHorizontal: 20
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ea580c',
    marginHorizontal: 4,
  },
  nextButton: {
    width: '100%',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 20
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5
  }
});
