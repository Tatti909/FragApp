import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, IconButton, Searchbar, Text } from 'react-native-paper';
import { searchFragrances } from '../services/fragellaApi';
import { successFeedback } from '../services/hapticsService';

const MAX_SELECTED = 3;

function fragranceKey(fragrance) {
  return `${fragrance.brand}-${fragrance.name}`.toLowerCase();
}

function normalizeNote(note) {
  return note.trim().toLowerCase();
}

function getAllNotes(fragrance) {
  return [
    ...(fragrance.generalNotes ?? []),
    ...(fragrance.notes?.top ?? []),
    ...(fragrance.notes?.middle ?? []),
    ...(fragrance.notes?.base ?? []),
  ].filter(Boolean);
}

function getSearchTerms(selectedFragrances) {
  const noteCounts = new Map();

  selectedFragrances.forEach((fragrance) => {
    const uniqueNotes = new Set(getAllNotes(fragrance).map(normalizeNote));

    uniqueNotes.forEach((note) => {
      noteCounts.set(note, (noteCounts.get(note) ?? 0) + 1);
    });
  });

  return [...noteCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([note]) => note);
}

function scoreRecommendation(fragrance, searchTerms) {
  const notes = new Set(getAllNotes(fragrance).map(normalizeNote));
  const matchingNotes = searchTerms.filter((note) => notes.has(note));

  return {
    ...fragrance,
    score: matchingNotes.length,
    matchingNotes,
  };
}

