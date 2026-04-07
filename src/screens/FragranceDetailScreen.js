import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, Text } from 'react-native-paper';

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
