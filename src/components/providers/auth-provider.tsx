"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: any = "Public Viewer"; // Default role
          
          if (firebaseUser.email === "dsvsiddharth@gmail.com") {
            role = "Super Admin";
          } else if (userDoc.exists()) {
            role = userDoc.data().role || "Public Viewer";
          }
          
          setUser(firebaseUser, role);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(firebaseUser, "Public Viewer");
        }
      } else {
        setUser(null, null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
