import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Movie, fetchMovieDetails } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const STATUS_OPTIONS = [
  { key: 'watchlist', label: '📌 Want to Watch', color: '#3B82F6' },
  { key: 'watching', label: '🔥 Currently Watching', color: '#F59E0B' },
  { key: 'watched', label: '✅ Watched', color: '#10B981' },
] as const;

export default function DetailsScreen({ navigation, route }: Props) {
  const { movie: passedMovie } = route.params as { movie: Movie };
  const [movie, setMovie] = useState<Movie & { runtime?: number; tagline?: string }>(passedMovie);
  const [loading, setLoading] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const { user } = useAuth();
  const { getByMediaId, upsert, remove } = useWatchlist();
  const watchlistItem = getByMediaId(movie.id);
  const inWatchlist = !!watchlistItem;

  useEffect(() => {
    fetchMovieDetails(passedMovie.id)
      .then(setMovie)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [passedMovie.id]);

  const handleStatusSelect = async (status: 'watchlist' | 'watching' | 'watched') => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }
    setStatusMenuOpen(false);
    await upsert({
      mediaId: movie.id,
      mediaKind: (movie.mediaKind as any) || 'movie',
      title: movie.title,
      posterPath: movie.posterPath,
      backdropPath: movie.backdropPath,
      releaseYear: movie.releaseYear,
      voteAverage: movie.voteAverage,
      genres: movie.genres,
      status,
    });
  };

  const handleRemove = async () => {
    Alert.alert('Remove from Library', `Remove "${movie.title}" from your library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await remove(movie.id);
        }
      },
    ]);
  };

  const currentStatusConfig = STATUS_OPTIONS.find((s) => s.key === watchlistItem?.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Backdrop */}
      <View style={styles.backdropContainer}>
        <Image source={{ uri: movie.backdropPath }} style={styles.backdrop} />
        <View style={styles.backdropOverlay} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Poster + Info Row */}
        <View style={styles.infoRow}>
          <Image source={{ uri: movie.posterPath }} style={styles.poster} />
          <View style={styles.infoText}>
            <Text style={styles.title} numberOfLines={3}>{movie.title}</Text>
            {(movie as any).tagline ? (
              <Text style={styles.tagline} numberOfLines={2}>"{(movie as any).tagline}"</Text>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={styles.rating}>★ {movie.voteAverage}</Text>
              <Text style={styles.metaDivider}>|</Text>
              <Text style={styles.metaText}>{movie.releaseYear}</Text>
              {(movie as any).runtime ? (
                <>
                  <Text style={styles.metaDivider}>|</Text>
                  <Text style={styles.metaText}>
                    {Math.floor((movie as any).runtime / 60)}h {(movie as any).runtime % 60}m
                  </Text>
                </>
              ) : null}
            </View>
            <View style={styles.genresRow}>
              {movie.genres.slice(0, 3).map((g) => (
                <View key={g} style={styles.genreTag}>
                  <Text style={styles.genreTagText}>{g}</Text>
                </View>
              ))}
            </View>

            {/* Current status badge */}
            {watchlistItem && (
              <View style={[styles.statusBadge, { borderColor: currentStatusConfig?.color ?? '#52525B' }]}>
                <Text style={[styles.statusBadgeText, { color: currentStatusConfig?.color ?? '#A1A1AA' }]}>
                  {currentStatusConfig?.label ?? watchlistItem.status}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quality Badge */}
        <View style={styles.qualityRow}>
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{movie.qualityBadge || 'HD'}</Text>
          </View>
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{movie.mediaKind === 'tv' ? '📺 TV Show' : '🎬 Movie'}</Text>
          </View>
        </View>

        {/* Overview */}
        <Text style={styles.sectionLabel}>Overview</Text>
        <Text style={styles.overview}>{movie.overview}</Text>

        {/* Play Button */}
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => navigation.navigate('Player', { movie })}
        >
          <Text style={styles.playBtnIcon}>▶</Text>
          <Text style={styles.playBtnText}>Start Watching</Text>
        </TouchableOpacity>

        {/* Watchlist / Status Button */}
        {inWatchlist ? (
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={[styles.watchlistBtn, styles.watchlistBtnActive]}
              onPress={() => setStatusMenuOpen(!statusMenuOpen)}
            >
              <Text style={styles.watchlistBtnText}>
                {currentStatusConfig?.label ?? '✅ In Library'}  ▾
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
              <Text style={styles.removeBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.watchlistBtn}
            onPress={() => {
              if (!user) { navigation.navigate('Auth'); return; }
              setStatusMenuOpen(!statusMenuOpen);
            }}
          >
            <Text style={styles.watchlistBtnText}>+ Add to Library</Text>
          </TouchableOpacity>
        )}

        {/* Status Picker Dropdown */}
        {statusMenuOpen && (
          <View style={styles.statusMenu}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.statusMenuItem, watchlistItem?.status === s.key && { backgroundColor: 'rgba(239,68,68,0.1)' }]}
                onPress={() => handleStatusSelect(s.key)}
              >
                <Text style={[styles.statusMenuItemText, { color: s.color }]}>{s.label}</Text>
                {watchlistItem?.status === s.key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  backdropContainer: { height: 230, position: 'relative' },
  backdrop: { width: '100%', height: '100%', resizeMode: 'cover' },
  backdropOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(9, 9, 11, 0.55)' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(9,9,11,0.7)', width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: 18 },
  content: { padding: 16, paddingBottom: 60 },
  infoRow: { flexDirection: 'row', marginBottom: 16 },
  poster: { width: 110, height: 160, borderRadius: 12, marginRight: 14, backgroundColor: '#18181B' },
  infoText: { flex: 1, justifyContent: 'flex-start' },
  title: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  tagline: { fontSize: 12, color: '#71717A', fontStyle: 'italic', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  rating: { color: '#FBBF24', fontWeight: 'bold', fontSize: 13 },
  metaDivider: { color: '#27272A', marginHorizontal: 6, fontSize: 13 },
  metaText: { color: '#A1A1AA', fontSize: 12 },
  genresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  genreTag: { backgroundColor: '#18181B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: '#27272A' },
  genreTagText: { color: '#A1A1AA', fontSize: 10 },
  statusBadge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  qualityBadge: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  qualityText: { color: '#EF4444', fontSize: 11, fontWeight: 'bold' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#A1A1AA', marginBottom: 6, letterSpacing: 0.5 },
  overview: { color: '#D4D4D8', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, marginBottom: 10 },
  playBtnIcon: { color: '#FFF', fontSize: 14, marginRight: 8 },
  playBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  statusActions: { flexDirection: 'row', gap: 8, marginBottom: 2 },
  watchlistBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B', paddingVertical: 12, borderRadius: 12 },
  watchlistBtnActive: { borderColor: 'rgba(16,185,129,0.5)', backgroundColor: 'rgba(16,185,129,0.08)' },
  watchlistBtnText: { color: '#D4D4D8', fontWeight: '600', fontSize: 14 },
  removeBtn: { width: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12 },
  removeBtnText: { fontSize: 18 },
  statusMenu: { marginTop: 8, backgroundColor: '#18181B', borderRadius: 12, borderWidth: 1, borderColor: '#27272A', overflow: 'hidden' },
  statusMenuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  statusMenuItemText: { fontSize: 14, fontWeight: '600' },
  checkmark: { color: '#10B981', fontWeight: 'bold', fontSize: 16 },
});
