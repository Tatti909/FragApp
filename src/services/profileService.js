import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, } from 'firebase/firestore';
import { auth, db } from './firebase';

export const PROFILE_LISTS = {
  collection: 'collection',
  wishlist: 'wishlist',
};

export function listenToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function createProfile(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: userCredential.user.email,
    createdAt: serverTimestamp(),
  });

  return userCredential.user;
}

export async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutProfile() {
  await signOut(auth);
}

export function listenToFragranceList(userId, listName, callback, onError) {
  const listQuery = query(
    collection(db, 'users', userId, listName),
    orderBy('addedAt', 'desc')
  );

  return onSnapshot(
    listQuery,
    (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    onError
  );
}

export async function addFragranceToList(userId, listName, fragrance) {
  const listItemId = getFragranceListId(fragrance);

  await setDoc(doc(db, 'users', userId, listName, listItemId), {
    name: fragrance.name,
    brand: fragrance.brand,
    imageUrl: fragrance.imageUrl ?? '',
    year: fragrance.year ?? '',
    generalNotes: fragrance.generalNotes ?? [],
    notes: fragrance.notes ?? { top: [], middle: [], base: [] },
    addedAt: serverTimestamp(),
  });
}

export async function removeFragranceFromList(userId, listName, fragranceId) {
  await deleteDoc(doc(db, 'users', userId, listName, fragranceId));
}

function getFragranceListId(fragrance) {
  return `${fragrance.brand}-${fragrance.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
