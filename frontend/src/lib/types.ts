export type Gender = "m" | "f";
export type SortField = "firstName" | "lastName" | "age" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: Gender;
  phoneNumber?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsersResponse { data: User[]; pagination: Pagination; }

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: Gender;
  phoneNumber?: string;
  city?: string;
  country?: string;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UsersQuery {
  age?: number;
  ageFrom?: number;
  ageTo?: number;
  gender?: Gender;
  name?: string;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  order?: SortOrder;
}
