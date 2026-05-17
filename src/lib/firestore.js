import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  getDocs, query, where, orderBy, limit, startAfter,
  serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

/* ─── Collection refs ─── */
const clientsRef = collection(db, "clients");
const foiresRef  = collection(db, "foires");

/* ─── CLIENTS ─── */

export async function addClient(data) {
  const docRef = await addDoc(clientsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateClient(id, data) {
  const ref = doc(db, "clients", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteClient(id) {
  await deleteDoc(doc(db, "clients", id));
}

export async function getClient(id) {
  const snap = await getDoc(doc(db, "clients", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getClients(filters = {}) {
  let q = query(clientsRef, orderBy("createdAt", "desc"));

  if (filters.foireId) {
    q = query(clientsRef, where("foireId", "==", filters.foireId), orderBy("createdAt", "desc"));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
    updatedAt: d.data().updatedAt?.toDate?.() || null,
  }));
}

/* ─── FOIRES ─── */

export async function addFoire(data) {
  const docRef = await addDoc(foiresRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateFoire(id, data) {
  await updateDoc(doc(db, "foires", id), data);
}

export async function deleteFoire(id) {
  await deleteDoc(doc(db, "foires", id));
}

export async function getFoires() {
  const snap = await getDocs(query(foiresRef, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
  }));
}

export async function getFoire(id) {
  const snap = await getDoc(doc(db, "foires", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
