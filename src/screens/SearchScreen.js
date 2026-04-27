import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Searchbar, Text } from 'react-native-paper';
import { searchFragrances } from '../services/fragellaApi';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmedQuery.length < 3) {
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    let ignore = false;
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const response = await searchFragrances(trimmedQuery);

        if (!ignore) {
          setResults(response);
        }
      } catch (searchError) {
        if (!ignore) {
          setResults([]);
          setError(searchError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 450);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  function renderItem({ item }) {
    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('FragranceDetail', { fragrance: item })}
      >
        <View style={styles.row}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodyMedium">{item.brand}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {item.year ? `Year: ${item.year}` : 'Year: -'}
              {item.rating ? `  |  Rating: ${item.rating}` : ''}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Search</Text>
      <Searchbar
        placeholder="Search with name or brand"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.searchbar}
      />
      <Text style={styles.infoText}>
        {trimmedQuery.length < 3
          ? 'Type at least 3 characters to see results.'
          : 'Searching for fragrances...'}
      </Text>

      {loading ? <ActivityIndicator style={styles.loader} /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && !error && trimmedQuery.length >= 3 && results.length === 0 ? (
        <Text style={styles.infoText}>No results.</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  searchbar: {
    marginBottom: 2,
  },
  infoText: {
    color: '#475569',
    marginBottom: 6,
  },
  loader: {
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#b91c1c',
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  textContainer: {
    flex: 1,
  },
  meta: {
    color: '#64748b',
  },
});
