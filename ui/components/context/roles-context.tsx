import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getRoles, saveRoles, deleteRoles } from "../../hooks/useJWT";

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
