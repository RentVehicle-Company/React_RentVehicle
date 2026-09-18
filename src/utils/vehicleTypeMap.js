// Vehicle type mapping between frontend (lowercase) and backend (uppercase enum)
// Spring Boot enum typically uses: CAR, MOTORBIKE, BICYCLE

export const VEHICLE_TYPE_MAP = {
  car: "CAR",
  motorbike: "MOTORBIKE",
  bicycle: "BICYCLE",
};

// Reverse mapping for display
export const VEHICLE_TYPE_REVERSE_MAP = {
  CAR: "car",
  MOTORBIKE: "motorbike",
  BICYCLE: "bicycle",
};

export const toBackendVehicleType = (frontendType) => {
  return VEHICLE_TYPE_MAP[frontendType?.toLowerCase()] || frontendType?.toUpperCase();
};

export const fromBackendVehicleType = (backendType) => {
  return VEHICLE_TYPE_REVERSE_MAP[backendType?.toUpperCase()] || backendType?.toLowerCase();
};

export const getVehicleTypeOptions = () => [
  { value: "car", label: "Car" },
  { value: "motorbike", label: "Motorbike" },
  { value: "bicycle", label: "Bicycle" },
];