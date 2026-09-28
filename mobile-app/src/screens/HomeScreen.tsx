import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Image, TouchableOpacity,
  StatusBar, Dimensions, ActivityIndicator, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';
import { Movie, fetchTrendingMovies, fetchPopularMovies, fetchMoviesByGenre } from '../lib/tmdb';
import { MovieCard } from '../components/MovieCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GENRES = [
  { id: 'all', name: 'All' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasy' },
  { id: '27', name: 'Horror' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' },
];

interface Props {
  navigation: NavigationProp<any>;
}

export default function HomeScreen({ navigation }: Props) {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedGenreId, setSelectedGenreId] = useState('all');
  const [loading, setLoading] = useState(true);
  const heroScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGenreId !== 'all') {
      fetchMoviesByGenre(selectedGenreId).then(setGenreMovies);
    }
  }, [selectedGenreId]);

  useEffect(() => {
    if (trendingMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => {
        const next = (prev + 1) % Math.min(trendingMovies.length, 5);
        heroScrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingMovies]);

  const loadData = async () => {
    try {
      const [trending, popular] = await Promise.all([fetchTrendingMovies(), fetchPopularMovies()]);
      setTrendingMovies(trending);
      setPopularMovies(popular);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const heroMovies = trendingMovies.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      {/* Nav Bar */}
      <View style={styles.navBar}>
        <Text style={styles.logo}>MOVIE<Text style={styles.logoRed}>BOX</Text></Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Carousel */}
        {heroMovies.length > 0 && (
          <View style={styles.heroSection}>
            <ScrollView
              ref={heroScrollRef}
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setActiveHeroIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
              }}
            >
              {heroMovies.map((movie) => (
                <View key={movie.id} style={styles.heroSlide}>
                  <Image source={{ uri: movie.backdropPath }} style={styles.heroImage} />
                  <View style={styles.vignetteOverlay} />
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle} numberOfLines={2}>{movie.title}</Text>
                    <View style={styles.heroMetaRow}>
                      <View style={styles.starBadge}>
                        <Text style={styles.starText}>★ {movie.voteAverage}/10</Text>
                      </View>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{movie.releaseYear}</Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>{movie.genres[0] || 'Movie'}</Text>
                    </View>
                    <Text style={styles.heroOverview} numberOfLines={3}>{movie.overview}</Text>
                    <View style={styles.heroActions}>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => navigation.navigate('Player', { movie })}
                      >
                        <Text style={styles.playIcon}>▶</Text>
                        <Text style={styles.playText}>Play</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => navigation.navigate('Details', { movie })}
                      >
                        <Text style={styles.circleBtnText}>ℹ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            {/* Pagination dots */}
            <View style={styles.pageDots}>
              {heroMovies.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeHeroIndex ? styles.dotActive : styles.dotInactive]} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.body}>
          {/* Genre Bar */}
          <Text style={styles.genreHeading}>EXPLORE GENRES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {GENRES.map((genre) => {
              const active = selectedGenreId === genre.id;
              return (
                <TouchableOpacity
                  key={genre.id}
                  style={[styles.genreBadge, active && styles.genreBadgeActive]}
                  onPress={() => setSelectedGenreId(genre.id)}
                >
                  <Text style={[styles.genreBadgeText, active && styles.genreBadgeTextActive]}>
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="large" color="#EF4444" style={{ marginVertical: 40 }} />
          ) : selectedGenreId !== 'all' ? (
            <>
              <Text style={styles.sectionTitle}>
                {GENRES.find((g) => g.id === selectedGenreId)?.name} Movies
              </Text>
              <FlatList
                horizontal scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                data={genreMovies}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => (
                  <MovieCard movie={item} onPress={(m) => navigation.navigate('Details', { movie: m })} />
                )}
              />
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Trending Right Now</Text>
                  <Text style={styles.sectionSubtitle}>Most watched this week</Text>
                </View>
              </View>
              <FlatList
                horizontal showsHorizontalScrollIndicator={false}
                data={trendingMovies}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => (
                  <MovieCard movie={item} onPress={(m) => navigation.navigate('Details', { movie: m })} />
                )}
                style={{ marginBottom: 24 }}
              />

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Popular Movies</Text>
                  <Text style={styles.sectionSubtitle}>Top community-rated films</Text>
                </View>
              </View>
              <FlatList
                horizontal showsHorizontalScrollIndicator={false}
                data={popularMovies}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => (
                  <MovieCard movie={item} onPress={(m) => navigation.navigate('Details', { movie: m })} />
                )}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#18181B',
  },
  logo: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1.5 },
  logoRed: { color: '#EF4444' },
  navIcon: { fontSize: 20 },
  heroSection: { height: 480, width: SCREEN_WIDTH, position: 'relative' },
  heroSlide: { width: SCREEN_WIDTH, height: 480, justifyContent: 'flex-end' },
  heroImage: { ...StyleSheet.absoluteFill, resizeMode: 'cover' },
  vignetteOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(9, 9, 11, 0.72)' },
  heroContent: { padding: 20, paddingBottom: 36 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 8, letterSpacing: -0.5 },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  starBadge: { backgroundColor: 'rgba(251, 191, 36, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  starText: { color: '#FBBF24', fontWeight: 'bold', fontSize: 12 },
  metaDot: { color: '#71717A', marginHorizontal: 8 },
  metaText: { color: '#D4D4D8', fontSize: 13, fontWeight: '500' },
  heroOverview: { color: '#A1A1AA', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  heroActions: { flexDirection: 'row', alignItems: 'center' },
  playButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, marginRight: 12,
  },
  playIcon: { color: '#09090B', fontSize: 12, marginRight: 6 },
  playText: { color: '#09090B', fontWeight: 'bold', fontSize: 14 },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  circleBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  pageDots: { position: 'absolute', bottom: 12, right: 20, flexDirection: 'row', alignItems: 'center' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  dotActive: { width: 24, backgroundColor: '#FFF' },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  genreHeading: { fontSize: 11, fontWeight: '700', color: '#A1A1AA', letterSpacing: 1, marginBottom: 10 },
  genreBadge: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: '#27272A', backgroundColor: 'rgba(24,24,27,0.6)', marginRight: 8,
  },
  genreBadgeActive: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  genreBadgeText: { color: '#D4D4D8', fontSize: 12, fontWeight: '500' },
  genreBadgeTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  sectionHeader: { marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  sectionSubtitle: { fontSize: 12, color: '#71717A', marginTop: 2 },
});
