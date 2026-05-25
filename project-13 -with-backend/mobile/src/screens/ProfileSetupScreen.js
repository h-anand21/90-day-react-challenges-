import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Alert, FlatList, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, ArrowRight, Check } from 'lucide-react-native';
import { Text } from '../components/Typography';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const GENDERS = ['Male', 'Female', 'Neutral'];

// Custom Icons for Gender
const MaleIcon = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="10" cy="14" r="5" />
    <Path d="M21 3l-6.5 6.5" />
    <Path d="M16 3h5v5" />
  </Svg>
);

const FemaleIcon = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="10" r="5" />
    <Path d="M12 15v7" />
    <Path d="M9 19h6" />
  </Svg>
);

const NeutralIcon = ({ color }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const UserIcon = ({ color }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

export default function ProfileSetupScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();
  
  const [username, setUsername] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [avatarUri, setAvatarUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarList, setAvatarList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const maleAvatars = [
    { id: 'male_1', source: require('../../assets/avatars/male_1.png') },
    { id: 'male_2', source: require('../../assets/avatars/male_2.png') },
    { id: 'male_3', source: require('../../assets/avatars/male_3.png') },
    { id: 'male_4', source: require('../../assets/avatars/male_4.png') },
    { id: 'male_5', source: require('../../assets/avatars/male_5.png') },
    { id: 'male_6', source: require('../../assets/avatars/male_6.png') },
    { id: 'male_7', source: require('../../assets/avatars/male_7.png') },
    { id: 'male_8', source: require('../../assets/avatars/male_8.png') },
    { id: 'male_9', source: require('../../assets/avatars/male_9.png') },
    { id: 'male_10', source: require('../../assets/avatars/male_10.png') },
    { id: 'male_11', source: require('../../assets/avatars/male_11.png') },
    { id: 'male_12', source: require('../../assets/avatars/male_12.png') },
    { id: 'male_13', source: require('../../assets/avatars/male_13.png') },
    { id: 'male_14', source: require('../../assets/avatars/male_14.png') },
    { id: 'male_15', source: require('../../assets/avatars/male_15.png') },
  ];

  const femaleAvatars = [
    { id: 'female_1', source: require('../../assets/avatars/female_1.png') },
    { id: 'female_2', source: require('../../assets/avatars/female_2.png') },
    { id: 'female_3', source: require('../../assets/avatars/female_3.png') },
    { id: 'female_4', source: require('../../assets/avatars/female_4.png') },
    { id: 'female_5', source: require('../../assets/avatars/female_5.png') },
    { id: 'female_6', source: require('../../assets/avatars/female_6.png') },
    { id: 'female_7', source: require('../../assets/avatars/female_7.png') },
    { id: 'female_8', source: require('../../assets/avatars/female_8.png') },
    { id: 'female_9', source: require('../../assets/avatars/female_9.png') },
    { id: 'female_10', source: require('../../assets/avatars/female_10.png') },
    { id: 'female_11', source: require('../../assets/avatars/female_11.png') },
    { id: 'female_12', source: require('../../assets/avatars/female_12.png') },
    { id: 'female_13', source: require('../../assets/avatars/female_13.png') },
    { id: 'female_14', source: require('../../assets/avatars/female_14.png') },
    { id: 'female_15', source: require('../../assets/avatars/female_15.png') },
  ];

  // Instantly load exactly curated images based on gender
  useEffect(() => {
    let newAvatars = [];
    if (gender === 'Male') {
      newAvatars = maleAvatars;
    } else if (gender === 'Female') {
      newAvatars = femaleAvatars;
    } else {
      // Neutral gets a mix
      newAvatars = [
        maleAvatars[0], femaleAvatars[0], 
        maleAvatars[1], femaleAvatars[1],
        maleAvatars[2], femaleAvatars[2],
        maleAvatars[3], femaleAvatars[3],
        maleAvatars[4], femaleAvatars[4],
        maleAvatars[5], femaleAvatars[5],
        maleAvatars[6], femaleAvatars[6],
      ];
    }
    
    setAvatarList(newAvatars);
    const existingAvatar = newAvatars.find(a => a.id === user?.avatar);
    setAvatarUri(existingAvatar || newAvatars[0]);
  }, [gender]);

  const handleCompleteSetup = async () => {
    if (!username.trim()) {
      Alert.alert('Wait!', 'Please enter a username.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await client.put('/users/profile-setup', {
        name: username,
        gender: gender,
        avatar: avatarUri ? avatarUri.id : '',
      });

      if (res.data.success) {
        // Update local user state
        const updatedUser = {
          ...user,
          name: username,
          gender: gender,
          avatar: avatarUri ? avatarUri.id : '',
          isProfileSetupCompleted: true,
        };
        setUser(updatedUser);
        
        // Ensure AsyncStorage is updated so the app remembers profile is setup on reload
        import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        });
        
        // Navigate if editing
        if (user?.isProfileSetupCompleted) {
          navigation.navigate('MainTabs');
        }
      } else {
        Alert.alert('Error', res.data.message || 'Failed to save profile.');
      }
    } catch (error) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group avatars into columns of 2 for the horizontal FlatList
  const chunkedAvatars = [];
  for (let i = 0; i < avatarList.length; i += 2) {
    chunkedAvatars.push(avatarList.slice(i, i + 2));
  }

  const renderAvatarColumn = ({ item }) => {
    return (
      <View className="justify-start">
        {item.map(avatar => {
          const isSelected = avatarUri?.id === avatar.id;
          return (
            <TouchableOpacity 
              key={avatar.id}
              onPress={() => setAvatarUri(avatar)}
              activeOpacity={0.8}
              className="relative m-2"
            >
              <View 
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: isSelected ? 3 : 1,
                  borderColor: isSelected ? '#ec9006' : '#222',
                  overflow: 'hidden',
                  ...(isSelected ? {
                    shadowColor: '#ec9006',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 15,
                    elevation: 10,
                  } : {})
                }}
              >
                <Image 
                  source={avatar.source} 
                  style={{ width: '100%', height: '100%', backgroundColor: '#111' }} 
                  resizeMode="cover"
                />
              </View>
              {isSelected && (
                <View className="absolute top-0 right-0 bg-brand-500 rounded-full w-6 h-6 items-center justify-center border-2 border-black">
                  <Check size={14} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentSlide(Math.round(index));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#000000' }}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* Header Logo */}
        <View className="items-center mb-6 mt-4">
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#ec9006',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 15,
          }}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={{ width: 100, height: 100, borderRadius: 50 }} 
              resizeMode="contain" 
            />
          </View>
        </View>

        {/* Titles */}
        <View className="mb-6 items-center px-4">
          <Text className="text-3xl font-black text-white text-center mb-2 tracking-wide">
            Profile
          </Text>
          <View className="w-8 h-[3px] bg-brand-500 rounded-full mb-3" />
          <Text className="text-[14px] text-neutral-400 text-center font-medium leading-5">
            Let's build your profile. Add a few details and choose an avatar that represents you.
          </Text>
        </View>

        {/* Username Section */}
        <View className="mb-6">
          <Text className="text-[13px] font-bold text-white mb-2">Display Name</Text>
          <View className="flex-row items-center bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-4 h-14">
            <UserIcon color="#ec9006" />
            <TextInput
              className="flex-1 ml-3 text-white text-[15px]"
              placeholder="Enter your name"
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>

        {/* Gender Selection */}
        <View className="mb-6">
          <Text className="text-[13px] font-bold text-white mb-2">Select Gender</Text>
          <View className="flex-row bg-[#0a0a0a] border border-[#222] rounded-xl p-1 h-14">
            {GENDERS.map((g) => {
              const isSelected = gender === g;
              let IconComponent = NeutralIcon;
              if (g === 'Male') IconComponent = MaleIcon;
              if (g === 'Female') IconComponent = FemaleIcon;
              
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className="flex-1 flex-row items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: isSelected ? 'rgba(236, 144, 6, 0.1)' : 'transparent',
                    borderWidth: 1,
                    borderColor: isSelected ? '#ec9006' : 'transparent',
                  }}
                >
                  <IconComponent color={isSelected ? '#ec9006' : '#888'} />
                  <Text style={{
                    marginLeft: 6,
                    fontWeight: '700',
                    fontSize: 14,
                    color: isSelected ? '#ec9006' : '#fff'
                  }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Avatar Grid */}
        <View className="mb-6">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-[13px] font-bold text-white">Choose your avatar</Text>
            <View className="flex-row items-center">
              <Text className="text-[11px] text-neutral-500 mr-1">Swipe to see more</Text>
              <ArrowRight size={12} color="#737373" />
            </View>
          </View>
          
          <View className="bg-[#0a0a0a] border border-[#222] rounded-3xl py-4 pb-6">
            <FlatList
              data={chunkedAvatars}
              keyExtractor={(_, index) => `col-${index}`}
              renderItem={renderAvatarColumn}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              snapToInterval={88 * 2} // Approximate width of 2 columns
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
            {/* Pagination Dots */}
            <View className="flex-row justify-center mt-3 space-x-2">
              {[0, 1, 2, 3, 4].map(dot => (
                <View 
                  key={dot} 
                  className={`h-2 w-2 rounded-full ${currentSlide === dot ? 'bg-brand-500' : 'bg-[#333]'}`} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Selected Avatar Preview */}
        {avatarUri && (
          <View className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-5 mb-8 flex-row items-center overflow-hidden relative">
            {/* Background dashed plane path graphic */}
            <View className="absolute right-[-20] bottom-[-20] opacity-10">
              <Svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#ec9006" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M10 20s-5-3-5-8c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5-5 8-5 8" />
                <Path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21.5 4c0 0-2 .5-3.5 2L14.5 9.5 6.3 7.7 4.5 9.5l6.5 2.5L8 15l-3.5-1-2 2 4.5 2.5 2.5 4.5 2-2-1-3.5 3-3 1.8 8.2 1.8-1.8z" />
              </Svg>
            </View>
            
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: '#ec9006',
              overflow: 'hidden',
              marginRight: 20,
              shadowColor: '#ec9006',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 25,
              elevation: 20,
              backgroundColor: '#000'
            }}>
              <Image source={avatarUri.source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
            
            <View className="flex-1 justify-center z-10">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-[#84cc16] mr-2" />
                <Text className="text-[#84cc16] text-[11px] font-bold">Live Preview</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-2">Looking good! 😎</Text>
              <Text className="text-neutral-400 text-[12px] leading-4">
                This avatar will represent you across the TripSync app.
              </Text>
            </View>
          </View>
        )}

        <View className="mb-10">
          <TouchableOpacity 
            onPress={handleCompleteSetup} 
            disabled={isSaving || !username.trim()}
            activeOpacity={0.8}
            style={{ width: '100%', height: 60, borderRadius: 30, overflow: 'hidden' }}
          >
            <LinearGradient
              colors={['#e88504', '#f1b04c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <ArrowRight size={20} color="#ec9006" strokeWidth={3} />
              </View>
              <View className="flex-1 items-center justify-center pr-10">
                <Text className="text-white text-[17px] font-bold">{isSaving ? "Saving..." : "Complete Setup"}</Text>
                <Text className="text-white/80 text-[11px] font-medium mt-0.5">You're almost there!</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
