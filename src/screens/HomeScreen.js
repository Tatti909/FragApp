import { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import { getHomeFragranceSections } from '../services/fragellaApi';

function FragranceImage({ fragrance }) {
  if (!fragrance.imageUrl) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return <Image source={{ uri: fragrance.imageUrl }} style={styles.image} />;
}

function HomeSection({ title, data, navigation, metaKey }) {
  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text variant="titleLarge">{title}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('FragranceDetail', { fragrance: item })}
          >
            <FragranceImage fragrance={item} />
            <Text variant="titleSmall" numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText} numberOfLines={1}>
              {item.brand}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {metaKey === 'rating' ? `Rating: ${item.rating}` : `Year: ${item.year}`}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [recentPicks, setRecentPicks] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadHomeSections() {
      try {
        setLoading(true);
        setError('');
        const sections = await getHomeFragranceSections();

        if (!ignore) {
          setRecentPicks(sections.recentPicks);
          setTopRated(sections.topRated);
        }
      } catch (homeError) {
        if (!ignore) {
          setError(homeError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadHomeSections();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Home</Text>
      <Text style={styles.mutedText}>Discover fragrances from popular brands.</Text>

      {loading ? <ActivityIndicator style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && !error ? (
        <>
          <HomeSection
            title="Recent picks"
            data={recentPicks}
            navigation={navigation}
            metaKey="year"
          />
          <HomeSection
            title="Top rated"
            data={topRated}
            navigation={navigation}
            metaKey="rating"
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  section: {
    gap: 10,
  },
  horizontalList: {
    gap: 10,
    paddingRight: 16,
  },
  card: {
    width: 150,
    padding: 10,
    gap: 6,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  mutedText: {
    color: '#64748b',
  },
  errorText: {
    color: '#b91c1c',
  },
  loader: {
    marginVertical: 12,
  },
});
