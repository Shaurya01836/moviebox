import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Movie } from '../lib/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PlayerProvider = {
  id: string;
  name: string;
  getUrl: (tmdbId: string | number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
};

const PROVIDERS: PlayerProvider[] = [
  {
    id: 'vidy',
    name: 'Server 1 (Vidy)',
    getUrl: (tmdbId, type, season = 1, episode = 1) => type === 'movie' 
      ? `https://vidy.st/movie/${tmdbId}?color=DC2626&autoplay=true`
      : `https://vidy.st/tv/${tmdbId}/${season}/${episode}?color=DC2626&autoplay=true`
  },
  {
    id: 'vidsrc',
    name: 'Server 2 (VidSrc)',
    getUrl: (tmdbId, type, season = 1, episode = 1) => type === 'movie' 
      ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
  },
  {
    id: 'vidcore',
    name: 'Server 3 (VidCore)',
    getUrl: (tmdbId, type, season = 1, episode = 1) => type === 'movie' 
      ? `https://vidcore.org/embed/movie/${tmdbId}`
      : `https://vidcore.org/embed/series/${tmdbId}/${season}/${episode}`
  },
  {
    id: 'vidlink',
    name: 'Server 4 (VidLink)',
    getUrl: (tmdbId, type, season = 1, episode = 1) => type === 'movie'
      ? `https://vidlink.pro/movie/${tmdbId}`
      : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
  }
];

interface Props {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

export default function PlayerScreen({ navigation, route }: Props) {
  const { movie, season, episode } = route.params as { movie: Movie, season?: number, episode?: number };
  const [isLoading, setIsLoading] = useState(true);
  const [activeProviderId, setActiveProviderId] = useState<string>(PROVIDERS[0].id);

  const mediaType = (movie as any).mediaKind === 'tv' ? 'tv' : 'movie';
  const activeProvider = PROVIDERS.find((p) => p.id === activeProviderId) || PROVIDERS[0];
  const streamUrl = activeProvider.getUrl(movie.id, mediaType, season, episode);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{movie.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Player Container */}
      <View style={styles.playerContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.loadingText}>Loading {activeProvider.name}...</Text>
          </View>
        )}

        <WebView
          key={activeProviderId}
          source={{ uri: streamUrl }}
          style={styles.videoView}
          allowsFullscreenVideo
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Server Switcher */}
      <View style={styles.serversContainer}>
        <Text style={styles.serversLabel}>Select Server:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serversScroll}>
          {PROVIDERS.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={[styles.serverBtn, activeProviderId === provider.id && styles.serverBtnActive]}
              onPress={() => setActiveProviderId(provider.id)}
            >
              <Text style={[styles.serverBtnText, activeProviderId === provider.id && styles.serverBtnTextActive]}>
                {provider.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Movie Info below player */}
      <View style={styles.infoSection}>
        <Text style={styles.movieTitle}>{movie.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.rating}>★ {movie.voteAverage}</Text>
          <Text style={styles.metaDot}>  •  </Text>
          <Text style={styles.metaText}>{movie.releaseYear}</Text>
          <Text style={styles.metaDot}>  •  </Text>
          <Text style={styles.qualityBadge}>{movie.qualityBadge || 'HD'}</Text>
        </View>
        <Text style={styles.overview} numberOfLines={4}>{movie.overview}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#000',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: 20 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 8 },
  playerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', zIndex: 10,
  },
  loadingText: { color: '#A1A1AA', fontSize: 13, marginTop: 12, textAlign: 'center' },
  videoView: { flex: 1, backgroundColor: '#000' },
  serversContainer: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  serversLabel: {
    color: '#A1A1AA', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8,
  },
  serversScroll: {
    paddingHorizontal: 16, gap: 8,
  },
  serverBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A',
  },
  serverBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444',
  },
  serverBtnText: {
    color: '#A1A1AA', fontSize: 13, fontWeight: '600',
  },
  serverBtnTextActive: {
    color: '#EF4444',
  },
  infoSection: { padding: 16 },
  movieTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rating: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  metaDot: { color: '#71717A' },
  metaText: { color: '#A1A1AA', fontSize: 13 },
  qualityBadge: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
  overview: { color: '#A1A1AA', fontSize: 14, lineHeight: 22 },
});
