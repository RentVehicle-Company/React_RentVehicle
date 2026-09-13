import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LuArrowLeft,
  LuCalendarDays,
  LuClock3,
  LuCreditCard,
  LuFuel,
  LuMapPin,
  LuQrCode,
  LuSettings2,
  LuUsers,
} from "react-icons/lu";
import { getVehicleById } from "../../services/vehicleServices";

const inputClass =
  "w-full px-4 py-2.5 bg-white border border-borderColor rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

const CITY_COORDS = {
  "New York": [40.7128, -74.006],
  "Los Angeles": [34.0522, -118.2437],
  "Houston": [29.7604, -95.3698],
  "Chicago": [41.8781, -87.6298],
  "Phnom Penh": [11.5564, 104.9282],
  "Seam Reap": [13.3671, 103.8446],
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

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getVehicleById(id)
      .then((data) => {
        setVehicle(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Vehicle not found.");
        setLoading(false);
      });
  }, [id]);

  const images = vehicle?.images?.length ? vehicle.images : vehicle ? [vehicle.image] : [];
  const coords = CITY_COORDS[vehicle?.location] || CITY_COORDS["Phnom Penh"];
  const [lat, lon] = coords;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`;

  const pickupMs = pickupDate ? new Date(`${pickupDate}T00:00:00`).getTime() : 0;
  const returnMs = returnDate ? new Date(`${returnDate}T00:00:00`).getTime() : 0;
  const hasValidDates = Boolean(pickupDate && returnDate && returnMs >= pickupMs);
  const days = hasValidDates
    ? Math.max(1, Math.round((returnMs - pickupMs) / 86400000))
    : 0;
  const rentalFee = vehicle ? Math.round(vehicle.price_per_day * days) : 0;
  const serviceFee = vehicle ? Math.round(rentalFee * 0.05) : 0;
  const totalPrice = rentalFee + serviceFee;

  const handleBook = (method) => {
    if (!vehicle || !hasValidDates) return;
    const booking = {
      id: vehicle.id,
      vehicleName: `${vehicle.brand} ${vehicle.model}`,
      image: vehicle.image,
      startDate: formatDate(pickupDate),
      endDate: formatDate(returnDate),
      pickupLocation: vehicle.location,
      pricePerDay: vehicle.price_per_day,
      rentalFee,
      serviceFee,
      totalPrice,
      duration: days,
      status: "confirmed",
      paymentStatus: "unpaid",
    };
    navigate(
      method === "visa" ? "/payment/visa" : "/payment/khqr",
      { state: { booking } }
    );
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-sm text-slate-500">
        Loading vehicle...
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <LuArrowLeft size={18} />
          Back to Cars
        </Link>
        <div className="mt-6 bg-white border border-borderColor rounded-2xl p-10 text-center text-sm text-slate-500">
          {error || "Vehicle not found."}
        </div>
      </div>
    );
  }

  const specs = [
    { icon: LuUsers, label: "Seats", value: `${vehicle.seating_capacity} Passengers` },
    { icon: LuFuel, label: "Fuel", value: vehicle.fuel_type },
    { icon: LuSettings2, label: "Transmission", value: vehicle.transmission },
    { icon: LuCalendarDays, label: "Year", value: vehicle.year },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/cars"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <LuArrowLeft size={18} />
        Back to Cars
      </Link>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)] gap-5">
        <div className="min-w-0 space-y-5">
          <section className="bg-white border border-borderColor rounded-2xl overflow-hidden shadow-sm">
            <div className="relative bg-slate-100">
              <img
                src={images[activeImg]}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-64 sm:h-80 w-full object-cover"
              />
              <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                {vehicle.category}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImg(index)}
                  aria-label={`Photo ${index + 1}`}
                  className={`h-16 w-20 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                    index === activeImg
                      ? "border-primary"
                      : "border-transparent hover:border-borderColor"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${vehicle.brand} ${vehicle.model} photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{vehicle.category}</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {vehicle.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-borderColor bg-slate-50 p-3"
                >
                  <Icon size={18} className="text-primary" />
                  <p className="mt-2 text-xs text-slate-500">{label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Pickup Location</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <LuMapPin size={15} className="text-primary" />
              {vehicle.location}
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-borderColor bg-slate-100">
              <iframe
                title={`Map showing ${vehicle.location}`}
                src={mapUrl}
                className="h-[240px] w-full border-0"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {vehicle.location} | Lat: {lat.toFixed(4)}, Long: {lon.toFixed(4)}
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 self-start">
          <section className="bg-white border border-borderColor rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Book This Vehicle
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
              <p className="text-right text-lg font-bold text-slate-900">
                {formatMoney(vehicle.price_per_day)}
                <span className="block text-xs font-normal text-slate-500">
                  /day
                </span>
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="detail-pickup" className={labelClass}>
                  Pick-up Date
                </label>
                <input
                  id="detail-pickup"
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="detail-return" className={labelClass}>
                  Return Date
                </label>
                <input
                  id="detail-return"
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-borderColor pt-4 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Duration</span>
                <span className="flex items-center gap-1.5">
                  <LuClock3 size={15} />
                  {days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "Select dates"}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Rental fee</span>
                <span>{formatMoney(rentalFee)}</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Service fee (5%)</span>
                <span>{formatMoney(serviceFee)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4 border-t border-borderColor pt-3 font-bold text-slate-900">
                <span>Total</span>
                <span>{formatMoney(totalPrice)}</span>
              </div>
            </div>

            {!hasValidDates && (
              <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
                Select a pick-up and return date to continue.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleBook("visa")}
                disabled={!hasValidDates}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <LuCreditCard size={16} />
                Pay with VISA
              </button>
              <button
                type="button"
                onClick={() => handleBook("khqr")}
                disabled={!hasValidDates}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <LuQrCode size={16} />
                Pay with Bakong KHQR
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default VehicleDetail;