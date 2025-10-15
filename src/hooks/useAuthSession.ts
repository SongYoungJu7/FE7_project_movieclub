import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useMutation } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";

// DB의 is_online 상태를 업데이트하는 함수
const updateUserOnlineStatus = async (user: User, isOnline: boolean) => {
  const { error } = await supabase
    .from("users")
    .update({ is_online: isOnline })
    .eq("id", user.id);

  if (error) {
    console.error(`Failed to set is_online to ${isOnline}:`, error.message);
    throw new Error(error.message);
  }
};

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ user, isOnline }: { user: User; isOnline: boolean }) =>
      updateUserOnlineStatus(user, isOnline),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        updateStatus({ user: currentUser, isOnline: true });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const previousUser = user;
        const currentUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(currentUser);
        setLoading(false);

        if (_event === "SIGNED_IN" && currentUser) {
          updateStatus({ user: currentUser, isOnline: true });
        }
        if (_event === "SIGNED_OUT" && previousUser) {
          updateStatus({ user: previousUser, isOnline: false });
        }
      }
    );

    const handleBeforeUnload = () => {
      if (user) {
        updateStatus({ user, isOnline: false });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

  }, [updateStatus, user]);

  return { session, user, loading };
}
