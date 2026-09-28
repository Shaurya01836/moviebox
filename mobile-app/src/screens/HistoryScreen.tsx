import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image,
  StatusBar, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { HistoryService, WatchHistoryItem } from '../services/HistoryService';
import { SearchHistoryService, SearchHistoryItem } from '../services/SearchHistoryService';

export { HistoryService, WatchHistoryItem };

interface Props { navigation: NavigationProp<any>; }

export default function HistoryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'watch' | 'search'>('watch');

  // Watch History State
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const [filterKind, setFilterKind] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterQuery, setFilterQuery] = useState('');

  // Search History State
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const loadWatchHistory = useCallback(async () => {
    if (!user?.id) { setWatchHistory([]); return; }
    setLoadingWatch(true);
    try {
      const data = await HistoryService.getRecent(user.id);
      setWatchHistory(data);
    } finally {
      setLoadingWatch(false);
    }
  }, [user?.id]);

  const loadSearchHistory = useCallback(async () => {
    if (!user?.id) { setSearchHistory([]); return; }
    setLoadingSearch(true);
    try {
      const data = await SearchHistoryService.getHistory(user.id);
      setSearchHistory(data);
    } finally {
      setLoadingSearch(false);
    }
  }, [user?.id]);

  useEffect(() => { loadWatchHistory(); loadSearchHistory(); }, [loadWatchHistory, loadSearchHistory]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.unauthContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.unauthTitle}>Watch History</Text>
          <Text style={styles.unauthSubtitle}>Sign in to see your watch history and track what you've been watching.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.signInBtnText}>Sign In to View History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filters for watch history
  const filteredHistory = watchHistory.filter((h) => {
    const matchesQuery = !filterQuery.trim() || h.title.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesKind = filterKind === 'all' || h.mediaKind === filterKind;
    return matchesQuery && matchesKind;
  });

  const handleDeleteWatchItem = (item: WatchHistoryItem) => {
    Alert.alert('Remove from History', `Remove "${item.title}" from your history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await HistoryService.deleteItem(user.id, item.id, item.mediaId);
          loadWatchHistory();
        }
      },
    ]);
  };

  const handleClearWatchHistory = () => {
    Alert.alert('Clear Watch History', 'This will permanently delete all your watch history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive', onPress: async () => {
          await HistoryService.clearAll(user.id);
          setWatchHistory([]);
        }
      },
    ]);
  };

  const handleDeleteSearchItem = async (item: SearchHistoryItem) => {
    await SearchHistoryService.removeQuery(item.id, user.id);
    loadSearchHistory();
  };

  const handleClearSearchHistory = () => {
    Alert.alert('Clear Search History', 'This will permanently delete all your search history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive', onPress: async () => {
          await SearchHistoryService.clearAll(user.id);
          setSearchHistory([]);
        }
      },
    ]);
  };

  const progressPct = (item: WatchHistoryItem) =>
    item.durationSeconds > 0 ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100)) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>HISTORY</Text>
        <TouchableOpacity
          onPress={activeTab === 'watch' ? handleClearWatchHistory : handleClearSearchHistory}
          style={styles.clearBtn}
        >
          <Text style={styles.clearBtnText}>🗑 Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'watch' && styles.activeTab]} onPress={() => setActiveTab('watch')}>
          <Text style={[styles.tabText, activeTab === 'watch' && styles.activeTabText]}>⏱ Watch History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'search' && styles.activeTab]} onPress={() => setActiveTab('search')}>
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>🔍 Search History</Text>
        </TouchableOpacity>
      </View>

      {/* Watch History */}
      {activeTab === 'watch' && (
        <>
          {/* Filter Row */}
          <View style={styles.filterSection}>
            <View style={styles.searchInputRow}>
              <Text>🔍</Text>
              <TextInput
                style={styles.filterInput}
                value={filterQuery}
                onChangeText={setFilterQuery}
                placeholder="Filter titles..."
                placeholderTextColor="#52525B"
              />
              {filterQuery.length > 0 && (
                <TouchableOpacity onPress={() => setFilterQuery('')}><Text style={styles.clearX}>✕</Text></TouchableOpacity>
              )}
            </View>
            <View style={styles.kindRow}>
              {(['all', 'movie', 'tv'] as const).map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.kindBtn, filterKind === k && styles.kindBtnActive]}
                  onPress={() => setFilterKind(k)}
                >
                  <Text style={[styles.kindBtnText, filterKind === k && styles.kindBtnTextActive]}>
                    {k === 'all' ? 'All' : k === 'movie' ? '🎬 Movies' : '📺 TV'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loadingWatch ? (
            <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 40 }} />
          ) : filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📺</Text>
              <Text style={styles.emptyTitle}>No watch history yet</Text>
              <Text style={styles.emptySubtitle}>Start watching movies and they'll appear here.</Text>
              <TouchableOpacity style={styles.discoverBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.discoverBtnText}>Discover Movies</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredHistory}
              keyExtractor={(h) => h.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const pct = progressPct(item);
                return (
                  <TouchableOpacity
                    style={styles.historyCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Player', {
                      movie: { id: item.mediaId, title: item.title, posterPath: item.posterPath ?? '', backdropPath: item.posterPath ?? '', overview: '', releaseYear: 0, voteAverage: 0, genres: [], qualityBadge: 'HD', mediaKind: item.mediaKind }
                    })}
                  >
                    <Image
                      source={{ uri: item.posterPath ?? 'https://via.placeholder.com/80x115?text=?' }}
                      style={styles.historyPoster}
                    />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.historyMeta}>
                        <View style={styles.kindBadge}>
                          <Text style={styles.kindBadgeText}>{item.mediaKind === 'tv' ? '📺 TV Show' : '🎬 Movie'}</Text>
                        </View>
                        {item.isCompleted && (
                          <View style={styles.completedBadge}><Text style={styles.completedBadgeText}>✓ Completed</Text></View>
                        )}
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      {/* Progress bar */}
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={styles.progressText}>{pct}% watched</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteItemBtn} onPress={() => handleDeleteWatchItem(item)}>
                      <Text>🗑</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </>
      )}

      {/* Search History */}
      {activeTab === 'search' && (
        loadingSearch ? (
          <ActivityIndicator size="large" color="#EF4444" style={{ marginTop: 40 }} />
        ) : searchHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No search history</Text>
            <Text style={styles.emptySubtitle}>Your recent search queries will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={searchHistory}
            keyExtractor={(h) => h.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchHistItem}
                onPress={() => { navigation.navigate('Search'); }}
              >
                <Text style={styles.searchHistIcon}>⏱</Text>
                <Text style={styles.searchHistQuery} numberOfLines={1}>{item.query}</Text>
                <Text style={styles.searchHistDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteSearchItem(item)} style={styles.deleteItemBtn}>
                  <Text>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#18181B' },
  pageTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' },
  clearBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#18181B' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#EF4444' },
  tabText: { color: '#71717A', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  filterSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#27272A', marginBottom: 8, gap: 8 },
  filterInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 10 },
  clearX: { color: '#71717A', fontSize: 14 },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B' },
  kindBtnActive: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.12)' },
  kindBtnText: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  kindBtnTextActive: { color: '#EF4444', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  historyPoster: { width: 72, height: 105, resizeMode: 'cover' },
  historyInfo: { flex: 1, padding: 12 },
  historyTitle: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 5 },
  historyMeta: { flexDirection: 'row', gap: 6, marginBottom: 3, flexWrap: 'wrap' },
  kindBadge: { backgroundColor: '#27272A', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  kindBadgeText: { color: '#A1A1AA', fontSize: 10 },
  completedBadge: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  completedBadgeText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
  historyDate: { color: '#52525B', fontSize: 11, marginBottom: 6 },
  progressBg: { height: 3, backgroundColor: '#27272A', borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  progressFill: { height: 3, backgroundColor: '#EF4444', borderRadius: 2 },
  progressText: { color: '#52525B', fontSize: 10 },
  deleteItemBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  searchHistItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 10, marginBottom: 8, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#27272A', gap: 10 },
  searchHistIcon: { fontSize: 14 },
  searchHistQuery: { flex: 1, color: '#D4D4D8', fontSize: 14, fontWeight: '500' },
  searchHistDate: { color: '#52525B', fontSize: 11 },
  unauthContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  unauthTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  unauthSubtitle: { color: '#71717A', textAlign: 'center', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  signInBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  signInBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { color: '#71717A', textAlign: 'center', fontSize: 13, marginBottom: 24 },
  discoverBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  discoverBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
