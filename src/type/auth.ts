export type CaptchaData = {
  id: string;
  image: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
  captcha: string;
};

export type LoginRequestPayload = {
  email: string;
  password: string;
  captcha_id: string;
  captcha: string;
};

export type AuthUser = {
  id?: string | number;
  name?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  [key: string]: unknown;
};

export type LoginResult = {
  token: string | null;
  tokenType: string;
  user: AuthUser | null;
  raw: unknown;
};
