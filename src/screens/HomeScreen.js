import { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { getHomeFragranceSections } from '../services/fragellaApi';

function FragranceImage({ fragrance }) {
  if (!fragrance.imageUrl) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return <Image source={{ uri: fragrance.imageUrl }} style={styles.image} resizeMode="contain" />;
}

function HomeSection({ title, data, navigation }) {
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
              {item.rating ? `Rating: ${item.rating}` : item.year ? `Year: ${item.year}` : ''}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [sections, setSections] = useState({
    freshClean: [],
    vanillaAmber: [],
    topDesigner: [],
    topNiche: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadHomeSections() {
      try {
        setLoading(true);
        setError('');
        const homeSections = await getHomeFragranceSections();

        if (!ignore) {
          setSections(homeSections);
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
      <Text style={styles.mutedText}>Discover fragrances by notes and brands.</Text>

      {loading ? <ActivityIndicator style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && !error ? (
        <>
          <HomeSection
            title="Fresh & Clean"
            data={sections.freshClean}
            navigation={navigation}
          />
          <HomeSection
            title="Vanilla & Amber"
            data={sections.vanillaAmber}
            navigation={navigation}
          />
          <HomeSection
            title="Top Rated Designer"
            data={sections.topDesigner}
            navigation={navigation}
          />
          <HomeSection
            title="Top Rated Niche"
            data={sections.topNiche}
            navigation={navigation}
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
    paddingVertical: 6,
    paddingRight: 16,
  },
  card: {
    width: 152,
    minHeight: 230,
    padding: 10,
    gap: 6,
  },
  image: {
    width: '100%',
    height: 126,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
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
