// Vehicle type mapping between the frontend labels and the backend values.
// The product/category APIs use "moto" for motorbikes.

export const VEHICLE_TYPE_MAP = {
  car: "car",
  moto: "moto",
  motorbike: "moto",
  bicycle: "bicycle",
};

// Reverse mapping for display
export const VEHICLE_TYPE_REVERSE_MAP = {
  CAR: "car",
  MOTO: "motorbike",
  MOTORBIKE: "motorbike",
  BICYCLE: "bicycle",
  car: "car",
  moto: "motorbike",
  motorbike: "motorbike",
  bicycle: "bicycle",
};

export const toBackendVehicleType = (frontendType) => {
  return (
    VEHICLE_TYPE_MAP[frontendType?.toLowerCase()] || frontendType?.toUpperCase()
  );
};

export const fromBackendVehicleType = (backendType) => {
  return (
    VEHICLE_TYPE_REVERSE_MAP[backendType?.toUpperCase()] ||
    backendType?.toLowerCase()
  );
};

export const getVehicleTypeOptions = () => [
  { value: "car", label: "Car" },
  { value: "motorbike", label: "Motorbike" },
  { value: "bicycle", label: "Bicycle" },
];
