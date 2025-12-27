import { ref, set, push } from "firebase/database";
import { db } from "../config/firebaseConfig";

// Create a new user entry
   const FireBasedatabsetesting = async (name: string, email: string) => {
  const userRef = ref(db, "users");   // path in database
  const newUserRef = push(userRef);   // generate unique ID
  await set(newUserRef, {
    name: name,
    email: email,
    createdAt: new Date().toISOString(),
  });
  console.log("✅ User added successfully!");
};

const f = ()=> {FireBasedatabsetesting('vv','bbb')}

export default f;
