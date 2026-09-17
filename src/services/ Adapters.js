// vehicleServices.js

const buildLookupMap = (list, valueKey = "name") =>
  Object.fromEntries(list.map((item) => [item.id, item[valueKey]]));

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

const adaptApiVehicle = (v, categoryMaps, locationMap) => ({
  id: v.id,
  brand: v.brand,
  model: v.model,
  image: v.imageUrl || PLACEHOLDER_IMAGE,   // ✅ fallback ដោយសារគ្មាន field នេះ
  images: v.imageUrls || [],
  year: v.modelYear,
  category: categoryMaps.nameMap[v.categoryId] ?? "Uncategorized",
  categorySlug: categoryMaps.slugMap[v.categoryId] ?? null,
  categoryId: v.categoryId,
  seating_capacity: v.seatingCapacity,
  fuel_type: v.fuelType,
  transmission: v.transmission,
  price_per_day: v.pricePerDay,
  location: locationMap[v.locationId] ?? "Unknown",
  description: v.description,
  is_available: v.isAvailable,
  engine_cc: v.engineCc,
  fuel_efficiency: v.fuelEfficiency,
  top_speed: v.topSpeed,
  gears: v.speeds,
  frame_material: v.material,
  wheel_size: v.wheelSize,
});

export const getVehicles = async () => {
  try {
    const [vehicleData, categoryData, locationData] = await Promise.all([
      request(API_ENDPOINTS.vehicles),
      request(API_ENDPOINTS.categories),
      request(API_ENDPOINTS.locations),
    ]);

    if (!vehicleData) throw new Error("Backend offline");

    const categoryMap = buildLookupMap(unwrapList(categoryData), "name");
    const locationMap = buildLookupMap(unwrapList(locationData), "city");

    const adapted = unwrapList(vehicleData).map((v) =>
      adaptApiVehicle(v, categoryMap, locationMap)
    );

    return adapted.map(enrichVehicle);
  } catch {
    await delay(400);
    return mockVehicles.map((car) => ({ ...car }));
  }
};