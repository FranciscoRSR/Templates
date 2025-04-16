import { handleError } from './errorHandler.js';

const firebaseConfig = {
    apiKey: "AIzaSyAC_Xt-Nyz4_jfzEBbqUZfCLf__-wnXaLQ",
    authDomain: "rsr-templates.firebaseapp.com",
    projectId: "rsr-templates",
    storageBucket: "rsr-templates.appspot.com",
    messagingSenderId: "234762099768",
    appId: "1:234762099768:web:fdef26741b469db1089acd"
};

let db;

export function initializeFirebase() {
    try {
        const app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    } catch (error) {
        handleError(error, 'Failed to initialize Firebase');
    }
}

export async function loadDataFromFirebase(collectionName, pageSize = 10, lastDoc = null) {
    try {
        console.log(`Loading ${collectionName} from Firestore...`);
        if (!navigator.onLine) {
            throw new Error('No internet connection');
        }
        let query = db.collection('appData').doc('currentData').collection(collectionName).orderBy('name').limit(pageSize);
        if (lastDoc) {
            query = query.startAfter(lastDoc);
        }
        const snapshot = await query.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
        return { data, lastDoc: newLastDoc };
    } catch (error) {
        handleError(error, `Error loading ${collectionName} from Firestore`);
        throw error;
    }
}

export async function saveDataToFirebase(data) {
    try {
        if (!navigator.onLine) {
            throw new Error('No internet connection');
        }
        const batch = db.batch();
        for (const [key, value] of Object.entries(data)) {
            const docRef = db.collection('appData').doc('currentData').collection(key);
            for (const item of value) {
                const itemRef = docRef.doc(item.id || item.name);
                batch.set(itemRef, item);
            }
        }
        await batch.commit();
        console.log("Data saved successfully");
    } catch (error) {
        handleError(error, 'Error saving data to Firestore');
        throw error;
    }
}
