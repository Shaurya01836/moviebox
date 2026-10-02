import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
  StatusBar, ScrollView, TextInput, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useWatchlist, WatchlistItem } from '../context/WatchlistContext';
import { Feather } from '@expo/vector-icons';

interface Props { navigation: NavigationProp<any>; }

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SectionType = 'watched' | 'watching' | 'watchlist';

const getPaginationRange = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

export default function WatchlistScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { items } = useWatchlist();
  
  const scrollRef = useRef<ScrollView>(null);
  
  const [expandedSection, setExpandedSection] = useState<SectionType | null>('watched');
  const [activeTab, setActiveTab] = useState<'All' | 'Movies' | 'TV Shows' | 'Anime'>('All');
  const [searchQ, setSearchQ] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.unauthContainer}>
          <Feather name="bookmark" size={48} color="#52525B" style={{ marginBottom: 16 }} />
          <Text style={styles.unauthTitle}>MY LIBRARY</Text>
          <Text style={styles.unauthSubtitle}>
            Sign in to save movies, track TV shows, and build your personal cinematic archive.
          </Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getFilteredItems = (sectionItems: WatchlistItem[]) => {
    return sectionItems.filter((i) => {
      const matchesTab = 
        activeTab === 'All' || 
        (activeTab === 'Movies' && i.mediaKind === 'movie') || 
        (activeTab === 'TV Shows' && i.mediaKind === 'tv') ||
        (activeTab === 'Anime' && i.genres?.includes('Animation'));
      
      const matchesSearch = !searchQ.trim() || i.title.toLowerCase().includes(searchQ.toLowerCase());
      return matchesTab && matchesSearch;
    });
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollRef.current?.scrollTo({ y: 200, animated: true }); // scroll to grid area approx
  };

  const renderSection = (
    type: SectionType,
    title: string,
    sectionItems: WatchlistItem[]
  ) => {
    const isExpanded = expandedSection === type;
    const moviesCount = sectionItems.filter(i => i.mediaKind === 'movie').length;
    const seriesCount = sectionItems.filter(i => i.mediaKind === 'tv').length;
    const totalCount = sectionItems.length;

    const filtered = getFilteredItems(sectionItems);

    if (!isExpanded) {
      return (
        <TouchableOpacity
          key={type}
          style={styles.collapsedCard}
          activeOpacity={0.8}
          onPress={() => { 
            setExpandedSection(type); 
            setSearchQ(''); 
            setActiveTab('All');
            setCurrentPage(1);
          }}
        >
          <Text style={styles.collapsedTitle}>{title}</Text>
          <Text style={styles.collapsedSubtitle}>
            {totalCount} titles • {moviesCount} Movies • {seriesCount} Series
          </Text>
        </TouchableOpacity>
      );
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentEnd = Math.min(startIndex + itemsPerPage, filtered.length);
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    const pageRange = getPaginationRange(currentPage, totalPages);

    return (
      <View key={type} style={styles.expandedCard}>
        {/* Banner */}
        <TouchableOpacity 
          style={styles.expandedBanner}
          activeOpacity={0.9}
          onPress={() => setExpandedSection(null)}
        >
          <View style={styles.bannerPosters}>
            {sectionItems.slice(0, 5).map((item, idx) => (
              <Image key={item.mediaId + idx} source={{ uri: item.posterPath }} style={styles.bannerPosterImg} />
            ))}
          </View>
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.expandedTitle}>{title}</Text>
            <Text style={styles.expandedSubtitle}>
              {totalCount} titles • {moviesCount} Movies • {seriesCount} Series
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.expandedBody}>
          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {['All', 'Movies', 'TV Shows', 'Anime'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => { setActiveTab(tab as any); setCurrentPage(1); }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search */}
          <View style={styles.searchRow}>
            <Feather name="search" size={16} color="#71717A" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQ}
              onChangeText={(t: string) => { setSearchQ(t); setCurrentPage(1); }}
              placeholder={`Filter ${title}...`}
              placeholderTextColor="#52525B"
            />
          </View>

          {/* Sort Dropdown mock */}
          <View style={styles.sortDropdown}>
            <Text style={styles.sortDropdownText}>Recently Added</Text>
            <Feather name="chevron-down" size={16} color="#A1A1AA" />
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {paginatedItems.map((item) => (
              <TouchableOpacity 
                key={item.mediaId} 
                style={styles.gridItem}
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
                    mediaKind: item.mediaKind,
                  }
                })}
              >
                <Image source={{ uri: item.posterPath }} style={styles.gridPoster} />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridRating}>★ {item.voteAverage}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {filtered.length > 0 && (
            <View style={styles.paginationRow}>
              <Text style={styles.paginationText}>Showing {startIndex + 1} to {currentEnd} of {filtered.length} titles</Text>
              <View style={styles.paginationControls}>
                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage === 1 && { opacity: 0.3 }]}
                  disabled={currentPage === 1}
                  onPress={() => handlePageChange(currentPage - 1)}
                >
                  <Feather name="chevron-left" size={16} color="#71717A" />
                </TouchableOpacity>

                {pageRange.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <View key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
                        <Text style={styles.pageEllipsisText}>...</Text>
                      </View>
                    );
                  }
                  const pageNum = page as number;
                  return (
                    <TouchableOpacity 
                      key={pageNum}
                      style={[styles.pageBtn, currentPage === pageNum && styles.pageBtnActive]}
                      onPress={() => handlePageChange(pageNum)}
                    >
                      <Text style={currentPage === pageNum ? styles.pageBtnTextActive : styles.pageBtnText}>
                        {pageNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity 
                  style={[styles.pageBtn, currentPage === totalPages && { opacity: 0.3 }]}
                  disabled={currentPage === totalPages}
                  onPress={() => handlePageChange(currentPage + 1)}
                >
                  <Feather name="chevron-right" size={16} color="#71717A" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No titles found.</Text>
          )}

        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />
      
      {/* Header Top */}
      <View style={styles.headerTop}>
        <View />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <Feather name="search" size={18} color="#A1A1AA" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
            <Feather name="log-out" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        {/* Main Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.pageTitle}>MY LIBRARY</Text>
          <Text style={styles.pageSubtitle}>Everything you've watched and your personal cinematic archive.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Search')}>
            <Feather name="plus" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add New Title</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Sections */}
        {renderSection('watched', 'My Entertainment', items.filter(i => i.status === 'watched'))}
        {renderSection('watching', 'Currently Watching', items.filter(i => i.status === 'watching'))}
        {renderSection('watchlist', 'Bucket List', items.filter(i => i.status === 'watchlist'))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  unauthContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  unauthTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: 1 },
  unauthSubtitle: { fontSize: 13, color: '#71717A', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  signInBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  signInBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', alignItems: 'center', justifyContent: 'center' },
  
  scrollContent: { paddingHorizontal: 16, paddingBottom: 60, paddingTop: 16 },
  mainHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: '#A1A1AA', lineHeight: 20, marginBottom: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#DC2626', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#18181B', marginBottom: 24 },

  collapsedCard: { backgroundColor: '#18181B', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  collapsedTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  collapsedSubtitle: { color: '#A1A1AA', fontSize: 13 },

  expandedCard: { backgroundColor: '#0F0F13', borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#27272A', overflow: 'hidden' },
  expandedBanner: { height: 140, position: 'relative', justifyContent: 'flex-end', padding: 20 },
  bannerPosters: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  bannerPosterImg: { flex: 1, height: '100%', resizeMode: 'cover', opacity: 0.6 },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,15,19,0.7)' },
  bannerTextContainer: { position: 'relative', zIndex: 10 },
  expandedTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 2 },
  expandedSubtitle: { color: '#A1A1AA', fontSize: 13, fontWeight: '500' },
  
  expandedBody: { padding: 16, backgroundColor: '#0F0F13' },
  tabsRow: { gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' },
  tabActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  tabText: { color: '#A1A1AA', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#09090B', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  
  sortDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#09090B', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  sortDropdownText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { width: '48%', aspectRatio: 2/3, borderRadius: 12, overflow: 'hidden', marginBottom: 16, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A' },
  gridPoster: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  gridRating: { color: '#FBBF24', fontSize: 11, fontWeight: 'bold' },
  
  paginationRow: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  paginationText: { color: '#71717A', fontSize: 12, marginBottom: 16 },
  paginationControls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#09090B', borderWidth: 1, borderColor: '#27272A', alignItems: 'center', justifyContent: 'center' },
  pageBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  pageBtnText: { color: '#A1A1AA', fontSize: 14, fontWeight: '600' },
  pageBtnTextActive: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  pageEllipsis: { width: 30, alignItems: 'center', justifyContent: 'center' },
  pageEllipsisText: { color: '#71717A', fontSize: 14, fontWeight: 'bold' },
  
  emptyText: { color: '#71717A', textAlign: 'center', marginTop: 16, marginBottom: 32 },
});
