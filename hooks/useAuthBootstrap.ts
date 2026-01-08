import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const ME_URL = process.env.EXPO_PUBLIC_USER_ID_LOCAL;
const TOKEN_URL = process.env.EXPO_PUBLIC_TOKEN_LOCAL;

export function useAuthBootstrap() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1️⃣ Check session
        const meRes = await fetch(`${ME_URL}`, {
          credentials: "include",
        });

        if (!meRes.ok) {
          setUser(null);
          setLoading(false);
          return;
        }

        const meData = await meRes.json();

        console.log(meData.userId,"meData.userId");
        

        // 2️⃣ Fetch token (session-based)
        /* const tokenRes = await fetch(`${TOKEN_URL}`, {
          credentials: "include",
        }); */

        /* if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          await SecureStore.setItemAsync(
            "access_token",
            tokenData.accessToken
          );
        }
 */
        // 3️⃣ Restore minimal user state
        setUser(meData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  return { loading, user };
}
