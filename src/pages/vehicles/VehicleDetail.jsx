import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LuArrowLeft,
  LuArrowRight,
  LuBaby,
  LuBike,
  LuCalendarCheck,
  LuCalendarDays,
  LuCamera,
  LuCheck,
  LuChevronDown,
  LuCircleDot,
  LuCog,
  LuCompass,
  LuFuel,
  LuGauge,
  LuIdCard,
  LuInfo,
  LuLayers,
  LuLoader,
  LuMapPin,
  LuPause,
  LuPenLine,
  LuPlay,
  LuQrCode,
  LuRotateCcw,
  LuSettings2,
  LuShieldCheck,
  LuStar,
  LuTimer,
  LuTruck,
  LuUpload,
  LuUserPlus,
  LuUsers,
  LuX,
  LuZap,
} from "react-icons/lu";
import {
  ALL_MOCK_VEHICLES,
  getVehicleById,
  getProductImages,
  isBicycle,
  isMotorbike,
} from "../../services/vehicleServices";
import { CAMBODIA_LOCATIONS } from "../../assets/assets";
import { usePreferences } from "../../context/PreferencesContext";
import { useAuth } from "../../context/AuthContext";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import { createBookingRequest } from "../../services/bookingService";
import { getCurrentUserId } from "../../services/authServices";
import { getCachedUser } from "../../services/userService";

const inputClass =
  "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass =
  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

const ADDONS = [
  { key: "insurance", label: "Full Comprehensive Insurance", rate: 15 },
  { key: "driver", label: "Additional Driver", rate: 10 },
  { key: "seat", label: "Child Safety Seat", rate: 5 },
];

const REVIEWS = [
  {
    id: "seed_0",
    name: "Sokha Chea",
    date: "3 days ago",
    rating: 5,
    text: "The car was spotless and ready on time. Pickup at the airport took under 10 minutes — highly recommend.",
    initials: "SC",
    color: "bg-blue-500",
  },
  {
    id: "seed_1",
    name: "James Miller",
    date: "1 week ago",
    rating: 5,
    text: "Smooth booking and great condition throughout the rental. Roadside assistance gave quick help when I called.",
    initials: "JM",
    color: "bg-indigo-500",
  },
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
];

const getInitials = (name) => {
  const initials = String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "R";
};

const RATING_BARS = [
  { label: "Cleanliness", value: 5.0 },
  { label: "Vehicle Condition", value: 4.9 },
  { label: "Pickup Smoothness", value: 4.8 },
];

const CITY_COORDS = {
  "Phnom Penh": [11.5564, 104.9282],
  "Banteay Meanchey": [13.7531, 103.0884],
  Battambang: [13.0957, 103.2022],
  "Kampong Cham": [11.9924, 105.4643],
  "Kampong Chhnang": [12.25, 104.6667],
  "Kampong Speu": [11.6154, 104.8929],
  "Kampong Thom": [12.7064, 104.8883],
  Kampot: [10.6104, 104.1815],
  Kandal: [11.4833, 105.0333],
  Kep: [10.5363, 104.3175],
  "Koh Kong": [11.6155, 102.9817],
  Kratié: [12.4881, 106.0187],
  Mondulkiri: [12.784, 107.0265],
  "Oddar Meanchey": [14.181, 103.5172],
  Pailin: [12.8474, 102.6089],
  "Preah Sihanouk": [10.6253, 103.5234],
  Sihanoukville: [10.6093, 103.5296],
  "Preah Vihear": [13.8179, 104.9718],
  "Prey Veng": [11.4868, 105.3253],
  Pursat: [12.5383, 103.9256],
  Ratanakiri: [13.7292, 106.9872],
  "Siem Reap": [13.3671, 103.8446],
  "Stung Treng": [13.5241, 105.9683],
  "Svay Rieng": [11.0875, 105.8162],
  Takéo: [10.983, 104.7843],
  "Tboung Khmum": [11.7579, 105.9386],
};

// Builds a small gallery from a vehicle's own primary image by varying the
// Unsplash crop settings, so the detail view can never show a different car.
const buildGallery = (primary) => {
  if (!primary) return [];
  const gallery = [primary];
  if (primary.includes("unsplash.com")) {
    const base = primary.split("?")[0];
    const crops = [
      { fit: "crop", crop: "faces", w: 800, h: 600, q: 80 },
      { fit: "crop", crop: "entropy", w: 900, h: 500, q: 80 },
      { fit: "crop", w: 1000, h: 400, q: 80 },
      { fit: "crop", crop: "faces", w: 600, h: 800, q: 80 },
    ];
    for (let i = 0; i < crops.length; i++) {
      const p = new URLSearchParams(
        Object.entries(crops[i]).map(([k, v]) => [k, String(v)]),
      );
      p.set("auto", "format");
      gallery.push(`${base}?${p.toString()}`);
    }
  }
  return gallery.slice(0, 6);
};

