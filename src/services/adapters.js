const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export const unwrapApiData = (data) => data?.data ?? data;

export const unwrapApiList = (data) => {
  const value = unwrapApiData(data);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
};

// Keep backend DTO-to-UI field conversion in one place. Components should use
// these UI-friendly keys rather than backend camelCase fields directly.
export const adaptApiVehicle = (
  vehicle,
  { categoryMaps, locationMap, imageData = {} },
) => ({
  id: vehicle.id,
  brand: vehicle.brand,
  model: vehicle.model,
  image: imageData.image || PLACEHOLDER_IMAGE,
  images: imageData.images?.length ? imageData.images : [],
  year: vehicle.modelYear,
  category: categoryMaps.nameMap[vehicle.categoryId] ?? "Uncategorized",
  categorySlug: categoryMaps.slugMap[vehicle.categoryId] ?? null,
  vehicle_type: categoryMaps.vehicleTypeMap[vehicle.categoryId] ?? null,
  categoryId: vehicle.categoryId,
  locationId: vehicle.locationId,
  seating_capacity: vehicle.seatingCapacity,
  fuel_type: vehicle.fuelType,
  transmission: vehicle.transmission,
  price_per_day: vehicle.pricePerDay,
  quantity: vehicle.quantity ?? 1,
  location: locationMap[vehicle.locationId] ?? "Unknown",
  description: vehicle.description,
  is_available: vehicle.isAvailable,
  engine_cc: vehicle.engineCc,
  fuel_efficiency: vehicle.fuelEfficiency,
  top_speed: vehicle.topSpeed,
  gears: vehicle.speeds,
  frame_material: vehicle.material,
  wheel_size: vehicle.wheelSize,
});
