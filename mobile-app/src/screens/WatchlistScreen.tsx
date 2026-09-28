import React, { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image,
  StatusBar, ScrollView, ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useWatchlist, WatchlistItem } from '../context/WatchlistContext';

interface Props { navigation: NavigationProp<any>; }

const STATUS_TABS = [
  { key: 'all', label: 'All', emoji: '📚' },
  { key: 'watched', label: 'Watched', emoji: '✅' },
  { key: 'watching', label: 'Watching', emoji: '🔥' },
  { key: 'watchlist', label: 'Bucket List', emoji: '📌' },
] as const;

export default function WatchlistScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { items, isLoading, remove } = useWatchlist();
  const [activeStatus, setActiveStatus] = useState<'all' | 'watched' | 'watching' | 'watchlist'>('all');
  const [searchQ, setSearchQ] = useState('');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.unauthContainer}>
          <Text style={styles.bookmarkIcon}>🔖</Text>
          <Text style={styles.unauthTitle}>My Library</Text>
          <Text style={styles.unauthSubtitle}>
            Sign in to save movies, track TV shows, and build your personal collections.
          </Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.browseBtnText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = items.filter((i) => {
    const matchesStatus = activeStatus === 'all' || i.status === activeStatus;
    const matchesSearch = !searchQ.trim() || i.title.toLowerCase().includes(searchQ.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (item: WatchlistItem) => {
    Alert.alert('Remove from Library', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(item.mediaId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.navBar}>
        <View>
          <Text style={styles.pageTitle}>MY LIBRARY</Text>
          <Text style={styles.pageSubtitle}>{items.length} titles</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user.email?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <View>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userStats}>
            {items.filter((i) => i.status === 'watched').length} watched ·{' '}
            {items.filter((i) => i.status === 'watching').length} watching ·{' '}
            {items.filter((i) => i.status === 'watchlist').length} in bucket list
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQ}
          onChangeText={setSearchQ}
          placeholder="Search your library..."
          placeholderTextColor="#52525B"
        />
        {searchQ.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQ('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {STATUS_TABS.map((t) => {
          const count = t.key === 'all' ? items.length : items.filter((i) => i.status === t.key).length;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeStatus === t.key && styles.tabActive]}
              onPress={() => setActiveStatus(t.key)}
            >
              <Text style={[styles.tabText, activeStatus === t.key && styles.tabTextActive]}>
                {t.emoji} {t.label}
              </Text>
              <View style={[styles.tabCount, activeStatus === t.key && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, activeStatus === t.key && styles.tabCountTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>{items.length === 0 ? '🎬' : '🔍'}</Text>
          <Text style={styles.emptyTitle}>
            {items.length === 0 ? 'Your library is empty' : 'No titles match your filter'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {items.length === 0
              ? 'Browse movies and add them to your watchlist.'
              : 'Try a different status tab or clear the search.'}
          </Text>
          {items.length === 0 && (
            <TouchableOpacity style={styles.discoverBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.discoverBtnText}>Discover Movies</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <WatchlistCard item={item} navigation={navigation} onDelete={() => handleDelete(item)} />}
        />
      )}
    </SafeAreaView>
  );
}

function WatchlistCard({ item, navigation, onDelete }: { item: WatchlistItem; navigation: NavigationProp<any>; onDelete: () => void }) {
  const STATUS_COLOR: Record<string, string> = {
    watched: '#10B981',
    watching: '#F59E0B',
    watchlist: '#3B82F6',
    paused: '#6B7280',
    dropped: '#EF4444',
  };
  const STATUS_LABEL: Record<string, string> = {
    watched: '✅ Watched',
    watching: '🔥 Watching',
    watchlist: '📌 Bucket List',
    paused: '⏸ Paused',
    dropped: '❌ Dropped',
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Details', {
        movie: {
          id: item.mediaId,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath ?? item.posterPath,
          releaseYear: item.releaseYear ?? 0,
          voteAverage: item.voteAverage ?? 0,
          genres: item.genres ?? [],
          overview: '',
          qualityBadge: 'HD',
          mediaKind: item.mediaKind,
        }
      })}
    >
      <Image source={{ uri: item.posterPath }} style={styles.cardPoster} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardMeta}>
          {item.releaseYear ? <Text style={styles.cardYear}>{item.releaseYear}</Text> : null}
          {item.voteAverage ? <Text style={styles.cardRating}>★ {item.voteAverage}</Text> : null}
        </View>
        {item.genres && item.genres.length > 0 && (
          <View style={styles.genreRow}>
            {item.genres.slice(0, 2).map((g) => (
              <View key={g} style={styles.genreChip}><Text style={styles.genreChipText}>{g}</Text></View>
            ))}
          </View>
        )}
        <View style={[styles.statusPill, { borderColor: STATUS_COLOR[item.status] ?? '#52525B' }]}>
          <Text style={[styles.statusPillText, { color: STATUS_COLOR[item.status] ?? '#A1A1AA' }]}>
            {STATUS_LABEL[item.status] ?? item.status}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.deleteBtnText}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  pageSubtitle: { fontSize: 11, color: '#52525B', marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EF4444' },
  addBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  signOutBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' },
  signOutText: { color: '#EF4444', fontSize: 11, fontWeight: '600' },
  unauthContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bookmarkIcon: { fontSize: 48, marginBottom: 16 },
  unauthTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  unauthSubtitle: { fontSize: 13, color: '#71717A', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  signInBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 10, width: '100%', alignItems: 'center' },
  signInBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  browseBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B', width: '100%', alignItems: 'center' },
  browseBtnText: { color: '#A1A1AA', fontWeight: '600', fontSize: 14 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  userEmail: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  userStats: { color: '#71717A', fontSize: 11, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', marginHorizontal: 16, marginVertical: 10, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#27272A' },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 10 },
  clearBtn: { color: '#71717A', fontSize: 14 },
  tabsRow: { marginBottom: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B', gap: 6 },
  tabActive: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)' },
  tabText: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  tabCount: { backgroundColor: '#27272A', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  tabCountActive: { backgroundColor: 'rgba(239,68,68,0.25)' },
  tabCountText: { color: '#A1A1AA', fontSize: 11, fontWeight: '700' },
  tabCountTextActive: { color: '#EF4444' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { color: '#71717A', textAlign: 'center', fontSize: 13, marginBottom: 24 },
  discoverBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  discoverBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  card: { flexDirection: 'row', backgroundColor: '#18181B', borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  cardPoster: { width: 80, height: 115, resizeMode: 'cover' },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  cardYear: { color: '#71717A', fontSize: 12 },
  cardRating: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  genreChip: { backgroundColor: '#27272A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  genreChipText: { color: '#A1A1AA', fontSize: 10 },
  statusPill: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { width: 40, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#27272A' },
  deleteBtnText: { fontSize: 18 },
});
