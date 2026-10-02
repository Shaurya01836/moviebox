import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert, FlatList, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { Movie, fetchMovieDetails, fetchTvSeason, TvEpisode } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';

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
  const [movie, setMovie] = useState<Movie & { runtime?: number; tagline?: string; cast?: any[]; seasons?: any[] }>(passedMovie);
  const [loading, setLoading] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  // TV Episodes State
  const [episodes, setEpisodes] = useState<TvEpisode[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);

  const { user } = useAuth();
  const { getByMediaId, upsert, remove } = useWatchlist();
  const watchlistItem = getByMediaId(movie.id);
  const inWatchlist = !!watchlistItem;

  const validSeasons = movie.seasons?.filter(s => s.seasonNumber > 0 && s.episodeCount > 0) || [];

  useEffect(() => {
    const type = (passedMovie as any).mediaKind === 'tv' ? 'tv' : 'movie';
    fetchMovieDetails(passedMovie.id, type)
      .then((data) => {
        setMovie(data);
        if (type === 'tv' && data.seasons) {
          const firstValidSeason = data.seasons.find(s => s.seasonNumber > 0 && s.episodeCount > 0);
          if (firstValidSeason) {
            setActiveSeason(firstValidSeason.seasonNumber);
            fetchTvSeason(data.id, firstValidSeason.seasonNumber).then(setEpisodes);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [passedMovie.id, (passedMovie as any).mediaKind]);

  const loadSeason = async (seasonNum: number) => {
    setActiveSeason(seasonNum);
    setSeasonMenuOpen(false);
    const eps = await fetchTvSeason(movie.id, seasonNum);
    setEpisodes(eps);
  };

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
      { text: 'Remove', style: 'destructive', onPress: async () => await remove(movie.id) },
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
          <Feather name="arrow-left" size={20} color="#FFF" />
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
          <Feather name="play" size={16} color="#FFF" style={{ marginRight: 8 }} />
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
              <Feather name="trash-2" size={18} color="#EF4444" />
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
                {watchlistItem?.status === s.key && <Feather name="check" size={16} color="#10B981" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <View style={styles.castSection}>
            <Text style={styles.sectionLabel}>Top Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
              {movie.cast.map(c => (
                <View key={c.id} style={styles.castItem}>
                  <View style={styles.castImgContainer}>
                    {c.profilePath ? (
                      <Image source={{ uri: c.profilePath }} style={styles.castImg} />
                    ) : (
                      <Feather name="user" size={24} color="#52525B" />
                    )}
                  </View>
                  <Text style={styles.castName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.castRole} numberOfLines={1}>{c.character}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Episodes Section (TV Only) */}
        {movie.mediaKind === 'tv' && validSeasons.length > 0 && (
          <View style={styles.episodesSection}>
            <View style={styles.episodesHeader}>
              <Text style={styles.sectionLabel}>Episodes</Text>
              
              {/* Season Selector */}
              <TouchableOpacity style={styles.seasonSelector} onPress={() => setSeasonMenuOpen(true)}>
                <Text style={styles.seasonSelectorText}>Season {activeSeason}</Text>
                <Feather name="chevron-down" size={14} color="#A1A1AA" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodesScroll}>
              {episodes.map((ep) => (
                <TouchableOpacity 
                  key={ep.id} 
                  style={styles.episodeCard}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Player', { movie, season: activeSeason, episode: ep.episodeNumber })}
                >
                  <View style={styles.episodeImgContainer}>
                    {ep.stillPath ? (
                      <Image source={{ uri: ep.stillPath }} style={styles.episodeImg} />
                    ) : (
                      <View style={styles.episodeNoImg}><Text style={styles.episodeNoImgText}>No Image</Text></View>
                    )}
                    <View style={styles.episodeBadge}>
                      <Text style={styles.episodeBadgeText}>E{ep.episodeNumber}</Text>
                    </View>
                    <View style={styles.episodePlayOverlay}>
                      <View style={styles.episodePlayBtn}>
                        <Feather name="play" size={16} color="#FFF" />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.episodeTitle} numberOfLines={1}>{ep.name}</Text>
                  <Text style={styles.episodeOverview} numberOfLines={2}>{ep.overview}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* Season Modal */}
      <Modal visible={seasonMenuOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSeasonMenuOpen(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Season</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {validSeasons.map((s) => (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.modalItem, activeSeason === s.seasonNumber && styles.modalItemActive]}
                  onPress={() => loadSeason(s.seasonNumber)}
                >
                  <Text style={[styles.modalItemText, activeSeason === s.seasonNumber && styles.modalItemTextActive]}>
                    Season {s.seasonNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  backdropContainer: { height: 230, position: 'relative' },
  backdrop: { width: '100%', height: '100%', resizeMode: 'cover' },
  backdropOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 9, 11, 0.55)' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(9,9,11,0.7)', width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
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
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 10, letterSpacing: 0.5 },
  overview: { color: '#D4D4D8', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  playBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, marginBottom: 10 },
  playBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  statusActions: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  watchlistBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B', paddingVertical: 12, borderRadius: 12, marginBottom: 24 },
  watchlistBtnActive: { borderColor: 'rgba(16,185,129,0.5)', backgroundColor: 'rgba(16,185,129,0.08)', marginBottom: 0 },
  watchlistBtnText: { color: '#D4D4D8', fontWeight: '600', fontSize: 14 },
  removeBtn: { width: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12 },
  statusMenu: { marginTop: 8, backgroundColor: '#18181B', borderRadius: 12, borderWidth: 1, borderColor: '#27272A', overflow: 'hidden', marginBottom: 24 },
  statusMenuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  statusMenuItemText: { fontSize: 14, fontWeight: '600' },
  
  // Cast Section
  castSection: { marginBottom: 24 },
  castScroll: { gap: 12 },
  castItem: { width: 80, alignItems: 'center' },
  castImgContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#18181B', overflow: 'hidden', marginBottom: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#27272A' },
  castImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  castName: { color: '#FFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  castRole: { color: '#A1A1AA', fontSize: 10, textAlign: 'center', marginTop: 2 },

  // Episodes Section
  episodesSection: { marginBottom: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#27272A' },
  episodesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seasonSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#27272A', gap: 6 },
  seasonSelectorText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  episodesScroll: { gap: 12 },
  episodeCard: { width: 220 },
  episodeImgContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#18181B', borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative', borderWidth: 1, borderColor: '#27272A' },
  episodeImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  episodeNoImg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  episodeNoImgText: { color: '#52525B', fontSize: 12 },
  episodeBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  episodeBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  episodePlayOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  episodePlayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239,68,68,0.9)', alignItems: 'center', justifyContent: 'center' },
  episodeTitle: { color: '#FFF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  episodeOverview: { color: '#A1A1AA', fontSize: 11, lineHeight: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#18181B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#27272A' },
  modalTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  modalItemActive: { backgroundColor: 'rgba(239,68,68,0.1)' },
  modalItemText: { color: '#A1A1AA', fontSize: 14, textAlign: 'center' },
  modalItemTextActive: { color: '#EF4444', fontWeight: 'bold' },
});
