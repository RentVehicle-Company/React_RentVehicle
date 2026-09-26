import { API_ENDPOINTS, request } from "./api.js";

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const unwrapResponse = (response) => response?.data ?? response;

export const getCategories = async () => {
  const response = await request(`${API_ENDPOINTS.categories}?size=200`);
  if (!response) throw new Error("Failed to load categories.");
  return unwrapList(response);
};

export const createCategory = async (categoryData) => {
  const response = await request(API_ENDPOINTS.categories, {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
  if (!response) throw new Error("Failed to create category.");
  return unwrapResponse(response);
};

export const updateCategory = async (id, categoryData) => {
  const response = await request(`${API_ENDPOINTS.categories}/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
  if (!response) throw new Error("Failed to update category.");
  return unwrapResponse(response);
};

export const deleteCategory = async (id) => {
  const response = await request(`${API_ENDPOINTS.categories}/${id}`, {
    method: "DELETE",
    noContentValue: true,
  });
  if (!response) throw new Error("Failed to delete category.");
  return response;
};
