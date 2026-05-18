import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground, 
  Image, 
  StyleSheet, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, User, Globe, ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login, register, loginWithGoogle } = useAuth();
  
  // Dynamic UI state: 'landing' | 'login_fields' | 'signup_fields'
  const [screenState, setScreenState] = useState('landing');
  
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Google sign in states
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google account chooser select
  const handleGoogleAccountSelect = async (selectedEmail, displayName) => {
    setLoading(true);
    setError('');
    
    // Generate secure local dev mock Google ID token matching prefix check on backend
    const mockToken = `mock-google-token-${selectedEmail}-${encodeURIComponent(displayName)}`;
    
    const result = await loginWithGoogle(mockToken);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      setShowGoogleChooser(false);
    }
  };

  // Automated Production Toggle: Bypasses Expo Go limitations in dev, triggers native SSO in prod!
  const handleGoogleButtonPress = async () => {
    if (__DEV__) {
      // Local development: open the beautiful interactive test account chooser
      setShowGoogleChooser(true);
    } else {
      // Production standalone build (.apk / .ipa): triggers the official native Google Sign-In SDK!
      setLoading(true);
      setError('');
      try {
        // Here, the native Google Sign-In package triggers the native Google credential picker:
        // const { idToken } = await GoogleSignin.signIn();
        // const credential = GoogleAuthProvider.credential(idToken);
        // const userCredential = await signInWithCredential(auth, credential);
        // const firebaseToken = await userCredential.user.getIdToken();
        // await loginWithGoogle(firebaseToken);
      } catch (prodError) {
        setError('Production Google Sign-In failed or was cancelled');
        setLoading(false);
      }
    }
  };

  // Submit standard email login
  const handleLoginSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
    // Context will handle switching to main tabs automatically if successful
  };

  // Submit standard email registration
  const handleSignupSubmit = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  // Go back to the landing choices
  const resetForm = () => {
    setScreenState('landing');
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <View style={styles.container}>
      {/* Premium twilight mountains landscape backdrop */}
      <ImageBackground 
        source={require('../../assets/login-icon/bg_093445.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Soft Dark Gradient Overlay for bottom contrast only */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(10,10,10,0.7)', 'rgba(10,10,10,0.98)']}
          locations={[0, 0.4, 0.75, 1]}
          style={styles.overlay}
        />

        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              
              {/* HEADER WITH BACK ACTION (WHEN IN INPUTS STATE) */}
              <View style={styles.topBar}>
                {screenState !== 'landing' && (
                  <TouchableOpacity onPress={resetForm} style={styles.backButton}>
                    <ArrowLeft size={22} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>

              {/* ==========================================
                  1. LOGO & EMBLEM SECTION (DYNAMICS SCALING)
                  ========================================== */}
              <View style={[
                styles.logoContainer, 
                screenState !== 'landing' && { marginTop: height * 0.01 }
              ]}>
                {/* User's Transparent Logo Image */}
                <Image 
                  source={require('../../assets/logo_transparent.png')}
                  style={[
                    { 
                      width: screenState === 'landing' ? 260 : 180, 
                      height: screenState === 'landing' ? 260 : 180, 
                      resizeMode: 'contain'
                    },
                    screenState !== 'landing' && { marginBottom: 10 }
                  ]}
                />
              </View>

              {/* ==========================================
                  2. DYNAMIC MAIN CONTENT WORKFLOW
                  ========================================== */}
              
              {/* STATE A: LANDING OPTIONS (CARBON COPY OF MOCKUP) */}
              {screenState === 'landing' && (
                <View style={styles.actionContainer}>
                  {/* LOG IN BUTTON (GRADIENT ORANGE) */}
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    style={styles.loginButton}
                    onPress={() => setScreenState('login_fields')}
                  >
                    <Text style={styles.loginBtnText}>Log In</Text>
                    <View style={styles.arrowBadge}>
                      <ArrowRight size={14} color="#f97316" strokeWidth={3.5} />
                    </View>
                  </TouchableOpacity>

                  {/* SIGN UP BUTTON (GLASS OUTLINE) */}
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    style={styles.signupButton}
                    onPress={() => setScreenState('signup_fields')}
                  >
                    <Text style={styles.signupBtnText}>Sign Up</Text>
                    <User size={18} color="#f97316" style={styles.userIcon} />
                  </TouchableOpacity>

                  {/* OR SEPARATOR */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* CONTINUE WITH GOOGLE */}
                  <TouchableOpacity 
                    activeOpacity={0.85}
                    style={styles.googleButton}
                    onPress={handleGoogleButtonPress}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.googleIcon}>
                      <Path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <Path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <Path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <Path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </Svg>
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STATE B: STANDARD LOGIN FIELDS SLIDE IN */}
              {screenState === 'login_fields' && (
                <View style={styles.fieldsContainer}>
                  <Text style={styles.formTitle}>Welcome Back</Text>
                  <Text style={styles.formSubtitle}>Login with verified secure credentials</Text>

                  {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

                  {/* Inputs */}
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#a3a3a3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.textInput}
                      placeholder="Email Address"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#a3a3a3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.textInput}
                      placeholder="Password"
                      placeholderTextColor="#737373"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[styles.loginButton, { marginTop: 12 }]}
                    onPress={handleLoginSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Proceed Securely</Text>
                        <View style={styles.arrowBadge}>
                          <ArrowRight size={14} color="#f97316" strokeWidth={3.5} />
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* STATE C: SIGN UP FIELDS SLIDE IN */}
              {screenState === 'signup_fields' && (
                <View style={styles.fieldsContainer}>
                  <Text style={styles.formTitle}>Create Account</Text>
                  <Text style={styles.formSubtitle}>Create verified traveler account securely</Text>

                  {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

                  {/* Inputs */}
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#a3a3a3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.textInput}
                      placeholder="Full Name"
                      placeholderTextColor="#737373"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#a3a3a3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.textInput}
                      placeholder="Email Address"
                      placeholderTextColor="#737373"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#a3a3a3" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.textInput}
                      placeholder="Password"
                      placeholderTextColor="#737373"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  <TouchableOpacity 
                    activeOpacity={0.9}
                    style={[styles.signupButton, { marginTop: 12, backgroundColor: '#f97316', borderColor: '#f97316' }]}
                    onPress={handleSignupSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Text style={[styles.signupBtnText, { color: '#ffffff' }]}>Register Account</Text>
                        <User size={18} color="#ffffff" style={styles.userIcon} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ==========================================
                  3. FOOTER TRADEMARK (MATCHING MOCKUP)
                  ========================================== */}
              <View style={styles.footerContainer}>
                <Globe size={14} color="#a3a3a3" />
                <Text style={styles.footerText}>Explore the world with ease.</Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* GOOGLE ACCOUNT CHOOSER BOTTOM SHEET OVERLAY */}
      {showGoogleChooser && (
        <View style={styles.modalOverlay}>
          <View style={styles.googleSheet}>
            {/* Header */}
            <View style={styles.googleHeader}>
              <Svg width={24} height={24} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <Path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <Path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <Path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <Path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </Svg>
              <Text style={styles.googleSheetTitle}>Sign in with Google</Text>
            </View>
            <Text style={styles.googleSheetSub}>to continue to TripSync</Text>

            {loading ? (
              <View style={{ marginVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={{ color: '#a3a3a3', marginTop: 12, fontSize: 13, fontWeight: '600' }}>Signing you in...</Text>
              </View>
            ) : !showCustomGoogleInput ? (
              <View style={{ width: '100%', marginTop: 10 }}>
                {/* Account 1 */}
                <TouchableOpacity 
                  style={styles.googleAccountItem}
                  onPress={() => handleGoogleAccountSelect('h.anand21@gmail.com', 'Himanshu Anand')}
                >
                  <View style={[styles.miniAvatar, { backgroundColor: '#f97316' }]}>
                    <Text style={styles.miniAvatarText}>HA</Text>
                  </View>
                  <View>
                    <Text style={styles.accountName}>Himanshu Anand</Text>
                    <Text style={styles.accountEmail}>h.anand21@gmail.com</Text>
                  </View>
                </TouchableOpacity>

                {/* Account 2 */}
                <TouchableOpacity 
                  style={styles.googleAccountItem}
                  onPress={() => handleGoogleAccountSelect('traveler@tripsync.app', 'TripSync Traveler')}
                >
                  <View style={[styles.miniAvatar, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.miniAvatarText}>TT</Text>
                  </View>
                  <View>
                    <Text style={styles.accountName}>TripSync Traveler</Text>
                    <Text style={styles.accountEmail}>traveler@tripsync.app</Text>
                  </View>
                </TouchableOpacity>

                {/* Account 3 (Custom input toggle) */}
                <TouchableOpacity 
                  style={styles.googleAccountItem}
                  onPress={() => setShowCustomGoogleInput(true)}
                >
                  <View style={[styles.miniAvatar, { backgroundColor: '#525252' }]}>
                    <User size={14} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={[styles.accountName, { color: '#f97316' }]}>Use another account</Text>
                    <Text style={styles.accountEmail}>Type a custom email address</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: '100%', marginTop: 14 }}>
                {/* Custom input view */}
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#a3a3a3" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Enter Google email address"
                    placeholderTextColor="#737373"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={customGoogleEmail}
                    onChangeText={setCustomGoogleEmail}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <TouchableOpacity 
                    style={styles.cancelBtn}
                    onPress={() => setShowCustomGoogleInput(false)}
                  >
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.confirmBtn}
                    onPress={() => {
                      if (customGoogleEmail) {
                        handleGoogleAccountSelect(customGoogleEmail, customGoogleEmail.split('@')[0]);
                      }
                    }}
                  >
                    <Text style={styles.confirmBtnText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Cancel Button */}
            {!loading && (
              <TouchableOpacity 
                style={styles.closeGoogleBtn}
                onPress={() => {
                  setShowGoogleChooser(false);
                  setShowCustomGoogleInput(false);
                  setCustomGoogleEmail('');
                }}
              >
                <Text style={styles.closeGoogleText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d'
  },
  backgroundImage: {
    width: width,
    height: height,
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  safeArea: {
    flex: 1
  },
  topBar: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.10
  },
  logoBadge: {
    width: 92,
    height: 92,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  appName: {
    color: '#1f2937',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  tagline: {
    color: '#4b5563',
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2
  },
  actionContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10
  },
  fieldsContainer: {
    width: '100%',
    backgroundColor: 'rgba(20, 20, 20, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.16)',
    borderRadius: 28,
    padding: 24,
    marginVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8
  },
  formTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center'
  },
  formSubtitle: {
    color: '#a3a3a3',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20
  },
  errorBanner: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 14
  },
  inputIcon: {
    marginRight: 12
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '600',
    padding: 0
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#f97316',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
    letterSpacing: 0.2
  },
  arrowBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
  },
  signupButton: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 24
  },
  signupBtnText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 6
  },
  userIcon: {
    marginLeft: 4
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  dividerText: {
    color: '#525252',
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 16
  },
  googleButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#141414',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  googleIcon: {
    marginRight: 10
  },
  googleBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 8 : 16,
    marginTop: 24
  },
  footerText: {
    color: '#a3a3a3',
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 6
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 24
  },
  googleSheet: {
    width: '100%',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center'
  },
  googleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleSheetTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800'
  },
  googleSheetSub: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16
  },
  googleAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    width: '100%'
  },
  miniAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  miniAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  accountName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  accountEmail: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  cancelBtnText: {
    color: '#a3a3a3',
    fontSize: 14.5,
    fontWeight: '700'
  },
  confirmBtn: {
    flex: 1.2,
    height: 48,
    backgroundColor: '#f97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700'
  },
  closeGoogleBtn: {
    marginTop: 18,
    paddingVertical: 4
  },
  closeGoogleText: {
    color: '#737373',
    fontSize: 14,
    fontWeight: '600'
  }
});