export default function RecommendationsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedFragrances, setSelectedFragrances] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState('');

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const selectedKeys = useMemo(
    () => new Set(selectedFragrances.map(fragranceKey)),
    [selectedFragrances]
  );

  useEffect(() => {
    if (trimmedQuery.length < 3) {
      setSearchResults([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    let ignore = false;
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError('');
        const results = await searchFragrances(trimmedQuery);

        if (!ignore) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!ignore) {
          setSearchResults([]);
          setSearchError(error.message);
        }
      } finally {
        if (!ignore) {
          setSearchLoading(false);
        }
      }
    }, 450);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (selectedFragrances.length === 0) {
      setRecommendations([]);
      setRecommendationsError('');
      setRecommendationsLoading(false);
      return;
    }

    let ignore = false;

    async function loadRecommendations() {
      const searchTerms = getSearchTerms(selectedFragrances);

      if (searchTerms.length === 0) {
        setRecommendations([]);
        setRecommendationsLoading(false);
        setRecommendationsError('Selected fragrances do not have notes for recommendations.');
        return;
      }

      try {
        setRecommendationsLoading(true);
        setRecommendationsError('');

        const results = await Promise.all(searchTerms.map((term) => searchFragrances(term)));
        const candidates = results.flat();
        const seenKeys = new Set(selectedFragrances.map(fragranceKey));
        const scoredRecommendations = [];

        candidates.forEach((fragrance) => {
          const key = fragranceKey(fragrance);

          if (seenKeys.has(key)) {
            return;
          }

          seenKeys.add(key);
          const scoredFragrance = scoreRecommendation(fragrance, searchTerms);

          if (scoredFragrance.score > 0) {
            scoredRecommendations.push(scoredFragrance);
          }
        });

        scoredRecommendations.sort((first, second) => second.score - first.score);

        if (!ignore) {
          setRecommendations(scoredRecommendations.slice(0, 20));
        }
      } catch (error) {
        if (!ignore) {
          setRecommendations([]);
          setRecommendationsError(error.message);
        }
      } finally {
        if (!ignore) {
          setRecommendationsLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [selectedFragrances]);

  function addFragrance(fragrance) {
    const alreadySelected = selectedFragrances.some(
      (item) => fragranceKey(item) === fragranceKey(fragrance)
    );

    if (selectedFragrances.length >= MAX_SELECTED || alreadySelected) {
      return;
    }

    successFeedback();
    setSelectedFragrances((currentFragrances) => [...currentFragrances, fragrance]);
  }

  function removeFragrance(fragrance) {
    successFeedback();
    setSelectedFragrances((currentFragrances) =>
      currentFragrances.filter((item) => fragranceKey(item) !== fragranceKey(fragrance))
    );
  }

  function renderSearchResult(fragrance) {
    const isSelected = selectedKeys.has(fragranceKey(fragrance));
    const cannotAdd = selectedFragrances.length >= MAX_SELECTED || isSelected;

    return (
      <Card key={fragrance.id} style={styles.card}>
        <View style={styles.row}>
          <FragranceImage fragrance={fragrance} />
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{fragrance.name}</Text>
            <Text variant="bodyMedium" style={styles.mutedText}>
              {fragrance.brand}
            </Text>
          </View>
          <IconButton
            icon={isSelected ? 'check' : 'plus'}
            mode="contained-tonal"
            disabled={cannotAdd}
            onPress={() => addFragrance(fragrance)}
          />
        </View>
      </Card>
    );
  }

  function renderSelectedFragrance(fragrance) {
    return (
      <Card key={fragranceKey(fragrance)} style={styles.card}>
        <View style={styles.row}>
          <FragranceImage fragrance={fragrance} />
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{fragrance.name}</Text>
            <Text variant="bodyMedium" style={styles.mutedText}>
              {fragrance.brand}
            </Text>
          </View>
          <IconButton icon="close" onPress={() => removeFragrance(fragrance)} />
        </View>
      </Card>
    );
  }

  function renderRecommendation(fragrance) {
    return (
      <Card
        key={fragranceKey(fragrance)}
        style={styles.card}
        onPress={() => navigation.navigate('FragranceDetail', { fragrance })}
      >
        <View style={styles.row}>
          <FragranceImage fragrance={fragrance} />
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{fragrance.name}</Text>
            <Text variant="bodyMedium" style={styles.mutedText}>
              {fragrance.brand}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              Same notes: {fragrance.matchingNotes.join(', ')}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Recommendations</Text>
      <Text style={styles.mutedText}>Choose 1-3 fragrances to find similar notes.</Text>

      <Searchbar
        placeholder="Search fragrance"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {trimmedQuery.length > 0 && trimmedQuery.length < 3 ? (
        <Text style={styles.mutedText}>Type at least 3 characters.</Text>
      ) : null}

      {searchLoading ? <ActivityIndicator style={styles.loader} /> : null}
      {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

      {!searchLoading && !searchError && searchResults.length > 0 ? (
        <View style={styles.section}>{searchResults.slice(0, 5).map(renderSearchResult)}</View>
      ) : null}

      <View style={styles.section}>
        <Text variant="titleMedium">Selected {selectedFragrances.length}/3</Text>
        {selectedFragrances.length === 0 ? (
          <Text style={styles.mutedText}>No fragrances selected yet.</Text>
        ) : (
          selectedFragrances.map(renderSelectedFragrance)
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium">Similar fragrances</Text>
        {recommendationsLoading ? <ActivityIndicator style={styles.loader} /> : null}
        {recommendationsError ? <Text style={styles.errorText}>{recommendationsError}</Text> : null}
        {!recommendationsLoading &&
        !recommendationsError &&
        selectedFragrances.length > 0 &&
        recommendations.length === 0 ? (
          <Text style={styles.mutedText}>No recommendations found yet.</Text>
        ) : null}
        {recommendations.map(renderRecommendation)}
      </View>
    </ScrollView>
  );
}

function FragranceImage({ fragrance }) {
  if (!fragrance.imageUrl) {
    return <View style={[styles.image, styles.imagePlaceholder]} />;
  }

  return <Image source={{ uri: fragrance.imageUrl }} style={styles.image} />;
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    paddingBottom: 28,
  },
  section: {
    gap: 10,
  },
  card: {
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    gap: 2,
  },
  mutedText: {
    color: '#64748b',
  },
  errorText: {
    color: '#b91c1c',
  },
  loader: {
    marginVertical: 8,
  },
});
