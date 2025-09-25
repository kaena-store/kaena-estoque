
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

const migrateCollection = async (collectionName, user) => {
  try {
    const localData = localStorage.getItem(collectionName);
    if (localData) {
      const data = JSON.parse(localData);
      if (Array.isArray(data) && data.length > 0) {
        const collectionRef = collection(db, collectionName);
        
        // Check if migration has already been done for this collection and this user
        const q = query(collectionRef, where('migratedFromLocalStorage', '==', true), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log(`Migrating ${collectionName} for user ${user.uid}...`);
          for (const item of data) {
            await addDoc(collectionRef, { ...item, migratedFromLocalStorage: true, userId: user.uid });
          }
          console.log(`${collectionName} migrated successfully for user ${user.uid}.`);
          // Optional: Clear local storage after successful migration
          // localStorage.removeItem(collectionName);
        } else {
          console.log(`${collectionName} already migrated for user ${user.uid}.`);
        }
      }
    }
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }
};

export const migrateData = async (user) => {
  await migrateCollection('clientes', user);
  await migrateCollection('compras', user);
  await migrateCollection('produtos', user);
  await migrateCollection('vendas', user);
};
