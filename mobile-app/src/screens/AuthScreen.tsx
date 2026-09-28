import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface Props { navigation: NavigationProp<any>; }

export default function AuthScreen({ navigation }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
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
      setSuccess(mode === 'login' ? 'Signed in!' : 'Account created!');
      setTimeout(() => navigation.goBack(), 800);
    }
  };

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
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
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
  backBtn: { marginBottom: 24 },
  backText: { color: '#A1A1AA', fontSize: 14 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
  logoRed: { color: '#EF4444' },
  tagline: { color: '#52525B', fontSize: 13, marginTop: 4 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 12, padding: 4, marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9 },
  activeTab: { backgroundColor: '#27272A' },
  tabText: { color: '#71717A', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: '#71717A', marginBottom: 20 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10, padding: 12, marginBottom: 14,
  },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  successBox: {
    backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 10, padding: 12, marginBottom: 14,
  },
  successText: { color: '#6EE7B7', fontSize: 13 },
  field: { marginBottom: 14 },
  label: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: '#FFF', fontSize: 14,
  },
  pwWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 12 },
  eyeText: { fontSize: 16 },
  submitBtn: {
    backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20,
  },
  submitText: { color: '#09090B', fontWeight: 'bold', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  switchText: { color: '#71717A', fontSize: 13 },
  switchLink: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  terms: { color: '#3F3F46', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
