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
import { useLogout } from "@/api-hooks/auth.api";
import { useUserResponsibilities, UserResponsibilities } from "@/api-hooks/user.api";
import { InfoToast, SuccessToast } from "@/services/toaster";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  logout: ({
    isSessionExpired,
  }: {
    isSessionExpired?: boolean;
  }) => Promise<void>;
  responsibilities: UserResponsibilities | null;
  responsibilitiesLoading: boolean;
  responsibilitiesError: Error | null;
  refreshResponsibilities: () => void;
}

const defaultResponsibilities: UserResponsibilities = {
  hospitalAdminFor: null,
  secretaryFor: []
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { mutate: logoutApi } = useLogout();
  const router = useRouter();
  const [responsibilitiesError, setResponsibilitiesError] = useState<Error | null>(null);
  
  const {
    data: responsibilities,
    isLoading: responsibilitiesLoading,
    refetch: refetchResponsibilities,
    error: queryError
  } = useUserResponsibilities();

  

  useEffect(() => {
    (async () => {
      const token = await getJWT();
      
      setIsLoggedIn(!!token);
      if (!token) {
        router.replace("/(drawer)/login" as any);
      } else {
        console.log('refreshing responsibilities');
        
        // Fetch responsibilities when logged in
        refetchResponsibilities();
      }
    })();
  }, []);

  // Update error state when query error changes
  useEffect(() => {
    if (queryError) {
      setResponsibilitiesError(queryError as Error);
    }
  }, [queryError]);

  
  const pathname = usePathname();

  const refreshResponsibilities = () => {
    if (isLoggedIn) {
      refetchResponsibilities();
    }
  };

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
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn,
      logout,
      responsibilities: responsibilities || defaultResponsibilities,
      responsibilitiesLoading,
      responsibilitiesError,
      refreshResponsibilities
    }}>
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

/**
 * Hook to check if the current user is a hospital admin
 * @param hospitalId Hospital ID to check against
 * @returns Boolean indicating if user is admin for that hospital
 */
export const useIsHospitalAdmin = (hospitalId?: number): boolean => {
  const { responsibilities } = useAuth();
  
  // If no hospitalId provided, return false
  if (hospitalId === undefined) {
    return false;
  }
  
  // Check if user is admin for the specified hospital
  return responsibilities?.hospitalAdminFor === hospitalId;
};

/**
 * Hook to check if the current user is a secretary for a specific doctor
 * @param doctorId Doctor ID to check against
 * @returns Boolean indicating if user is a secretary for that doctor
 */
export const useIsDoctorSecretary = (doctorId?: number): boolean => {
  const { responsibilities } = useAuth();
  
  // If no doctorId provided, return false
  if (doctorId === undefined) {
    return false;
  }
  
  // Check if user is a secretary for the specified doctor
  return responsibilities?.secretaryFor?.includes(doctorId) || false;
};