// Derived performance profile per body-category. The mock fleet has no engine
// figures, so we stamp believable specs onto each vehicle deterministically.
const ENGINE_PROFILES = {
  "Sports Car": {
    engine: "3.0L Twin-Turbo Inline-6",
    topSpeed: 290,
    acceleration: 4.3,
    horsepower: 430,
    drive: "RWD",
  },
  Supercar: {
    engine: "5.2L Naturally Aspirated V10",
    topSpeed: 335,
    acceleration: 3.2,
    horsepower: 570,
    drive: "AWD",
  },
  "Luxury SUV": {
    engine: "4.0L Twin-Turbo V8",
    topSpeed: 260,
    acceleration: 5.6,
    horsepower: 550,
    drive: "AWD",
  },
  SUV: {
    engine: "2.0L Turbocharged I4",
    topSpeed: 215,
    acceleration: 7.4,
    horsepower: 248,
    drive: "AWD",
  },
  Sedan: {
    engine: "2.5L Naturally Aspirated I4",
    topSpeed: 205,
    acceleration: 9.2,
    horsepower: 184,
    drive: "FWD",
  },
  Hatchback: {
    engine: "1.2L Inline-3",
    topSpeed: 175,
    acceleration: 10.6,
    horsepower: 84,
    drive: "FWD",
  },
  Electric: {
    engine: "Dual-Motor Electric AWD",
    topSpeed: 230,
    acceleration: 5.5,
    horsepower: 455,
    drive: "AWD",
  },
  Truck: {
    engine: "3.5L EcoBoost V6",
    topSpeed: 185,
    acceleration: 8.2,
    horsepower: 325,
    drive: "4WD",
  },
};

const FEATURE_POOL = [
  "Bluetooth Audio",
  "GPS Navigation",
  "Leather Seats",
  "Cruise Control",
  "Reverse Camera",
  "Apple CarPlay",
  "Keyless Entry",
  "Heated Seats",
  "Sunroof",
  "360° Parking Sensors",
  "Adaptive Cruise Control",
  "Wireless Charging",
];

const DELIVERY_FEES = {
  Supercar: 20,
  Truck: 20,
  "Luxury SUV": 15,
  "Sports Car": 15,
  SUV: 12,
  Electric: 12,
  Sedan: 10,
  Hatchback: 8,
  Motorcycle: 8,
  Bicycle: 5,
};

const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const deriveSpecs = (vehicle) => {
  const profile = ENGINE_PROFILES[vehicle.category] ?? ENGINE_PROFILES.Sedan;
  const offset = (vehicle.id % 5) - 2;
  return {
    engine: profile.engine,
    topSpeed: profile.topSpeed + offset * 8,
    acceleration: Math.max(
      2.5,
      Math.round((profile.acceleration + offset * 0.12) * 10) / 10,
    ),
    horsepower: profile.horsepower + offset * 14,
    drive: profile.drive,
  };
};

const deriveFeatures = (vehicle, count = 7) => {
  const start = vehicle.id % FEATURE_POOL.length;
  const rotated = [
    ...FEATURE_POOL.slice(start),
    ...FEATURE_POOL.slice(0, start),
  ];
  return rotated.slice(0, count);
};

