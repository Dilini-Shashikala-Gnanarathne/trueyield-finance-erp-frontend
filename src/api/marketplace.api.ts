import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "./types";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ListingStatus   = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "CANCELLED" | "EXPIRED";
export type QualityGrade    = "PREMIUM" | "STANDARD" | "PROCESSING";
export type ProduceCategory = "FRUIT" | "VEGETABLE" | "GRAIN" | "SPICE" | "OTHER";
export type LocationVisibility = "APPROXIMATE" | "EXACT_AFTER_ORDER";
export type SortBy = "NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "HARVEST_DATE_ASC" | "HARVEST_DATE_DESC";

// ─── Produce ──────────────────────────────────────────────────────────────────

export interface ProduceResponse {
  id:             string;
  code:           string;
  name:           string;
  scientificName: string | null;
  category:       ProduceCategory;
  description:    string | null;
  defaultUnit:    string;
  supportedUnits:  string[];
  supportedGrades: string[];
  imageUrl:       string | null;
  isActive:       boolean;
  createdAt:      string;
}

export interface CreateProduceRequest {
  code:           string;
  name:           string;
  scientificName?: string;
  category:       ProduceCategory;
  description?:   string;
  defaultUnit:    string;
  supportedUnits?:  string[];
  supportedGrades?: string[];
  imageUrl?:      string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface ListingLocationDto {
  latitude:   number;
  longitude:  number;
  locality:   string;
  district?:  string;
  visibility: LocationVisibility;
}

// ─── Seller ───────────────────────────────────────────────────────────────────

export interface SellerSummaryDto {
  sellerId:   string;
  sellerName: string;
  farmName:   string | null;
  locality:   string | null;
  district:   string | null;
  avatarUrl:  string | null;
}

// ─── Images ───────────────────────────────────────────────────────────────────

export interface ListingImageResponse {
  id:           string;
  imageUrl:     string;
  storageKey:   string | null;
  isPrimary:    boolean;
  displayOrder: number;
  createdAt:    string;
}

export interface AddImageRequest {
  imageUrl:     string;
  storageKey?:  string;
  isPrimary?:   boolean;
  displayOrder?: number;
}

// ─── Listing Requests ─────────────────────────────────────────────────────────

export interface CreateListingRequest {
  produceId:        string;
  title?:           string;
  description?:     string;
  totalQuantity:    number;
  unit:             string;
  pricePerUnit:     number;
  qualityGrade:     QualityGrade;
  harvestDate:      string;
  location:         ListingLocationDto;
  minOrderQuantity?: number;
  imageUrls?:        string[];
}

export interface UpdateListingRequest {
  title?:           string;
  description?:     string;
  totalQuantity?:   number;
  pricePerUnit?:    number;
  qualityGrade?:    QualityGrade;
  harvestDate?:     string;
  location?:        Partial<ListingLocationDto>;
  minOrderQuantity?: number;
}

export interface CancelListingRequest {
  reason?: string;
}

export interface ReserveStockRequest {
  quantity: number;
  orderId?: string;
}

export interface ListingSearchCriteria {
  query?:       string;
  produceId?:   string;
  produceCode?: string;
  category?:    ProduceCategory;
  locality?:    string;
  district?:    string;
  minPrice?:    number;
  maxPrice?:    number;
  qualityGrade?: QualityGrade;
  inStockOnly?: boolean;
  sortBy?:      SortBy;
  page?:        number;
  size?:        number;
}

// ─── Listing Responses ────────────────────────────────────────────────────────

export interface ListingResponse {
  id:                  string;
  farmerId:            string;
  seller:              SellerSummaryDto;
  produce:             ProduceResponse;
  title:               string | null;
  description:         string | null;
  totalQuantity:       number;
  availableQuantity:   number;
  reservedQuantity:    number;
  unit:                string;
  pricePerUnit:        number;
  qualityGrade:        QualityGrade;
  harvestDate:         string;
  status:              ListingStatus;
  minOrderQuantity:    number | null;
  location:            ListingLocationDto;
  cancellationReason:  string | null;
  publishedAt:         string | null;
  cancelledAt:         string | null;
  images:              ListingImageResponse[];
  createdAt:           string;
  updatedAt:           string;
}

export interface ListingSummaryResponse {
  id:                string;
  farmerId:          string;
  produceName:       string;
  produceCode:       string;
  title:             string | null;
  availableQuantity: number;
  unit:              string;
  pricePerUnit:      number;
  qualityGrade:      QualityGrade;
  harvestDate:       string;
  status:            ListingStatus;
  locality:          string;
  district:          string | null;
  primaryImageUrl:   string | null;
}

export interface ValidationResultResponse {
  valid:    boolean;
  errors:   string[];
  warnings: string[];
}

export interface StockOperationResponse {
  listingId:                 string;
  reservedQuantity:          number;
  remainingAvailableQuantity: number;
  status:                    ListingStatus;
  success:                   boolean;
  message:                   string;
}

export interface PageResponse<T> {
  content:       T[];
  pageNumber:    number;
  pageSize:      number;
  totalElements: number;
  totalPages:    number;
  isFirst:       boolean;
  isLast:        boolean;
}

export interface MarketApiWrapper<T> {
  success:   boolean;
  message:   string;
  data:      T;
  timestamp: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

function generateRequestId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function normalizeError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: "An unexpected error occurred.",
    status:  error.response?.status ?? 0,
  };
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>;
    apiError.message = (data["message"] as string | undefined) ?? apiError.message;
  } else if (error.code === "ERR_NETWORK") {
    apiError.message = "Cannot reach the marketplace server.";
  }
  return apiError;
}

function createMarketClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers["X-Request-Id"] = generateRequestId();
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

export const marketClient = createMarketClient("/api/marketplace");

// ─── Produce API ──────────────────────────────────────────────────────────────

export const produceApi = {
  getAll: async (): Promise<ProduceResponse[]> => {
    const res = await marketClient.get<MarketApiWrapper<ProduceResponse[]>>("/v1/produce");
    return res.data.data;
  },
  getById: async (id: string): Promise<ProduceResponse> => {
    const res = await marketClient.get<MarketApiWrapper<ProduceResponse>>("/v1/produce/" + id);
    return res.data.data;
  },
  create: async (body: CreateProduceRequest): Promise<ProduceResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ProduceResponse>>("/v1/produce", body);
    return res.data.data;
  },
};

// ─── Listings API ─────────────────────────────────────────────────────────────

export const listingsApi = {
  create: async (body: CreateListingRequest): Promise<ListingResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ListingResponse>>("/v1/listings", body);
    return res.data.data;
  },
  getById: async (id: string): Promise<ListingResponse> => {
    const res = await marketClient.get<MarketApiWrapper<ListingResponse>>("/v1/listings/" + id);
    return res.data.data;
  },
  update: async (id: string, body: UpdateListingRequest): Promise<ListingResponse> => {
    const res = await marketClient.put<MarketApiWrapper<ListingResponse>>("/v1/listings/" + id, body);
    return res.data.data;
  },
  validate: async (id: string): Promise<ValidationResultResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ValidationResultResponse>>("/v1/listings/" + id + "/validate");
    return res.data.data;
  },
  publish: async (id: string): Promise<ListingResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ListingResponse>>("/v1/listings/" + id + "/publish");
    return res.data.data;
  },
  cancel: async (id: string, body?: CancelListingRequest): Promise<ListingResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ListingResponse>>("/v1/listings/" + id + "/cancel", body ?? {});
    return res.data.data;
  },
  getMyListings: async (status?: ListingStatus): Promise<ListingResponse[]> => {
    const params = status ? { status } : {};
    const res = await marketClient.get<MarketApiWrapper<ListingResponse[]>>("/v1/listings/farmer/me", { params });
    return res.data.data;
  },
  search: async (criteria: ListingSearchCriteria): Promise<PageResponse<ListingSummaryResponse>> => {
    const res = await marketClient.get<MarketApiWrapper<PageResponse<ListingSummaryResponse>>>("/v1/listings", { params: criteria });
    return res.data.data;
  },
  addImage: async (id: string, body: AddImageRequest): Promise<ListingImageResponse> => {
    const res = await marketClient.post<MarketApiWrapper<ListingImageResponse>>("/v1/listings/" + id + "/images", body);
    return res.data.data;
  },
  removeImage: async (listingId: string, imageId: string): Promise<void> => {
    await marketClient.delete("/v1/listings/" + listingId + "/images/" + imageId);
  },
  setPrimaryImage: async (listingId: string, imageId: string): Promise<void> => {
    await marketClient.patch("/v1/listings/" + listingId + "/images/" + imageId + "/primary");
  },
  reserveStock: async (id: string, body: ReserveStockRequest): Promise<StockOperationResponse> => {
    const res = await marketClient.post<MarketApiWrapper<StockOperationResponse>>("/v1/listings/" + id + "/reserve", body);
    return res.data.data;
  },
  releaseStock: async (id: string, body: ReserveStockRequest): Promise<StockOperationResponse> => {
    const res = await marketClient.post<MarketApiWrapper<StockOperationResponse>>("/v1/listings/" + id + "/release", body);
    return res.data.data;
  },
};
