import { API_ENDPOINTS, request } from "./api.js";

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const unwrapResponse = (response) => response?.data ?? response;

export const getLocations = async () => {
  const response = await request(`${API_ENDPOINTS.locations}?size=200`);
  if (!response) throw new Error("Failed to load locations.");
  return unwrapList(response);
};

export const createLocation = async (locationData) => {
  const response = await request(API_ENDPOINTS.locations, {
    method: "POST",
    body: JSON.stringify(locationData),
  });
  if (!response) throw new Error("Failed to create location.");
  return unwrapResponse(response);
};

export const updateLocation = async (id, locationData) => {
  const response = await request(`${API_ENDPOINTS.locations}/${id}`, {
    method: "PUT",
    body: JSON.stringify(locationData),
  });
  if (!response) throw new Error("Failed to update location.");
  return unwrapResponse(response);
};

export const deleteLocation = async (id) => {
  const response = await request(`${API_ENDPOINTS.locations}/${id}`, {
    method: "DELETE",
    noContentValue: true,
  });
  if (!response) throw new Error("Failed to delete location.");
  return response;
};
