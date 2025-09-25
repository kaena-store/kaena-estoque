
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { app } from './firebase'; // Assuming your firebase app instance is exported from firebase.js

const db = getFirestore(app);

const migrateCollection = async (collectionName) => {
  try {
    const localData = localStorage.getItem(collectionName);
    if (localData) {
      const data = JSON.parse(localData);
      if (Array.isArray(data) && data.length > 0) {
        const collectionRef = collection(db, collectionName);
        
        // Check if migration has already been done for this collection
        const q = query(collectionRef, where('migratedFromLocalStorage', '==', true));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log(`Migrating ${collectionName}...`);
          for (const item of data) {
            await addDoc(collectionRef, { ...item, migratedFromLocalStorage: true });
          }
          console.log(`${collectionName} migrated successfully.`);
          // Optional: Clear local storage after successful migration
          // localStorage.removeItem(collectionName);
        } else {
          console.log(`${collectionName} already migrated.`);
        }
      }
    }
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }
};

export const migrateData = async () => {
  await migrateCollection('clientes');
  await migrateCollection('compras');
  await migrateCollection('produtos');
  await migrateCollection('vendas');
};
