import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const getFriendInfo = async (id) => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const name = `${docSnap.data().first} ${docSnap.data().last}`;
      const photo = docSnap.data().profilePic;
      if (!name | !photo) {
        return 'error';
      } else {
        return { name, photo };
      }
    }
  } catch {
    return 'error';
  }
};

export default getFriendInfo;
