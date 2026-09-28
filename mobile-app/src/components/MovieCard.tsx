import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import { Movie } from '../lib/tmdb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 135;

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

export function MovieCard({ movie, onPress }: MovieCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(movie)}>
      <View style={styles.posterWrapper}>
        <Image source={{ uri: movie.posterPath }} style={styles.posterImage} />
        {movie.qualityBadge && (
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityBadgeText}>{movie.qualityBadge}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardYear}>{movie.releaseYear}</Text>
          <Text style={styles.cardRating}>★ {movie.voteAverage}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{movie.title}</Text>
        {movie.genres[0] && (
          <View style={styles.genreTag}>
            <Text style={styles.genreTagText}>{movie.genres[0]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  posterWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#18181B',
  },
  posterImage: {
    width: CARD_WIDTH,
    height: 195,
    resizeMode: 'cover',
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  qualityBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardDetails: {
    marginTop: 6,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardYear: {
    color: '#71717A',
    fontSize: 11,
  },
  cardRating: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  genreTag: {
    marginTop: 4,
    backgroundColor: '#27272A',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreTagText: {
    color: '#A1A1AA',
    fontSize: 10,
  },
});
