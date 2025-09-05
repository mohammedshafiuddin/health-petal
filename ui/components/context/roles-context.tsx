import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getRoles, saveRoles, deleteRoles } from "../../hooks/useJWT";
import { ROLE_NAMES } from "../../lib/constants";

interface RolesContextType {
  roles: string[] | null;
  setRoles: (roles: string[] | null) => void;
  refreshRoles: () => Promise<void>;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export const RolesProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<string[] | null>(null);

  const refreshRoles = async () => {
    const r = await getRoles();
    setRoles(r);
  };

  useEffect(() => {
    refreshRoles();
  }, []);

  return (
    <RolesContext.Provider value={{ roles, setRoles, refreshRoles }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = () => {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error("useRoles must be used within a RolesProvider");
  return ctx;
};

/**
 * Hook to check if the current user has admin role
 * @returns boolean indicating if user has admin role
 */
export const useIsAdmin = (): boolean => {
  const { roles } = useRoles();
  if (!roles) return false;
  return roles.includes(ROLE_NAMES.ADMIN);
};

/**
 * Hook to check if the current user has hospital admin role
 * @returns boolean indicating if user has hospital admin role
 */
export const useIsHospitalAdmin = (): boolean => {
  const { roles } = useRoles();
  if (!roles) return false;
  return roles.includes(ROLE_NAMES.HOSPITAL_ADMIN);
};
