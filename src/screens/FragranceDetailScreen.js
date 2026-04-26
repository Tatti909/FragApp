import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Divider, Text } from 'react-native-paper';

import {
  addFragranceToList,
  listenToAuth,
  PROFILE_LISTS,
} from '../services/profileService';
import { errorFeedback, successFeedback } from '../services/hapticsService';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="labelLarge" style={styles.infoLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium">{value || '-'}</Text>
    </View>
  );
}

function ChipList({ title, values }) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text variant="titleMedium">{title}</Text>
      <View style={styles.chipsWrap}>
        {values.slice(0, 12).map((value, index) => (
          <Chip key={`${title}-${value}-${index}`}>{value}</Chip>
        ))}
      </View>
    </View>
  );
}

export default function FragranceDetailScreen({ route }) {
  const fragrance = route.params?.fragrance ?? null;
  const [user, setUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return listenToAuth(setUser);
  }, []);

  async function saveToList(listName) {
    if (!user || !fragrance) {
      errorFeedback();
      setSaveMessage('Sign in to save fragrances.');
      return;
    }

    try {
      setSaving(true);
      setSaveMessage('');
      await addFragranceToList(user.uid, listName, fragrance);
      successFeedback();
      setSaveMessage('Saved to profile.');
    } catch (error) {
      errorFeedback();
      setSaveMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!fragrance) {
    return (
      <View style={styles.centered}>
        <Text>No fragrance details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {fragrance.imageUrl ? <Image source={{ uri: fragrance.imageUrl }} style={styles.image} /> : null}

      <Text variant="headlineSmall">{fragrance.name}</Text>
      <Text variant="titleMedium" style={styles.brandText}>
        {fragrance.brand}
      </Text>

      <View style={styles.buttonRow}>
        <Button
          mode="contained-tonal"
          loading={saving}
          disabled={saving}
          onPress={() => saveToList(PROFILE_LISTS.collection)}
        >
          Add to collection
        </Button>
        <Button
          mode="contained-tonal"
          loading={saving}
          disabled={saving}
          onPress={() => saveToList(PROFILE_LISTS.wishlist)}
        >
          Add to wishlist
        </Button>
      </View>

      {saveMessage ? <Text style={styles.messageText}>{saveMessage}</Text> : null}

      <Divider />

      <View style={styles.section}>
        <InfoRow label="Year" value={fragrance.year} />
        <InfoRow label="Rating" value={fragrance.rating} />
        <InfoRow label="Longevity" value={fragrance.longevity} />
        <InfoRow label="Sillage" value={fragrance.sillage} />
        <InfoRow label="Best Season" value={fragrance.bestSeason} />
        <InfoRow label="Best Occasion" value={fragrance.bestOccasion} />
      </View>

      <ChipList title="General Notes" values={fragrance.generalNotes} />
      <ChipList title="Top Notes" values={fragrance.notes?.top} />
      <ChipList title="Middle Notes" values={fragrance.notes?.middle} />
      <ChipList title="Base Notes" values={fragrance.notes?.base} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
    alignSelf: 'center',
    backgroundColor: '#e2e8f0',
  },
  brandText: {
    color: '#475569',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  messageText: {
    color: '#64748b',
  },
  section: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    color: '#334155',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
