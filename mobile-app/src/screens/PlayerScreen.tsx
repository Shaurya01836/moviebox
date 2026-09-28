import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, NavigationProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Movie } from '../lib/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDSRC_BASE = 'https://vidsrc.to/embed';

interface Props {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

export default function PlayerScreen({ navigation, route }: Props) {
  const { movie } = route.params as { movie: Movie };
  const [isLoading, setIsLoading] = useState(true);

  // Use the correct vidsrc endpoint for movie vs tv
  const mediaType = (movie as any).mediaKind === 'tv' ? 'tv' : 'movie';
  const streamUrl = `${VIDSRC_BASE}/${mediaType}/${movie.id}`;

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
            <Text style={styles.loadingText}>Loading stream for "{movie.title}"...</Text>
          </View>
        )}

        <WebView
          source={{ uri: streamUrl }}
          style={styles.videoView}
          allowsFullscreenVideo
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
        />
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
    ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', zIndex: 10,
  },
  loadingText: { color: '#A1A1AA', fontSize: 13, marginTop: 12, textAlign: 'center' },
  videoView: { flex: 1, backgroundColor: '#000' },
  infoSection: { padding: 20 },
  movieTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rating: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  metaDot: { color: '#71717A' },
  metaText: { color: '#A1A1AA', fontSize: 13 },
  qualityBadge: { color: '#EF4444', fontWeight: 'bold', fontSize: 12 },
  overview: { color: '#A1A1AA', fontSize: 14, lineHeight: 22 },
});
