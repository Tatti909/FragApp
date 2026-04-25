import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';

import {
  createProfile,
  listenToAuth,
  listenToFragranceList,
  PROFILE_LISTS,
  removeFragranceFromList,
  signIn,
  signOutProfile,
} from '../services/profileService';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('signIn');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [collectionItems, setCollectionItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    return listenToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setCollectionItems([]);
      setWishlistItems([]);
      return undefined;
    }

    const stopListeningCollection = listenToFragranceList(
      user.uid,
      PROFILE_LISTS.collection,
      setCollectionItems,
      (listError) => setError(listError.message)
    );
    const stopListeningWishlist = listenToFragranceList(
      user.uid,
      PROFILE_LISTS.wishlist,
      setWishlistItems,
      (listError) => setError(listError.message)
    );

    return () => {
      stopListeningCollection();
      stopListeningWishlist();
    };
  }, [user]);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Add email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (authMode === 'create') {
        await createProfile(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setLoading(true);
      setError('');
      await signOutProfile();
    } catch (signOutError) {
      setError(signOutError.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(listName, fragranceId) {
    try {
      setError('');
      await removeFragranceFromList(user.uid, listName, fragranceId);
    } catch (removeError) {
      setError(removeError.message);
    }
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall">Profile</Text>
        <Text style={styles.mutedText}>Sign in to save your collection and wishlist.</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button mode="contained" loading={loading} disabled={loading} onPress={handleSubmit}>
          {authMode === 'create' ? 'Create profile' : 'Sign in'}
        </Button>
        <Button
          mode="text"
          onPress={() => setAuthMode(authMode === 'create' ? 'signIn' : 'create')}
        >
          {authMode === 'create' ? 'Already have a profile?' : 'Create a new profile'}
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Profile</Text>
      <Text style={styles.mutedText}>{user.email}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Divider />

      <FragranceList
        title="My Collection"
        emptyText="No fragrances in your collection yet."
        items={collectionItems}
        onRemove={(fragranceId) => removeItem(PROFILE_LISTS.collection, fragranceId)}
      />

      <FragranceList
        title="Wishlist"
        emptyText="No fragrances in your wishlist yet."
        items={wishlistItems}
        onRemove={(fragranceId) => removeItem(PROFILE_LISTS.wishlist, fragranceId)}
      />

      <Button mode="outlined" loading={loading} disabled={loading} onPress={handleSignOut}>
        Sign out
      </Button>
    </ScrollView>
  );
}

function FragranceList({ title, emptyText, items, onRemove }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium">
        {title} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={styles.mutedText}>{emptyText}</Text>
      ) : (
        items.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.row}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
              )}
              <View style={styles.textContainer}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodyMedium" style={styles.mutedText}>
                  {item.brand}
                </Text>
              </View>
              <IconButton icon="delete-outline" onPress={() => onRemove(item.id)} />
            </View>
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
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
});
