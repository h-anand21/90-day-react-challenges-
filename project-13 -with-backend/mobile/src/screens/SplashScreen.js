import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Navigate to Onboarding after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
    <View style={[styles.container, { backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }]}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/image copy.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', zIndex: 10 },
  logo: {
    width: width,
    height: width,
  }
});
