import React, { useMemo, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useWatchlist, WatchlistItem } from '../context/WatchlistContext';

interface Props { navigation: NavigationProp<any>; }

function StatCard({ emoji, label, value, accent = '#EF4444' }: { emoji: string; label: string; value: string | number; accent?: string }) {
  return (
    <View style={[styles.statCard, { borderColor: `${accent}25` }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GenreBar({ genre, count, total }: { genre: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={styles.genreBarRow}>
      <View style={styles.genreBarMeta}>
        <Text style={styles.genreBarName}>{genre}</Text>
        <Text style={styles.genreBarCount}>{count} titles ({pct}%)</Text>
      </View>
      <View style={styles.genreBarBg}>
        <View style={[styles.genreBarFill, { width: `${pct}%` as any }]} />
      </View>
    </View>
  );
}

export default function StatsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items, isLoading } = useWatchlist();
  const [yearFilter, setYearFilter] = useState<'all' | number>('all');

  const availableYears = useMemo(() => {
    const yrs = new Set<number>();
    items.forEach((i) => { if (i.createdAt) yrs.add(new Date(i.createdAt).getFullYear()); });
    return Array.from(yrs).sort((a, b) => b - a);
  }, [items]);

  const activeItems = useMemo(() => {
    if (yearFilter === 'all') return items;
    return items.filter((i) => i.createdAt && new Date(i.createdAt).getFullYear() === yearFilter);
  }, [items, yearFilter]);

  const stats = useMemo(() => {
    const movies = activeItems.filter((i) => i.mediaKind !== 'tv' && !i.genres?.includes('Animation'));
    const tv = activeItems.filter((i) => i.mediaKind === 'tv' && !i.genres?.includes('Animation'));
    const anime = activeItems.filter((i) => i.genres?.includes('Animation'));
    const watched = activeItems.filter((i) => i.status === 'watched');
    const watching = activeItems.filter((i) => i.status === 'watching');
    const watchlist = activeItems.filter((i) => i.status === 'watchlist');

    const rated = activeItems.filter((i) => i.userRating != null);
    const avgRating = rated.length > 0
      ? (rated.reduce((s, i) => s + (i.userRating ?? 0), 0) / rated.length).toFixed(1)
      : 'N/A';

    const genreCounts: Record<string, number> = {};
    activeItems.forEach((i) => {
      (i.genres ?? []).forEach((g) => { genreCounts[g] = (genreCounts[g] ?? 0) + 1; });
    });
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return { movies, tv, anime, watched, watching, watchlist, avgRating, topGenres, total: activeItems.length };
  }, [activeItems]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.unauthContainer}>
          <Text style={styles.unauthEmoji}>📊</Text>
          <Text style={styles.unauthTitle}>Your Stats</Text>
          <Text style={styles.unauthSubtitle}>Sign in to see your personal movie & TV stats and insights.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.signInBtnText}>Sign In to View Stats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.pageTitle}>MY STATS</Text></View>
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}><Text style={styles.pageTitle}>MY STATS</Text></View>
        <View style={styles.unauthContainer}>
          <Text style={styles.unauthEmoji}>🎬</Text>
          <Text style={styles.unauthTitle}>No data yet</Text>
          <Text style={styles.unauthSubtitle}>Add movies and TV shows to your library to start tracking stats.</Text>
          <TouchableOpacity style={styles.discoverBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.discoverBtnText}>Discover & Add Movies</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.pageTitle}>MY STATS</Text>
        {availableYears.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 4 }}>
            <TouchableOpacity style={[styles.yearBtn, yearFilter === 'all' && styles.yearBtnActive]} onPress={() => setYearFilter('all')}>
              <Text style={[styles.yearBtnText, yearFilter === 'all' && styles.yearBtnTextActive]}>All</Text>
            </TouchableOpacity>
            {availableYears.map((y) => (
              <TouchableOpacity key={y} style={[styles.yearBtn, yearFilter === y && styles.yearBtnActive]} onPress={() => setYearFilter(y)}>
                <Text style={[styles.yearBtnText, yearFilter === y && styles.yearBtnTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Stats Grid */}
        <Text style={styles.sectionHeading}>OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <StatCard emoji="📚" label="Total Titles" value={stats.total} accent="#EF4444" />
          <StatCard emoji="🎬" label="Movies" value={stats.movies.length} accent="#8B5CF6" />
          <StatCard emoji="📺" label="TV Shows" value={stats.tv.length} accent="#3B82F6" />
          <StatCard emoji="✨" label="Anime" value={stats.anime.length} accent="#EC4899" />
          <StatCard emoji="⭐" label="Avg Rating" value={stats.avgRating} accent="#FBBF24" />
          <StatCard emoji="📖" label="Rated" value={activeItems.filter((i) => i.userRating != null).length} accent="#10B981" />
        </View>

        {/* Status Breakdown */}
        <Text style={styles.sectionHeading}>STATUS BREAKDOWN</Text>
        <View style={styles.statusSection}>
          {[
            { label: 'Watched', count: stats.watched.length, color: '#10B981', emoji: '✅' },
            { label: 'Currently Watching', count: stats.watching.length, color: '#F59E0B', emoji: '🔥' },
            { label: 'Bucket List', count: stats.watchlist.length, color: '#3B82F6', emoji: '📌' },
          ].map(({ label, count, color, emoji }) => (
            <View key={label} style={styles.statusRow}>
              <Text style={styles.statusEmoji}>{emoji}</Text>
              <Text style={styles.statusLabel}>{label}</Text>
              <View style={styles.statusCountWrap}>
                <Text style={[styles.statusCount, { color }]}>{count}</Text>
              </View>
              <View style={styles.statusBarBg}>
                <View style={[styles.statusBarFill, { backgroundColor: color, width: `${stats.total > 0 ? Math.round(count / stats.total * 100) : 0}%` as any }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Top Genres */}
        {stats.topGenres.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>TOP GENRES</Text>
            <View style={styles.genresSection}>
              {stats.topGenres.map(([genre, count]) => (
                <GenreBar key={genre} genre={genre} count={count} total={stats.total} />
              ))}
            </View>
          </>
        )}

        {/* Recent Additions */}
        <Text style={styles.sectionHeading}>RECENTLY ADDED</Text>
        <View style={styles.recentSection}>
          {items.slice(0, 8).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => navigation.navigate('Details', {
                movie: { id: item.mediaId, title: item.title, posterPath: item.posterPath, backdropPath: item.backdropPath ?? item.posterPath, releaseYear: item.releaseYear ?? 0, voteAverage: item.voteAverage ?? 0, genres: item.genres ?? [], overview: '', qualityBadge: 'HD', mediaKind: item.mediaKind }
              })}
            >
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recentMeta}>
                  {item.releaseYear ?? '—'} · {item.mediaKind === 'tv' ? 'TV Show' : 'Movie'} ·{' '}
                  <Text style={{ textTransform: 'capitalize', color: item.status === 'watched' ? '#10B981' : item.status === 'watching' ? '#F59E0B' : '#3B82F6' }}>
                    {item.status}
                  </Text>
                </Text>
              </View>
              {item.userRating != null && (
                <Text style={styles.recentRating}>⭐ {item.userRating}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1, marginBottom: 10 },
  yearBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B' },
  yearBtnActive: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)' },
  yearBtnText: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  yearBtnTextActive: { color: '#EF4444' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  sectionHeading: { fontSize: 11, fontWeight: '700', color: '#52525B', letterSpacing: 1.2, marginTop: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#18181B', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1 },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#71717A', marginTop: 2, fontWeight: '600' },
  statusSection: { backgroundColor: '#18181B', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  statusRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#27272A', gap: 8 },
  statusEmoji: { fontSize: 16 },
  statusLabel: { flex: 1, color: '#D4D4D8', fontSize: 13, fontWeight: '600' },
  statusCountWrap: { marginRight: 8 },
  statusCount: { fontSize: 18, fontWeight: '900' },
  statusBarBg: { width: 60, height: 5, backgroundColor: '#27272A', borderRadius: 3, overflow: 'hidden' },
  statusBarFill: { height: 5, borderRadius: 3 },
  genresSection: { backgroundColor: '#18181B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#27272A', gap: 10 },
  genreBarRow: {},
  genreBarMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  genreBarName: { color: '#D4D4D8', fontSize: 13, fontWeight: '600' },
  genreBarCount: { color: '#71717A', fontSize: 12 },
  genreBarBg: { height: 5, backgroundColor: '#27272A', borderRadius: 3, overflow: 'hidden' },
  genreBarFill: { height: 5, backgroundColor: '#EF4444', borderRadius: 3 },
  recentSection: { backgroundColor: '#18181B', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  recentItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  recentItemLeft: { flex: 1 },
  recentTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  recentMeta: { color: '#71717A', fontSize: 12, marginTop: 2 },
  recentRating: { color: '#FBBF24', fontWeight: 'bold', fontSize: 14 },
  unauthContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  unauthEmoji: { fontSize: 48, marginBottom: 16 },
  unauthTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  unauthSubtitle: { color: '#71717A', textAlign: 'center', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  signInBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  signInBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  discoverBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  discoverBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
