import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "./types";

export type UserRole   = "FARMER" | "BUYER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type LocationVisibility = "EXACT" | "DISTRICT" | "HIDDEN";

export interface UserSummary {
  id:           string;
  fullName:     string;
  phone:        string;
  email:        string | null;
  role:         UserRole;
  status:       UserStatus;
  registeredAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType:   string;
  expiresIn:   number;
  user:        UserSummary;
}

export interface ApiWrapper<T> {
  success:   boolean;
  message:   string;
  data:      T;
  timestamp: string;
}

export interface LoginRequest {
  identifier: string;
  password:   string;
}

export interface RegisterFarmerRequest {
  fullName:  string;
  phone:     string;
  email?:    string;
  password:  string;
  farmName?: string;
  locality?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface RegisterBuyerRequest {
  fullName:         string;
  phone:            string;
  email?:           string;
  password:         string;
  deliveryAddress?: string;
  locality?:        string;
  district?:        string;
}

export interface UpdateFarmerProfileRequest {
  fullName?:           string;
  email?:              string;
  farmName?:           string;
  bio?:                string;
  locality?:           string;
  district?:           string;
  latitude?:           number;
  longitude?:          number;
  locationVisibility?: LocationVisibility;
  avatarUrl?:          string;
}

export interface UpdateBuyerProfileRequest {
  fullName?:               string;
  email?:                  string;
  deliveryAddress?:        string;
  locality?:               string;
  district?:               string;
  preferredContactMethod?: string;
  avatarUrl?:              string;
}

export interface FarmerProfileResponse {
  id:                 string;
  fullName:           string;
  phone:              string;
  email:              string | null;
  farmName:           string | null;
  bio:                string | null;
  locality:           string | null;
  district:           string | null;
  latitude:           number | null;
  longitude:          number | null;
  locationVisibility: LocationVisibility;
  avatarUrl:          string | null;
  role:               UserRole;
  status:             UserStatus;
}

export interface BuyerProfileResponse {
  id:                     string;
  fullName:               string;
  phone:                  string;
  email:                  string | null;
  deliveryAddress:        string | null;
  locality:               string | null;
  district:               string | null;
  preferredContactMethod: string | null;
  avatarUrl:              string | null;
  role:                   UserRole;
  status:                 UserStatus;
}

export type ProfileResponse = FarmerProfileResponse | BuyerProfileResponse;

function generateRequestId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return ts + "-" + rand;
}

function normalizeError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: "An unexpected error occurred. Please try again.",
    status:  error.response?.status ?? 0,
  };
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    apiError.message =
      (data["message"] as string | undefined) ??
      (data["detail"]  as string | undefined) ??
      apiError.message;
  } else if (error.code === "ERR_NETWORK") {
    apiError.message = "Cannot reach the server. Ensure the backend services are running.";
  }
  return apiError;
}

function createAuthClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 12000,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers["X-Request-Id"] = generateRequestId();
    config.headers["X-Client"] = "finance-erp-frontend/1.0";
    const token = localStorage.getItem("ty_access_token");
    if (token) config.headers["Authorization"] = "Bearer " + token;
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) return Promise.reject(normalizeError(error));
      return Promise.reject(error);
    },
  );

  return instance;
}

export const authClient = createAuthClient("/api/auth");

export const authApi = {
  login: async (body: LoginRequest): Promise<AuthResponse> => {
    const res = await authClient.post<ApiWrapper<AuthResponse>>("/v1/auth/login", body);
    return res.data.data;
  },
  registerFarmer: async (body: RegisterFarmerRequest): Promise<AuthResponse> => {
    const res = await authClient.post<ApiWrapper<AuthResponse>>("/v1/auth/register/farmer", body);
    return res.data.data;
  },
  registerBuyer: async (body: RegisterBuyerRequest): Promise<AuthResponse> => {
    const res = await authClient.post<ApiWrapper<AuthResponse>>("/v1/auth/register/buyer", body);
    return res.data.data;
  },
  getMyProfile: async (): Promise<ProfileResponse> => {
    const res = await authClient.get<ApiWrapper<ProfileResponse>>("/v1/profile/me");
    return res.data.data;
  },
  updateFarmerProfile: async (body: UpdateFarmerProfileRequest): Promise<FarmerProfileResponse> => {
    const res = await authClient.put<ApiWrapper<FarmerProfileResponse>>("/v1/profile/farmer", body);
    return res.data.data;
  },
  updateBuyerProfile: async (body: UpdateBuyerProfileRequest): Promise<BuyerProfileResponse> => {
    const res = await authClient.put<ApiWrapper<BuyerProfileResponse>>("/v1/profile/buyer", body);
    return res.data.data;
  },
};
