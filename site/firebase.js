import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  doc, getDoc, setDoc, startAfter
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxXqKndsSh9ElewEigKiw6wX_Vwoxmreo",
  authDomain: "jpt-study.firebaseapp.com",
  projectId: "jpt-study",
  storageBucket: "jpt-study.firebasestorage.app",
  messagingSenderId: "515935713687",
  appId: "1:515935713687:web:0f01b7c91df8fb96ececd2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

setPersistence(auth, browserLocalPersistence).catch(() => {});

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return signOut(auth);
}

export async function saveExamAttempt(user, attempt) {
  if (!user) throw new Error("請先登入後再交卷。");
  const attempts = collection(db, "users", user.uid, "examAttempts");
  return addDoc(attempts, {
    ...attempt,
    submittedAt: serverTimestamp()
  });
}

export async function loadExamAttempts(user, maxItems = 10) {
  if (!user) return [];
  const attempts = collection(db, "users", user.uid, "examAttempts");
  const snapshot = await getDocs(query(attempts, orderBy("submittedAt", "desc"), limit(maxItems)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Stable IDs make offline retries safe; never duplicate a completed practice run.
export async function savePracticeAttempt(user, attempt) {
  if (!user) throw new Error("請先登入。");
  const ref = doc(db, "users", user.uid, "examAttempts", attempt.attemptId);
  const existing = await getDoc(ref);
  if (!existing.exists()) await setDoc(ref, { ...attempt, submittedAt: serverTimestamp() });
  return ref;
}

export async function loadAttemptPage(user, cursor = null) {
  if (!user) return { items: [], cursor: null, hasMore: false };
  const ref = collection(db, "users", user.uid, "examAttempts");
  const constraints = [orderBy("submittedAt", "desc")];
  if (cursor) constraints.push(startAfter(cursor));
  const snapshot = await getDocs(query(ref, ...constraints, limit(20)));
  return { items: snapshot.docs.map(d => ({ ...d.data(), id: d.id })),
    cursor: snapshot.docs.at(-1) || null, hasMore: snapshot.size === 20 };
}
