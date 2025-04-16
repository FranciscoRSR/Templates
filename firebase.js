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
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}

export async function loadDataFromFirebase() {
    try {
        console.log("Attempting to load data from Firestore...");
        const doc = await db.collection('appData').doc('currentData').get();
        console.log("Document exists:", doc.exists);
        if (doc.exists) {
            return doc.data();
        } else {
            console.log("No document found");
            return null;
        }
    } catch (error) {
        console.error("Error loading data:", error);
        throw error;
    }
}

export async function saveDataToFirebase(data) {
    try {
        await db.collection('appData').doc('currentData').set(data);
        console.log("Data saved successfully");
    } catch (error) {
        console.error("Error saving data:", error);
        throw error;
    }
}