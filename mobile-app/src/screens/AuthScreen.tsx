import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useProfile, AVATAR_OPTIONS, getAvatarOption } from '../context/ProfileContext';

interface Props { navigation: NavigationProp<any>; }

export default function AuthScreen({ navigation }: Props) {
  const { user, signIn, signUp, signOut } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile State
  const [profileName, setProfileName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_OPTIONS[0].id);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || user?.email?.split('@')[0] || '');
      setSelectedAvatarId(profile.avatarUrl || AVATAR_OPTIONS[0].id);
    } else if (user) {
      setProfileName(user.email?.split('@')[0] || '');
      setSelectedAvatarId(AVATAR_OPTIONS[0].id);
    }
  }, [profile, user]);

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.'); return;
    }
    setLoading(true); setError(null); setSuccess(null);
    const fn = mode === 'login' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      if (mode === 'register') {
        // Automatically set initial profile on register
        await updateProfile(email.split('@')[0], AVATAR_OPTIONS[0].id);
      }
      setSuccess(mode === 'login' ? 'Signed in!' : 'Account created!');
      setTimeout(() => navigation.goBack(), 800);
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    await updateProfile(profileName, selectedAvatarId);
    setLoading(false);
    navigation.goBack();
  };

  if (user) {
    // Render Edit Profile & Avatar Screen
    const currentAvatarUrl = getAvatarOption(selectedAvatarId).url;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kbView}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            
            <Text style={styles.profileTitle}>Edit Profile & Avatar</Text>

            {/* Current Avatar Preview */}
            <View style={styles.currentAvatarContainer}>
              <View style={styles.currentAvatarRing}>
                <Image source={{ uri: currentAvatarUrl }} style={styles.currentAvatarImg} />
              </View>
            </View>

            {/* Profile Name Input */}
            <View style={styles.field}>
              <Text style={styles.profileLabel}>PROFILE NAME</Text>
              <TextInput
                style={styles.profileInput}
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter your name"
                placeholderTextColor="#52525B"
              />
            </View>

            {/* Avatar Picker Grid */}
            <View style={styles.field}>
              <View style={styles.avatarGridHeader}>
                <Text style={styles.profileLabel}>CHOOSE AN AVATAR ICON</Text>
                <Text style={styles.avatarCount}>16 DiceBear Avatars</Text>
              </View>
              
              <View style={styles.avatarGridContainer}>
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <TouchableOpacity 
                      key={avatar.id} 
                      style={styles.avatarGridItem}
                      onPress={() => setSelectedAvatarId(avatar.id)}
                    >
                      <View style={[styles.avatarChoiceRing, isSelected && styles.avatarChoiceRingSelected]}>
                        <Image source={{ uri: avatar.url }} style={styles.avatarChoiceImg} />
                        {isSelected && (
                          <View style={styles.checkmarkBadge}>
                            <Text style={styles.checkmarkText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.avatarNameText}>{avatar.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleProfileSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render Login/Register Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kbView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←  Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>MOVIE<Text style={styles.logoRed}>BOX</Text></Text>
            <Text style={styles.tagline}>Your Personal Cinema</Text>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => { setMode('login'); setError(null); setSuccess(null); }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.activeTab]}
              onPress={() => { setMode('register'); setError(null); setSuccess(null); }}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome back to MovieBox' : 'Create your MovieBox account'}
          </Text>
          <Text style={styles.formSubtitle}>
            {mode === 'login' ? 'Enter your credentials to continue.' : 'Sign up to save movies and build your watchlist.'}
          </Text>

          {/* Feedback */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠  {error}</Text>
            </View>
          )}
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓  {success}</Text>
            </View>
          )}

          {/* Fields */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#52525B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwWrapper}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#52525B"
                secureTextEntry={!showPw}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Text style={styles.eyeText}>{showPw ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleAuthSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#09090B" />
              : <Text style={styles.submitText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess(null); }}>
              <Text style={styles.switchLink}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  kbView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  // Profile Editor Styles
  profileTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', textAlign: 'center', marginBottom: 24, letterSpacing: -0.5 },
  currentAvatarContainer: { alignItems: 'center', marginBottom: 32 },
  currentAvatarRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#27272A', borderWidth: 4, borderColor: '#5B21B6', padding: 4, overflow: 'hidden' },
  currentAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 45 },
  profileLabel: { color: '#A1A1AA', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  profileInput: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFF', fontSize: 15, fontWeight: '700' },
  avatarGridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  avatarCount: { color: '#71717A', fontSize: 10, fontWeight: '500' },
  avatarGridContainer: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#18181B', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#27272A', justifyContent: 'space-between' },
  avatarGridItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  avatarChoiceRing: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#27272A', padding: 2, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  avatarChoiceRingSelected: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  avatarChoiceImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 26 },
  checkmarkBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#18181B' },
  checkmarkText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  avatarNameText: { color: '#A1A1AA', fontSize: 9, marginTop: 6, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#27272A' },
  cancelText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444' },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  signOutBtn: { marginTop: 32, alignItems: 'center' },
  signOutText: { color: '#71717A', fontSize: 13, fontWeight: '600' },

  // Auth Styles
  backBtn: { marginBottom: 24 },
  backText: { color: '#A1A1AA', fontSize: 14 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  logoRed: { color: '#EF4444' },
  tagline: { color: '#52525B', fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9 },
  activeTab: { backgroundColor: '#27272A' },
  tabText: { color: '#71717A', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: '#71717A', marginBottom: 20 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  successBox: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 10, padding: 12, marginBottom: 14 },
  successText: { color: '#6EE7B7', fontSize: 13 },
  field: { marginBottom: 14 },
  label: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: '#FFF', fontSize: 14 },
  pwWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 12 },
  eyeText: { fontSize: 16 },
  submitBtn: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20 },
  submitText: { color: '#09090B', fontWeight: 'bold', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  switchText: { color: '#71717A', fontSize: 13 },
  switchLink: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  terms: { color: '#3F3F46', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
