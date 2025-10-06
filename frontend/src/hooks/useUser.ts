import { useEffect, useState } from "react";
import { fetchUser } from "@/lib/api";
import { User } from "@/types/models";
import { useRouter } from "next/navigation";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetchUser()
      .then((data) => isMounted && setUser(data))
      .catch(() => router.push("/login"))
      .finally(() => isMounted && setLoading(false));

    return () => { isMounted = false };
  }, [router]);

  return { user, loading };
}
