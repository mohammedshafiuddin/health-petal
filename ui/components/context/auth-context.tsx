import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getJWT, deleteJWT } from "../../hooks/useJWT";
import { usePathname, useRouter } from "expo-router";
import queryClient from "@/utils/queryClient";
import { DeviceEventEmitter } from "react-native";
import { FORCE_LOGOUT_EVENT, SESSION_EXPIRED_MSG } from "@/lib/const-strs";
import { useLogout } from "@/app/api-hooks/auth.api";
import { InfoToast, SuccessToast } from "@/services/toaster";

interface AuthContextType {
  isLoggedIn: boolean;
  logout: ({
    isSessionExpired,
  }: {
    isSessionExpired?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { mutate: logoutApi } = useLogout();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getJWT();

      setIsLoggedIn(!!token);
      if (!token) {
        router.replace("/(drawer)/login" as any);
      }
    })();
  }, []);
  const pathname = usePathname();

  const logout = async ({
    isSessionExpired,
  }: {
    isSessionExpired?: boolean;
  }) => {

    if(!isSessionExpired) {

      logoutApi({} as any, {
        onSuccess: () => {},
        onSettled: () => {
          deleteJWT();
          setIsLoggedIn(false);
          
          router.replace({
            pathname: "/(drawer)/login" as any,
            params: isSessionExpired ? { message: SESSION_EXPIRED_MSG } : {},
          });
        },
      });
    }
    else {
      deleteJWT();
      setIsLoggedIn(false);
      InfoToast("Session expired. Please log in again.");
      router.replace({
        pathname: "/login" as any,
        params: { message: SESSION_EXPIRED_MSG },
      });
    }
    queryClient.clear();
  };

  React.useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      FORCE_LOGOUT_EVENT,
      () => {
        logout({ isSessionExpired: true });
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
