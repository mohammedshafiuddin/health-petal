import { StorageService } from '@/lib/StorageService';

export const JWT_KEY = 'jwt_token';
export const ROLES_KEY = 'user_roles';

export async function saveJWT(token: string) {
  await StorageService.setItem(JWT_KEY, token);
}

export async function getJWT() {
  return await StorageService.getItem(JWT_KEY);
}

export async function deleteJWT() {
  await StorageService.removeItem(JWT_KEY);
}

export async function saveRoles(roles: string[]) {
  await StorageService.setItem(ROLES_KEY, JSON.stringify(roles));
}

export async function getRoles(): Promise<string[] | null> {
  const rolesStr = await StorageService.getItem(ROLES_KEY);
  if (!rolesStr) return null;
  try {
    return JSON.parse(rolesStr);
  } catch {
    return null;
  }
}

export async function deleteRoles() {
  await StorageService.removeItem(ROLES_KEY);
}
