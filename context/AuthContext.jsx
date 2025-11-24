"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const fetchPerfil = async (userId) => {
      try {
        const { data, error } = await supabase
          .from("usuarios_perfil")
          .select("*")
          .eq("id", userId)
          .single();

        if (!isMounted) return;

        if (error) {
          console.warn("Error cargando perfil:", error.message);
          setPerfil(null);
        } else {
          setPerfil(data);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Excepción cargando perfil:", err);
        setPerfil(null);
      }
    };

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      if (!isMounted) return;

      setUser(currentUser);

      if (currentUser) {
        await fetchPerfil(currentUser.id);
      } else {
        setPerfil(null);
      }

      setLoading(false);
    };

    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        if (!isMounted) return;

        setUser(currentUser);

        if (currentUser) {
          await fetchPerfil(currentUser.id);
        } else {
          setPerfil(null);
          // Por si entra a /dashboard sin sesión
          if (pathname.startsWith("/dashboard")) {
            router.replace("/auth/login");
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authSub.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const value = {
    user,
    perfil,
    loading,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
