const BACKEND_URL = 'http://localhost:3002';
const TOKEN_KEY = 'bookshare_token';

export interface JWTPayload {
  sub: string;
  nome: string;
  email: string;
  exp: number;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  reputacao: number;
  limiteLivros: string;
  acessoSistema: string;
  statusMultas: 'PENDENTE' | 'REGULAR';
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Decodifica o token JWT nativamente sem bibliotecas externas.
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Erro ao decodificar o token JWT:', error);
    return null;
  }
};

/**
 * Realiza o login enviando e-mail e senha ao backend.
 */
export const apiLogin = async (email: string, senha: string): Promise<string> => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciais inválidas ou erro no servidor.');
  }

  const data = await response.json() as { accessToken: string };
  return data.accessToken;
};

/**
 * Realiza o cadastro de um novo usuário no backend.
 */
export const apiRegister = async (
  nome: string,
  email: string,
  senha: string
): Promise<any> => {
  const response = await fetch(`${BACKEND_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nome, email, senha }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 'Erro ao registrar usuário. Tente novamente ou use outro e-mail.'
    );
  }

  return response.json();
};

/**
 * Busca o perfil detalhado do usuário logado (contendo reputação, limites e multas).
 */
export const apiGetUserProfile = async (
  userId: string,
  token: string
): Promise<UserProfile> => {
  const response = await fetch(`${BACKEND_URL}/users/${userId}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar o perfil do usuário.');
  }

  return response.json() as Promise<UserProfile>;
};
