import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Text } from '../components/Typography';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar, Info, MapPin, Tag, Award, Search, Globe, Check } from 'lucide-react-native';
import client from '../api/client';
import { ALL_COUNTRIES } from '../data/countries';

const THEME = {
  surface: '#0d0d0d',
  surfaceCard: '#141414',
  brand: '#ec9006',
  border: '#222222',
  textSecondary: '#a3a3a3'
};

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export default function CreateTripScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    latitude: null,
    longitude: null,
    startDate: getLocalDateString(), // Default: today (safe local timezone)
    endDate: getLocalDateString(new Date(Date.now() + 86400000 * 3)), // Default: today + 3 days
    totalBudget: '',
    currency: 'INR',
    status: 'planning', // Lowercase status matching backend enum
    description: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Calendar Date Picker Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerType, setPickerType] = useState('startDate'); // 'startDate' or 'endDate'
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Country & Destination Suggestions States
  // Countries loaded instantly from local hardcoded list — no API, no errors
  const [countries] = useState(ALL_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);



  const handleDestinationChange = (text) => {
    setFormData(prev => ({ ...prev, destination: text, latitude: null, longitude: null }));

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setTypingTimeout(
      setTimeout(() => {
        fetchSuggestions(text);
      }, 300)
    );
  };

  const fetchSuggestions = async (query) => {
    if (!selectedCountry) return;
    setSuggestionsLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&countrycode=${selectedCountry.cca2}&limit=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features) {
          const places = data.features.map(f => {
            const p = f.properties;
            const parts = [];
            if (p.name) parts.push(p.name);
            if (p.state && p.state !== p.name) parts.push(p.state);
            if (p.country) parts.push(p.country);
            return {
              label: parts.join(', '),
              latitude: f.geometry.coordinates[1],
              longitude: f.geometry.coordinates[0]
            };
          });
          const uniquePlaces = [];
          const labels = new Set();
          places.forEach(item => {
            if (!labels.has(item.label)) {
              labels.add(item.label);
              uniquePlaces.push(item);
            }
          });
          setSuggestions(uniquePlaces);
        }
      }
    } catch (err) {
      console.error('[CreateTripScreen] Error fetching suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Custom formatted date for human reading
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Select Date';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCreate = async () => {
    if (!selectedCountry) {
      Alert.alert('Error', 'Please select a Country first.');
      return;
    }

    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Destination, Dates)');
      return;
    }

    setLoading(true);
    
    // Prepare data, casting budget to number
    const submissionData = {
      ...formData,
      totalBudget: formData.totalBudget ? Number(formData.totalBudget) : 0
    };

    try {
      const res = await client.post('/trips', submissionData);
      if (res.data.success) {
        Alert.alert('Success', 'Trip created successfully!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  // Calendar Helper Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = getLocalDateString(selectedDate);
    
    if (pickerType === 'startDate') {
      // If start date is selected, make sure end date is not before it by auto-adjusting (fully flexible!)
      setFormData(prev => {
        const update = { ...prev, startDate: dateStr };
        if (new Date(prev.endDate) < selectedDate) {
          update.endDate = dateStr;
        }
        return update;
      });
    } else {
      // If end date is selected, make sure start date is not after it by auto-adjusting (fully flexible!)
      setFormData(prev => {
        const update = { ...prev, endDate: dateStr };
        if (selectedDate < new Date(prev.startDate)) {
          update.startDate = dateStr;
        }
        return update;
      });
    }
    setShowDatePicker(false);
  };

  const openDatePicker = (type) => {
    setPickerType(type);
    setCurrentMonth(new Date(formData[type]));
    setShowDatePicker(true);
  };

  // Render Calendar Grid Days (Enforcing only past-date restriction, both dates fully flexible!)
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const dayCells = [];
    
    // Empty cells before first day of month
    for (let i = 0; i < firstDay; i++) {
      dayCells.push(<View key={`empty-${i}`} className="w-[12%] aspect-square" />);
    }
    
    const activeDateStr = formData[pickerType];
    const activeDate = new Date(activeDateStr);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const isSelected = activeDate.getFullYear() === year && 
                         activeDate.getMonth() === month && 
                         activeDate.getDate() === day;
                         
      // Only past dates are disabled (yesterday and older)
      const isDisabled = cellDate < today;
                          
      dayCells.push(
        <TouchableOpacity
          key={`day-${day}`}
          disabled={isDisabled}
          onPress={() => handleDateSelect(day)}
          className={`w-[12%] aspect-square items-center justify-center rounded-full my-0.5 ${
            isSelected ? 'bg-brand-500 shadow shadow-brand-500' : 'bg-transparent'
          }`}
          style={isDisabled ? { opacity: 0.15 } : {}}
        >
          <Text className={`text-xs font-bold ${
            isSelected ? 'text-white' : isDisabled ? 'text-neutral-600 line-through' : 'text-neutral-300'
          }`}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return dayCells;
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header Bar */}
        <View className="flex-row items-center px-6 py-4 border-b" style={{ borderColor: THEME.border }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1.5 rounded-full" style={{ backgroundColor: THEME.surfaceCard }}>
            <ChevronLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-white ml-4">Plan New Trip</Text>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Title Input */}
          <Input 
            label="Trip Title"
            placeholder="e.g. Summer Vacation 2026"
            value={formData.title}
            onChangeText={(val) => setFormData({...formData, title: val})}
          />

          {/* Country Trigger Input */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => setShowCountryModal(true)}
            className="mb-4"
          >
            <View pointerEvents="none">
              <Input 
                label="Country"
                placeholder="Select travel destination country"
                value={selectedCountry ? selectedCountry.name : ''}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {/* Destination Input (w/ Autocomplete suggestions) */}
          <View className="mb-4 relative">
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (!selectedCountry) {
                  setShowCountryModal(true);
                }
              }}
            >
              <View pointerEvents={selectedCountry ? "auto" : "none"}>
                <Input 
                  label="Destination"
                  placeholder={selectedCountry ? "e.g. Paris, Tokyo, Goa" : "Please select country first"}
                  value={formData.destination}
                  onChangeText={handleDestinationChange}
                  editable={!!selectedCountry}
                  style={!selectedCountry ? { opacity: 0.5 } : {}}
                />
              </View>
            </TouchableOpacity>

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <View 
                className="border rounded-2xl p-2 mb-4 -mt-2"
                style={{ backgroundColor: THEME.surfaceCard, borderColor: THEME.border }}
              >
                {suggestions.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        destination: suggestion.label,
                        latitude: suggestion.latitude,
                        longitude: suggestion.longitude
                      }));
                      setSuggestions([]);
                    }}
                    className={`flex-row items-center py-3 px-4 ${
                      idx < suggestions.length - 1 ? 'border-b' : ''
                    }`}
                    style={{ borderColor: THEME.border }}
                  >
                    <MapPin size={16} color={THEME.brand} />
                    <Text className="text-white text-xs font-semibold ml-3 flex-1">
                      {suggestion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {suggestionsLoading && (
              <View className="px-4 pb-4 -mt-2">
                <Text className="text-xs" style={{ color: THEME.textSecondary }}>Searching suggestions...</Text>
              </View>
            )}
          </View>
          
          {/* Budget Input (INR) */}
          <Input 
            label="Total Budget (INR)"
            placeholder="e.g. 50000"
            keyboardType="numeric"
            value={formData.totalBudget}
            onChangeText={(val) => setFormData({...formData, totalBudget: val})}
          />


          {/* Date Pickers Row */}
          <View className="flex-row gap-x-4 mb-6">
            {/* Start Date */}
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: THEME.textSecondary }}>Start Date</Text>
              <TouchableOpacity
                onPress={() => openDatePicker('startDate')}
                activeOpacity={0.8}
                className="flex-row items-center border rounded-2xl px-4 justify-between"
                style={{ backgroundColor: THEME.surfaceCard, borderColor: THEME.border, height: 48 }}
              >
                <Text className="text-white text-xs font-extrabold">
                  {formatDateDisplay(formData.startDate)}
                </Text>
                <Calendar size={15} color={THEME.brand} />
              </TouchableOpacity>
            </View>

            {/* End Date */}
            <View className="flex-1">
              <Text className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: THEME.textSecondary }}>End Date</Text>
              <TouchableOpacity
                onPress={() => openDatePicker('endDate')}
                activeOpacity={0.8}
                className="flex-row items-center border rounded-2xl px-4 justify-between"
                style={{ backgroundColor: THEME.surfaceCard, borderColor: THEME.border, height: 48 }}
              >
                <Text className="text-white text-xs font-extrabold">
                  {formatDateDisplay(formData.endDate)}
                </Text>
                <Calendar size={15} color={THEME.brand} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Option */}
          <Input 
            label="Description (Optional)"
            placeholder="What is the masterplan?"
            multiline
            className="h-24"
            value={formData.description}
            onChangeText={(val) => setFormData({...formData, description: val})}
          />

          {/* CTA Create Button */}
          <Button 
            title="Create Trip" 
            onPress={handleCreate} 
            loading={loading}
            className="mt-6 mb-6"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Dark Mode Custom Calendar Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        >
          {/* Calendar Box */}
          <TouchableOpacity
            activeOpacity={1}
            className="w-full border rounded-[30px] p-5"
            style={{ backgroundColor: THEME.surfaceCard, borderColor: THEME.border }}
          >
            {/* Calendar Header */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={handlePrevMonth} className="p-2 rounded-full" style={{ backgroundColor: THEME.surface }}>
                <ChevronLeft size={16} color="#ffffff" />
              </TouchableOpacity>
              
              <Text className="text-sm font-extrabold text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              
              <TouchableOpacity onPress={handleNextMonth} className="p-2 rounded-full" style={{ backgroundColor: THEME.surface }}>
                <ChevronRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View className="flex-row justify-between mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <View key={day} className="w-[12%] items-center">
                  <Text className="text-[10px] font-black text-neutral-500 uppercase">{day}</Text>
                </View>
              ))}
            </View>

            {/* Days of Month Grid */}
            <View className="flex-row flex-wrap justify-between">
              {renderCalendarDays()}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity 
              onPress={() => setShowDatePicker(false)} 
              className="mt-5 items-center py-2.5 rounded-full"
              style={{ backgroundColor: THEME.surface }}
            >
              <Text className="text-xs font-black text-neutral-400">Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Premium Searchable Country Selector Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCountryModal(false);
          setCountrySearch('');
        }}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: THEME.surface }}>
          {/* Modal Header */}
          <View className="flex-row items-center px-6 py-4 border-b" style={{ borderColor: THEME.border }}>
            <TouchableOpacity 
              onPress={() => {
                setShowCountryModal(false);
                setCountrySearch('');
              }} 
              className="p-1.5 rounded-full" 
              style={{ backgroundColor: THEME.surfaceCard }}
            >
              <ChevronLeft size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-white ml-4">Select Country</Text>
          </View>

          {/* Search Input */}
          <View className="px-6 pt-4 pb-2">
            <View 
              className="flex-row items-center border rounded-2xl px-4 py-1.5"
              style={{ backgroundColor: THEME.surfaceCard, borderColor: THEME.border }}
            >
              <Search size={16} color={THEME.textSecondary} />
              <TextInput
                placeholder="Search country..."
                placeholderTextColor="#525252"
                value={countrySearch}
                onChangeText={setCountrySearch}
                className="text-white text-sm ml-3 flex-1 py-1.5"
                style={{ color: '#ffffff' }}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Scrollable list of countries */}
          <ScrollView 
            className="flex-1 px-6 mt-2"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {countries.length === 0 ? (
              <View className="items-center py-12">
                <Text style={{ color: THEME.textSecondary }} className="text-xs font-semibold">Loading countries list...</Text>
              </View>
            ) : filteredCountries.length === 0 ? (
              <View className="items-center py-12">
                <Text style={{ color: THEME.textSecondary }} className="text-xs font-semibold">No countries found</Text>
              </View>
            ) : (
              filteredCountries.map((c) => (
                <TouchableOpacity
                  key={c.cca2}
                  onPress={() => {
                    setSelectedCountry(c);
                    setFormData(prev => ({ ...prev, destination: '' }));
                    setSuggestions([]);
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                  className="flex-row items-center justify-between py-4 border-b"
                  style={{ borderColor: THEME.border }}
                >
                  <View className="flex-row items-center">
                    <Globe size={16} color={THEME.textSecondary} />
                    <Text className="text-white text-sm font-semibold ml-3">{c.name}</Text>
                  </View>
                  {selectedCountry?.cca2 === c.cca2 && (
                    <Check size={16} color={THEME.brand} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
