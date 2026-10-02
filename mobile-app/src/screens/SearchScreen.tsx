import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Movie, searchMovies } from '../lib/tmdb';
import { MovieCard } from '../components/MovieCard';
import { SearchHistoryService } from '../services/SearchHistoryService';
import { useAuth } from '../context/AuthContext';

const QUICK_SUGGESTIONS = ['Inception', 'Interstellar', 'Spider-Man', 'Naruto', 'Breaking Bad', 'Stranger Things', 'Avatar'];

interface Props { navigation: NavigationProp<any>; }

export default function SearchScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await searchMovies(q);
      setResults(data);
      // Save to Supabase search_history if logged in
      if (data.length > 0) {
        SearchHistoryService.addQuery(q.trim(), user?.id).catch(() => {});
      }
    } catch (e) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleChange = (text: string) => {
    setQuery(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(text), 350);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    doSearch(s);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search movies, TV shows, anime..."
          placeholderTextColor="#52525B"
          value={query}
          onChangeText={handleChange}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Suggestions */}
      {!query.trim() && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>TRENDING SEARCHES</Text>
          <View style={styles.chips}>
            {QUICK_SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.chip} onPress={() => handleSuggestion(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#EF4444" style={{ marginVertical: 40 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Results count */}
      {results.length > 0 && (
        <Text style={styles.resultsCount}>
          Found <Text style={styles.resultsCountBold}>{results.length}</Text> results for "{query}"
        </Text>
      )}

      {/* Empty state */}
      {query.trim() && !loading && results.length === 0 && !error && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>Try checking your spelling or search for something else.</Text>
        </View>
      )}

      {/* Results Grid (2 columns) */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(m: Movie) => `${m.mediaKind}-${m.id}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }: { item: Movie }) => (
            <MovieCard
              movie={item}
              onPress={(m) => navigation.navigate('Details', { movie: m })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#18181B', marginHorizontal: 16, marginVertical: 12,
    borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#27272A',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 12 },
  clearBtn: { color: '#71717A', fontSize: 16, paddingLeft: 8 },
  suggestionsSection: { paddingHorizontal: 16, paddingTop: 8 },
  suggestionsTitle: { fontSize: 11, fontWeight: '700', color: '#A1A1AA', letterSpacing: 1, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#27272A', backgroundColor: '#18181B',
  },
  chipText: { color: '#D4D4D8', fontSize: 12 },
  errorText: { color: '#EF4444', textAlign: 'center', padding: 20 },
  resultsCount: { color: '#71717A', fontSize: 12, paddingHorizontal: 16, marginBottom: 8 },
  resultsCountBold: { color: '#FFF', fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#71717A', textAlign: 'center' },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
});