const buildDescription = (vehicle, derived, features) => {
  if (!vehicle || !derived) return "";
  const primary = (features && features.slice(0, 3)) || [];
  const list = primary.map((f) => f.toLowerCase()).join(", ");
  const name = `${vehicle.brand} ${vehicle.model}`;
  if (isBicycle(vehicle)) {
    return `The ${name} is a ${(vehicle.category || "bike").toLowerCase()} built for effortless rides around ${vehicle.location} — a ${derived.frame ?? "durable"} frame, ${derived.gears ?? "smooth"} gearing and a ${derived.topSpeed ?? 18} km/h top speed make it the perfect companion for quick errands and full-day explorations alike.${list ? ` Expect ${list} across every ride.` : ""}`;
  }
  if (isMotorbike(vehicle)) {
    return `The ${name} is a ${(vehicle.category || "motorcycle").toLowerCase()} that channels ${derived.horsepower ?? 15} hp from its ${derived.displacementCc ?? 125}cc engine, returning roughly ${derived.fuelEfficiency ?? 45} km/l while topping out near ${derived.topSpeed ?? 110} km/h. Light, nimble and ready for ${vehicle.location} traffic, it pairs everyday practicality with real riding fun.${list ? ` Gear up with ${list} included.` : ""}`;
  }
  return `The ${name} is a ${vehicle.year ?? 2024} ${(vehicle.category || "vehicle").toLowerCase()} that delivers a genuinely memorable drive. A ${derived.engine ?? "high-torque"} engine channels ${derived.horsepower ?? 200} hp through a ${(derived.drive ?? "responsive").toLowerCase()} drivetrain, sprinting to ${derived.topSpeed ?? 220} km/h while staying planted and composed. With seats for ${vehicle.seating_capacity ?? 4}${list ? `, kitchen-sink comforts like ${list}` : ""} and 24/7 support on call, it is as effortless to live with as it is thrilling to drive.`;
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { formatPrice, formatAmount } = usePreferences();
  const { isAuthenticated, user, openAuth } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [viewMode, setViewMode] = useState("photo");
  const [activeImg, setActiveImg] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [deliveryCity, setDeliveryCity] = useState("Phnom Penh");
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [addOns, setAddOns] = useState({
    insurance: false,
    driver: false,
    seat: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("khqr");
  const [reviews, setReviews] = useState(REVIEWS);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const bookingRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError(null);
    setVehicle(null);
    setProductImages([]);
    setViewMode("photo");
    setActiveImg(0);
    setFrameIndex(0);
    setPickupDate(searchParams.get("pickup") || "");
    setReturnDate(searchParams.get("return") || "");
    setPickupLocation(searchParams.get("location") || "");
    setContactPhone(user?.phone || getCachedUser().phone || "");
    setDeliveryMethod("pickup");
    setDeliveryCity("Phnom Penh");
    setDeliveryDistrict("");
    setDeliveryAddress("");
    setIdDocument(null);
    setLicenseDocument(null);
    setAddOns({ insurance: false, driver: false, seat: false });
    setPaymentMethod("khqr");
    setReviews(REVIEWS);
    setReviewOpen(false);
    setReviewRating(0);
    setReviewHover(0);
    setReviewText("");
    setShowStickyBar(false);
    setBookingError("");
    setBookingSubmitting(false);
    getVehicleById(id)
      .then(async (data) => {
        setVehicle(data);
        setLoading(false);
        if (data?.id) {
          const images = await getProductImages(data.id);
          if (images.length) setProductImages(images);
        }
      })
      .catch(() => {
        const fallback = ALL_MOCK_VEHICLES.find(
          (vehicle) => String(vehicle.id) === String(id),
        );
        if (fallback) {
          setVehicle({ ...fallback });
        } else {
          setError("Vehicle not found.");
        }
        setLoading(false);
      });
  }, [id, searchParams]);

  const images = useMemo(() => {
    if (!vehicle) return [];
    if (productImages.length) return productImages;
    if (vehicle.images?.length) return vehicle.images;
    return buildGallery(vehicle.image);
  }, [vehicle, productImages]);

  const derived = useMemo(
    () => (vehicle ? (vehicle.specs ?? deriveSpecs(vehicle)) : null),
    [vehicle],
  );
  const features = useMemo(
    () => (vehicle ? (vehicle.features ?? deriveFeatures(vehicle)) : []),
    [vehicle],
  );

  useEffect(() => {
    if (viewMode !== "360" || !spinning) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % images.length);
    }, 400);
    return () => clearInterval(timer);
  }, [viewMode, spinning, images.length]);

  const lat =
    vehicle?.latitude ??
    CITY_COORDS[vehicle?.location]?.[0] ??
    CITY_COORDS["Phnom Penh"][0];
  const lon =
    vehicle?.longitude ??
    CITY_COORDS[vehicle?.location]?.[1] ??
    CITY_COORDS["Phnom Penh"][1];
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;

  const pickupMs = pickupDate
    ? new Date(`${pickupDate}T00:00:00`).getTime()
    : 0;
  const returnMs = returnDate
    ? new Date(`${returnDate}T00:00:00`).getTime()
    : 0;
  const hasValidDates = Boolean(
    pickupDate && returnDate && returnMs >= pickupMs,
  );
  const days = hasValidDates
    ? Math.max(1, Math.round((returnMs - pickupMs) / 86400000))
    : 1;
  const rentalFee = vehicle ? vehicle.price_per_day * days : 0;
  const serviceFee = 0;
  const activeAddOns = ADDONS.filter((addon) => addOns[addon.key]);
  const addOnTotal = activeAddOns.reduce(
    (sum, addon) => sum + addon.rate * days,
    0,
  );
  const usingDelivery = deliveryMethod === "delivery";
  const deliveryFee = vehicle
    ? usingDelivery
      ? (DELIVERY_FEES[vehicle.category] ?? 10) * days
      : 0
    : 0;
  const deliverySummary = usingDelivery
    ? [deliveryDistrict, deliveryCity, deliveryAddress]
        .filter(Boolean)
        .join(", ")
    : "";
  const totalPrice = rentalFee + serviceFee + addOnTotal + deliveryFee;

  const reviewCount = reviews.length;
  const reviewAverage = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  const toggleAddOn = (key) =>
    setAddOns((prev) => ({ ...prev, [key]: !prev[key] }));

  const documentPreviewUrls = useMemo(
    () => ({
      id: idDocument?.type.startsWith("image/")
        ? URL.createObjectURL(idDocument)
        : null,
      license: licenseDocument?.type.startsWith("image/")
        ? URL.createObjectURL(licenseDocument)
        : null,
    }),
    [idDocument, licenseDocument],
  );

  useEffect(() => {
    return () => {
      Object.values(documentPreviewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [documentPreviewUrls]);

  const submitReview = () => {
    if (!user || reviewRating < 1) return;
    const name = (user.name || "Guest Renter").trim();
    setReviews((prev) => [
      {
        id: `r_${Date.now().toString(36)}`,
        name,
        date: "Just now",
        rating: reviewRating,
        text: reviewText.trim() || "Shared by this renter.",
        initials: getInitials(name),
        color: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
      },
      ...prev,
    ]);
    setReviewOpen(false);
    setReviewRating(0);
    setReviewHover(0);
    setReviewText("");
  };

  const similarVehicles = useMemo(() => {
    if (!vehicle) return [];
    const inCategory = ALL_MOCK_VEHICLES.filter(
      (item) =>
        String(item.id) !== String(vehicle.id) &&
        item.category === vehicle.category,
    );
    if (inCategory.length >= 3) return inCategory.slice(0, 3);
    const others = ALL_MOCK_VEHICLES.filter(
      (item) =>
        String(item.id) !== String(vehicle.id) &&
        item.category !== vehicle.category,
    );
    return [...inCategory, ...others].slice(0, 3);
  }, [vehicle]);

  useEffect(() => {
    const widget = bookingRef.current;
    if (!widget) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "0px 0px -15% 0px", threshold: 0 },
    );
    observer.observe(widget);
    return () => observer.disconnect();
  }, [vehicle]);

  const handleBook = async () => {
    if (!vehicle || !hasValidDates || bookingSubmitting) return;
    setBookingError("");
    if (!isAuthenticated) {
      openAuth("login");
      return;
    }
    if (!idDocument) {
      setBookingError("Please upload your ID card to continue.");
      return;
    }
    if (!contactPhone.trim()) {
      setBookingError("Please enter a contact phone number to continue.");
      return;
    }

    setBookingSubmitting(true);

    const baseBooking = {
      productId: vehicle.id,
      vehicleName: `${vehicle?.brand || "Vehicle"} ${vehicle?.model || ""}`,
      image: productImages[0] || vehicle?.image,
      startDate: formatDate(pickupDate),
      endDate: formatDate(returnDate),
      pickupDate: formatDate(pickupDate),
      returnDate: formatDate(returnDate),
      pickupLocation: usingDelivery
        ? deliverySummary
        : pickupLocation || vehicle?.location || "Unknown",
      deliveryMethod: usingDelivery ? "delivery" : "pickup",
      deliveryFee,
      deliveryCity: usingDelivery ? deliveryCity : null,
      deliveryDistrict: usingDelivery ? deliveryDistrict || null : null,
      deliveryAddress: usingDelivery ? deliveryAddress || null : null,
      pricePerDay: vehicle?.price_per_day || 0,
      rentalFee,
      serviceFee,
      addOns: activeAddOns.map((addon) => ({
        label: addon.label,
        rate: addon.rate,
        total: addon.rate * days,
      })),
      addOnTotal,
      totalPrice,
      duration: days,
      transmission: vehicle?.transmission,
      seating_capacity: vehicle?.seating_capacity,
      fuel_type: vehicle?.fuel_type,
      status: "confirmed",
      paymentStatus: "UNPAID",
      paymentMethod,
    };

    // Persist the booking on the backend (POST /api/bookings, multipart with
    // the uploaded ID card and driving license photos).
    let persisted = { ...baseBooking, backendBookingId: null };
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("You must be logged in to create a booking.");
      }
      const created = await createBookingRequest({
        productId: vehicle.id,
        userId,
        pickupDate,
        returnDate,
        contactPhone: contactPhone.trim(),
        notes: `${vehicle.brand} ${vehicle.model}`,
        idCardImage: idDocument,
        drivingLicenseImage: licenseDocument,
      });
      if (created.local) {
        persisted = { ...baseBooking, backendBookingId: null, local: true };
      } else {
        persisted = {
          ...baseBooking,
          id: created.id,
          backendBookingId: created.id,
          totalPrice: Number(created.totalAmount) || totalPrice,
          status: String(created.status || "confirmed").toLowerCase(),
        };
      }
    } catch (error) {
      setBookingSubmitting(false);
      setBookingError(
        error.message || "Booking could not be confirmed. Please try again.",
      );
      return;
    }

    navigate("/checkout", {
      state: {
        booking: persisted,
        method: paymentMethod,
        from: `/vehicles/${vehicle?.id}`,
      },
    });
  };

  if (loading || !vehicle) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-sm text-slate-500 dark:text-slate-400">
        Loading {`vehicle${id ? ` #${id}` : ""}`}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to={`/cars${location.search}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <LuArrowLeft size={18} />
          Back to Cars
        </Link>
        <div className="mt-6 bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {error || "Vehicle not found."}
        </div>
      </div>
    );
  }

  const specItems = !derived
    ? []
    : isBicycle(vehicle)
      ? [
          {
            icon: LuLayers,
            label: "Frame",
            value: derived.frame ?? vehicle.frame_material ?? "Aluminum",
          },
          {
            icon: LuSettings2,
            label: "Gears",
            value: derived.gears ?? vehicle.gears ?? "Single-Speed",
          },
          {
            icon: LuBike,
            label: "Type",
            value: derived.driveType ?? vehicle.fuel_type ?? "Manual",
          },
          {
            icon: LuCircleDot,
            label: "Wheel Size",
            value: derived.wheelSize ?? vehicle.wheel_size ?? "26 inch",
          },
          {
            icon: LuFuel,
            label: "Propulsion",
            value: vehicle.fuel_type ?? "Manual",
          },
          {
            icon: LuGauge,
            label: "Top Speed",
            value: `${derived.topSpeed ?? 18} km/h`,
          },
          {
            icon: LuUsers,
            label: "Seats",
            value: `${vehicle.seating_capacity ?? 1} Rider`,
          },
          {
            icon: LuMapPin,
            label: "Location",
            value: vehicle.location,
          },
        ]
      : isMotorbike(vehicle)
        ? [
            {
              icon: LuCog,
              label: "Engine",
              value: `${derived.displacementCc ?? vehicle.engine_cc ?? 125} cc`,
            },
            {
              icon: LuSettings2,
              label: "Transmission",
              value:
                derived.transmission ?? vehicle.transmission ?? "Automatic",
            },
            {
              icon: LuGauge,
              label: "Top Speed",
              value: `${derived.topSpeed ?? vehicle.top_speed ?? 110} km/h`,
            },
            {
              icon: LuFuel,
              label: "Fuel Efficiency",
              value: `${derived.fuelEfficiency ?? vehicle.fuel_efficiency ?? 45} km/l`,
            },
            {
              icon: LuZap,
              label: "Horsepower",
              value: `${derived.horsepower ?? 15} HP`,
            },
            {
              icon: LuCompass,
              label: "Drivetrain",
              value: derived.drive ?? "CVT",
            },
            {
              icon: LuUsers,
              label: "Seats",
              value: `${vehicle.seating_capacity ?? 2} Riders`,
            },
            {
              icon: LuMapPin,
              label: "Location",
              value: vehicle.location,
            },
          ]
        : [
            { icon: LuCog, label: "Engine", value: derived.engine },
            {
              icon: LuGauge,
              label: "Top Speed",
              value: `${derived.topSpeed} km/h`,
            },
            {
              icon: LuTimer,
              label: "0-100 km/h",
              value: `${derived.acceleration} s`,
            },
            {
              icon: LuZap,
              label: "Horsepower",
              value: `${derived.horsepower} HP`,
            },
            { icon: LuCompass, label: "Drivetrain", value: derived.drive },
            { icon: LuFuel, label: "Fuel Type", value: vehicle.fuel_type },
            {
              icon: LuUsers,
              label: "Seats",
              value: `${vehicle.seating_capacity} Passengers`,
            },
            { icon: LuMapPin, label: "Location", value: vehicle.location },
          ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to={`/cars${location.search}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <LuArrowLeft size={18} />
        Back to Cars
      </Link>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {vehicle?.category || "Vehicle"}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          {vehicle?.brand || "Unknown"} {vehicle?.model || "Model"}
        </h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <LuMapPin size={14} className="text-primary" />
            {vehicle?.location || "Unknown location"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LuCalendarDays size={14} className="text-primary" />
            Year {vehicle?.year || "N/A"}
          </span>
        </p>
      </div>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)] gap-5">
        <div className="contents lg:block lg:min-w-0 lg:space-y-5">
          {/* Gallery / 360 viewer */}
          <section className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative bg-slate-900">
              {viewMode === "photo" ? (
                <div className="group relative h-72 overflow-hidden sm:h-[480px] md:h-[520px]">
                  <img
                    src={images[activeImg]}
                    alt={`${vehicle?.brand || "Vehicle"} ${vehicle?.model || ""}`}
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="relative flex h-72 sm:h-[480px] md:h-[520px] w-full items-center justify-center overflow-hidden">
                  <img
                    src={images[frameIndex]}
                    alt=""
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFrameIndex(
                            (prev) =>
                              (prev - 1 + images.length) % images.length,
                          )
                        }
                        aria-label="Previous frame"
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        <LuRotateCcw size={16} />
                      </button>
                      <button
                        type="button"
                        aria-pressed={spinning}
                        onClick={() => setSpinning((on) => !on)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        {spinning ? (
                          <LuPause size={13} />
                        ) : (
                          <LuPlay size={13} />
                        )}
                        {spinning ? "Auto" : "Play"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFrameIndex((prev) => (prev + 1) % images.length)
                        }
                        aria-label="Next frame"
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
                      >
                        <LuRotateCcw size={16} className="rotate-180" />
                      </button>
                    </div>
                    <span className="mt-2 text-[11px] text-white/70">
                      360° View · Frame {frameIndex + 1}/{images.length}
                    </span>
                  </div>
                </div>
              )}

              {vehicle.is_available && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-white" />
                  Available Now
                </span>
              )}

              <div className="absolute bottom-3 left-4 flex gap-1.5">
                {[
                  { key: "photo", label: "Photo", icon: LuCamera },
                  { key: "360", label: "360° View" },
                ].map((tab) => {
                  const isActive = viewMode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setViewMode(tab.key)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                        isActive
                          ? "bg-white text-slate-900 dark:text-slate-100"
                          : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      {tab.icon && <tab.icon size={13} />}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {viewMode === "photo" && (
              <div className="flex items-center justify-center gap-2.5 overflow-x-auto p-4">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    aria-label={`Photo ${index + 1}`}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                      index === activeImg
                        ? "border-primary"
                        : "border-transparent hover:border-borderColor dark:border-slate-700"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle?.brand || "Vehicle"} ${vehicle?.model || ""} photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Description */}
          <section className="max-lg:order-6 bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Description
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {vehicle?.description || "No description available."}
            </p>
            <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-500/30 bg-gradient-to-br from-blue-50/70 dark:from-blue-500/10 via-slate-50 dark:via-slate-800 to-indigo-50/60 dark:to-indigo-500/10 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <LuZap size={13} className="text-primary" />
                The {vehicle?.brand || "Vehicle"} {vehicle?.model || ""}{" "}
                experience
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {buildDescription(vehicle, derived, features)}
              </p>
            </div>
          </section>

          {/* Full specs */}
          <section className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Full Specifications
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specItems.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="group rounded-2xl bg-gradient-to-br from-blue-500/40 via-slate-200/50 dark:via-slate-600/40 to-indigo-500/40 p-px shadow-sm transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-primary/10"
                >
                  <div className="flex h-full flex-col items-center rounded-[15px] bg-white dark:bg-slate-800 p-3 text-center">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                      <Icon size={17} />
                    </span>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features checklist */}
          <section className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Features &amp; Amenities
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="group rounded-xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 p-px"
                >
                  <div className="flex w-full items-center gap-2 rounded-[11px] bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 transition-colors duration-200 group-hover:bg-slate-50 dark:hover:bg-slate-700">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-125">
                      <LuCheck size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rental requirements */}
          <section className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Rental Requirements
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Essentials you'll need to pick up this{" "}
              {vehicle?.category?.toLowerCase() || "vehicle"} in{" "}
              {vehicle?.location || "unknown location"}.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="group rounded-2xl bg-gradient-to-br from-blue-500/50 via-slate-400/40 to-indigo-500/50 p-px shadow-sm transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-primary/10">
                <div className="flex h-full flex-col rounded-[15px] bg-white/70 dark:bg-slate-800/80 p-4 backdrop-blur-md transition-colors duration-200 group-hover:bg-white/85 dark:group-hover:bg-slate-800/90">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
                    <LuIdCard size={18} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                    Valid ID Required
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Government-issued identification or passport.
                  </p>
                </div>
              </div>
              <div className="group rounded-2xl bg-gradient-to-br from-emerald-500/50 via-slate-400/40 to-teal-500/50 p-px shadow-sm transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                <div className="flex h-full flex-col rounded-[15px] bg-white/70 dark:bg-slate-800/80 p-4 backdrop-blur-md transition-colors duration-200 group-hover:bg-white/85 dark:group-hover:bg-slate-800/90">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <LuShieldCheck size={18} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                    Security Deposit
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    A refundable deposit of{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      $200.00
                    </span>{" "}
                    is required.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pickup location */}
          <section className="bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Location
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pickup location
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <LuMapPin size={15} className="text-primary" />
              {vehicle?.location || "Unknown location"}
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-borderColor dark:border-slate-700 bg-slate-100 dark:bg-slate-700/60">
              <iframe
                title={`Map showing ${vehicle?.location || "Vehicle location"}`}
                src={mapUrl}
                className="h-[240px] w-full border-0"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {vehicle?.location || "Unknown"} | Lat: {lat.toFixed(4)}, Long:{" "}
              {lon.toFixed(4)}
            </p>
          </section>

          {similarVehicles.length > 0 && (
            <section className="max-lg:order-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Similar Vehicles You Might Like
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                More {vehicle?.category?.toLowerCase() || "vehicle"} options
                near {vehicle?.location || "unknown location"}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {similarVehicles.map((similar) => (
                  <article
                    key={similar.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                  >
                    <div className="h-32 overflow-hidden">
                      <img
                        src={similar.image}
                        alt={`${similar.brand} ${similar.model}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {similar.brand} {similar.model}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {similar.category} · {similar.location}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(similar.price_per_day)}
                          <span className="text-xs font-normal text-slate-400">
                            /day
                          </span>
                        </p>
                        <Link
                          to={`/vehicles/${similar.id}${location.search}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary"
                        >
                          View Details
                          <LuArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking widget */}
        <aside
          id="booking-widget"
          className="contents lg:sticky lg:top-6 lg:block lg:space-y-4 lg:self-start"
        >
          <section
            ref={bookingRef}
            className="max-lg:order-7 bg-white dark:bg-slate-800 border border-borderColor dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm"
          >
            <div className="relative -mx-4 -mt-4 overflow-hidden rounded-t-2xl bg-slate-900 px-5 py-4 sm:-mx-5 sm:-mt-5 sm:px-6">
              <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-blue-600/30 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-8 h-28 w-28 rounded-full bg-indigo-500/25 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                    Reserve Your Ride
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-white">
                    Reserve Vehicle
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-300 dark:text-slate-500">
                    {vehicle?.brand || "Vehicle"} {vehicle?.model || ""}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  <LuZap size={11} strokeWidth={2.5} />
                  Instant Confirmation
                </span>
              </div>
              <div className="relative mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                <p className="text-xl font-extrabold text-white">
                  {formatPrice(vehicle?.price_per_day || 0)}
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    /day
                  </span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <LuShieldCheck size={13} className="text-emerald-400" />
                  Free cancellation · 24h
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-3.5">
              <div>
                <label htmlFor="detail-location" className={labelClass}>
                  {usingDelivery ? "Drop-off City" : "Pickup Location"}
                </label>
                <div className="relative">
                  <LuMapPin
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    id="detail-location"
                    value={pickupLocation || vehicle?.location || ""}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className={`${inputClass} appearance-none pl-10 pr-9 cursor-pointer`}
                  >
                    {[vehicle?.location, pickupLocation, ...CAMBODIA_LOCATIONS]
                      .filter(Boolean)
                      .filter((city, index, all) => all.indexOf(city) === index)
                      .map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                  <LuChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="detail-pickup" className={labelClass}>
                  Pick-up Date
                </label>
                <CustomDatePicker
                  id="detail-pickup"
                  value={pickupDate}
                  min={today}
                  onChange={setPickupDate}
                  placeholder="Select pick-up date"
                />
              </div>
              <div>
                <label htmlFor="detail-return" className={labelClass}>
                  Return Date
                </label>
                <CustomDatePicker
                  id="detail-return"
                  value={returnDate}
                  min={pickupDate || today}
                  onChange={setReturnDate}
                  placeholder="Select return date"
                />
              </div>

              <div>
                <label htmlFor="detail-contact-phone" className={labelClass}>
                  Contact Phone
                </label>
                <input
                  id="detail-contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="e.g. 012 345 678"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Verification Documents
                </p>
                <div className="mt-2 space-y-2.5">
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <LuIdCard size={13} className="text-primary" />
                      ID Card
                    </div>
                    <div
                      className={`${inputClass} mt-1.5 flex items-center gap-2 text-xs ${
                        idDocument
                          ? "ring-2 ring-emerald-400/30 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-400"
                      }`}
                    >
                      {documentPreviewUrls.id ? (
                        <img
                          src={documentPreviewUrls.id}
                          alt="ID document preview"
                          className="h-6 w-6 shrink-0 rounded object-cover"
                        />
                      ) : idDocument ? (
                        <LuCheck
                          size={14}
                          className="shrink-0 text-emerald-500"
                        />
                      ) : (
                        <LuUpload size={14} className="shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {idDocument ? idDocument.name : "Upload document"}
                      </span>
                      {idDocument ? (
                        <button
                          type="button"
                          onClick={() => setIdDocument(null)}
                          className="shrink-0 font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white"
                        >
                          Change
                        </button>
                      ) : (
                        <label
                          htmlFor="detail-id-upload"
                          className="shrink-0 cursor-pointer font-semibold text-primary hover:underline"
                        >
                          Choose
                        </label>
                      )}
                      <input
                        id="detail-id-upload"
                        key={idDocument?.name || "empty-id-document"}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(event) =>
                          setIdDocument(event.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <LuShieldCheck size={13} className="text-primary" />
                      Driver's License{" "}
                      <span className="font-normal text-slate-400">
                        (Optional)
                      </span>
                    </div>
                    <div
                      className={`${inputClass} mt-1.5 flex items-center gap-2 text-xs ${
                        licenseDocument
                          ? "ring-2 ring-emerald-400/30 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-400"
                      }`}
                    >
                      {documentPreviewUrls.license ? (
                        <img
                          src={documentPreviewUrls.license}
                          alt="Driver's license preview"
                          className="h-6 w-6 shrink-0 rounded object-cover"
                        />
                      ) : licenseDocument ? (
                        <LuCheck
                          size={14}
                          className="shrink-0 text-emerald-500"
                        />
                      ) : (
                        <LuUpload size={14} className="shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {licenseDocument
                          ? licenseDocument.name
                          : "Upload document"}
                      </span>
                      {licenseDocument ? (
                        <button
                          type="button"
                          onClick={() => setLicenseDocument(null)}
                          className="shrink-0 font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-white"
                        >
                          Change
                        </button>
                      ) : (
                        <label
                          htmlFor="detail-license-upload"
                          className="shrink-0 cursor-pointer font-semibold text-primary hover:underline"
                        >
                          Choose
                        </label>
                      )}
                      <input
                        id="detail-license-upload"
                        key={licenseDocument?.name || "empty-license-document"}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(event) =>
                          setLicenseDocument(event.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    <LuInfo size={12} className="mt-0.5 shrink-0" />
                    Keys must be collected directly at the company location upon
                    presenting valid identification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-borderColor dark:border-slate-700 pt-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Optional add-ons
              </p>
              <div className="mt-3 space-y-2">
                {ADDONS.map((addon) => {
                  const active = addOns[addon.key];
                  const AddOnIcon =
                    addon.key === "insurance"
                      ? LuShieldCheck
                      : addon.key === "driver"
                        ? LuUserPlus
                        : LuBaby;
                  return (
                    <button
                      key={addon.key}
                      type="button"
                      role="switch"
                      aria-checked={active}
                      onClick={() => toggleAddOn(addon.key)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200 cursor-pointer ${
                        active
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : "border-borderColor dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <AddOnIcon size={15} />
                        </span>
                        <span className="text-slate-700 dark:text-slate-200">
                          {addon.label}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          +{formatPrice(addon.rate)}/day
                        </span>
                        <span
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
                            active
                              ? "bg-primary"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                              active ? "left-4.5" : "left-0.5"
                            }`}
                          />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-borderColor dark:border-slate-700 bg-slate-50/80 dark:bg-slate-700/50 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                <LuCalendarCheck size={15} className="text-primary" />
                Price Summary
              </h3>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Base rental
                    <span className="block text-[11px] text-slate-400">
                      {formatPrice(vehicle?.price_per_day || 0)} × {days}{" "}
                      {days === 1 ? "day" : "days"}
                    </span>
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(rentalFee)}
                  </span>
                </div>
                {activeAddOns.map((addon) => (
                  <div
                    key={addon.key}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <LuCheck size={13} strokeWidth={3} />
                      {addon.label}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      +{formatPrice(addon.rate * days)}
                    </span>
                  </div>
                ))}
                {usingDelivery && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-primary">
                      <LuTruck size={13} />
                      Delivery fee
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      +{formatPrice(deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 border-t border-borderColor dark:border-slate-700 pt-3">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Grand Total
                  </span>
                  <span className="text-lg font-extrabold text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                What's included
              </h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Free Cancellation (up to 24h before pick-up)",
                  "Basic Collision Damage Waiver (CDW) included",
                  "Unlimited mileage",
                  "24/7 Roadside Assistance",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300"
                  >
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <LuCheck size={10} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {!hasValidDates && (
              <p className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-700/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                Select a pick-up and return date to continue.
              </p>
            )}

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Choose payment method
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  aria-pressed={true}
                  disabled
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold border-blue-600 bg-blue-600 text-white shadow-sm"
                >
                  <LuQrCode size={13} strokeWidth={2.5} />
                  Bakong KHQR
                </button>
              </div>
              <div className="relative mt-2.5">
                <span
                  aria-hidden="true"
                  className={`animate-pulse-glow pointer-events-none absolute -inset-0.5 rounded-xl ${
                    hasValidDates ? "" : "opacity-0"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!hasValidDates || bookingSubmitting}
                  className="relative inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {bookingSubmitting ? (
                    <>
                      <LuLoader size={16} className="animate-spin" />
                      Preparing payment...
                    </>
                  ) : (
                    "Confirm & Pay Now"
                  )}
                </button>
              </div>
              {bookingSubmitting && (
                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Please wait while we confirm your booking.
                </p>
              )}
              {bookingError && (
                <p className="mt-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-300">
                  {bookingError}
                </p>
              )}
            </div>
          </section>

          <section className="max-lg:order-9 rounded-2xl border border-borderColor dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Renter Feedback &amp; Ratings
            </h3>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <p className="shrink-0 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {reviewAverage ? reviewAverage.toFixed(1) : "—"}
                </p>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <LuStar
                        key={star}
                        size={14}
                        className={
                          star <= Math.round(reviewAverage)
                            ? "text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }
                        fill={
                          star <= Math.round(reviewAverage)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Based on {reviewCount} verified reviews
                  </p>
                </div>
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <LuPenLine size={13} />
                  Leave a Review
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                >
                  <LuPenLine size={13} />
                  Log in to review
                </button>
              )}
            </div>

            <ul className="mt-4 space-y-3">
              {RATING_BARS.map((bar) => (
                <li key={bar.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">
                      {bar.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {bar.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${bar.value * 20}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-4 border-t border-borderColor dark:border-slate-700 pt-4">
              {reviews.map((review) => (
                <article key={review.id}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${review.color} text-xs font-bold text-white`}
                    >
                      {review.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {review.name}
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                          <LuCheck size={9} strokeWidth={3.5} />
                          Verified
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">{review.date}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, star) => (
                        <LuStar
                          key={star}
                          size={11}
                          className="text-amber-400"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    "{review.text}"
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Leave a review modal */}
      {reviewOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4"
          onClick={() => setReviewOpen(false)}
        >
          <div className="absolute inset-0 animate-fade-in bg-slate-900/60 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md animate-rise rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  <LuPenLine size={18} className="text-primary" />
                  Leave a Review
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {vehicle?.brand || "Vehicle"} {vehicle?.model || ""} ·{" "}
                  {user?.name || "Renter"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                aria-label="Close review form"
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:text-slate-200"
              >
                <LuX size={18} />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Your rating
              </p>
              <div
                className="mt-2 flex items-center gap-1.5"
                onMouseLeave={() => setReviewHover(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const lit = star <= (reviewHover || reviewRating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setReviewHover(star)}
                      onClick={() => setReviewRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      className={`cursor-pointer transition-transform duration-150 hover:scale-110 ${
                        star <= reviewRating ? "drop-shadow-sm" : ""
                      }`}
                    >
                      <LuStar
                        size={30}
                        className={`transition-colors ${
                          lit ? "text-amber-400" : "text-slate-200"
                        }`}
                        fill={lit ? "currentColor" : "transparent"}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {reviewRating
                  ? `You selected ${reviewRating} star${reviewRating > 1 ? "s" : ""}`
                  : "Tap the stars to rate your experience"}
              </p>
            </div>

            <div className="mt-5">
              <label htmlFor="detail-review-text" className={labelClass}>
                Your feedback
              </label>
              <textarea
                id="detail-review-text"
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share what stood out — pickup, condition, value…"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="cursor-pointer rounded-xl border border-borderColor dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReview}
                disabled={reviewRating < 1}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <LuCheck size={15} strokeWidth={3} />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borderColor dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {vehicle?.brand || "Vehicle"} {vehicle?.model || ""}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPrice(vehicle?.price_per_day || 0)} /day
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                bookingRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 active:scale-95 sm:px-6"
            >
              <LuCalendarCheck size={16} strokeWidth={2.5} />
              Reserve Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
