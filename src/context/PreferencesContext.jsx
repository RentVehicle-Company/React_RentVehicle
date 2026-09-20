import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "rental_preferences";

const TRANSLATIONS = {
  en: {
    nav_home: "Home",
    nav_cars: "Cars",
    nav_motorbikes: "Motorbikes",
    nav_bicycles: "Bicycles",
    nav_about: "About",
    login: "Log In",
    register: "Register",
    day: "day",
    per_day: "/day",
    seats: "Seats",
    quick_view: "Quick View",
    view_vehicle: "View Vehicle",
    compare: "Compare",
    in_compare: "In Compare List",
    available_now: "Available Now",
    available_in: "Available Now in {location}",
    only_one_left: "Only 1 Left",
    close: "Close",
    clear_all: "Clear All",
    compare_specs: "Compare Specs",
    compare_now: "Compare Now",
    remove: "Remove",
    per_day_label: "per day",
    fuel: "Fuel",
    transmission: "Transmission",
    year: "Year",
    location: "Location",
    price_per_day: "Price / day",
    vehicle: "Vehicle",
    pickup_location: "Pickup Location",
    from: "from",
    est_cost: "Estimated Cost",
    add_to_compare_hint:
      "Check up to 3 {category} to compare specs side-by-side",
    trip_duration: "Trip duration",
    pickup: "Pickup",
    return: "Return",
    book_now: "Book Now",
    save_3plus: "Save {pct}% (3+ days)",
    book_3plus_save: "Book 3+ days and save {pct}% automatically",
    horsepower: "Horsepower",
    acceleration: "0-100 km/h",
    drivetrain: "Drivetrain",
    engine_cc: "Engine (cc)",
    fuel_efficiency: "Fuel Efficiency",
    top_speed: "Top Speed",
    frame: "Frame Material",
    gears: "Gears",
    wheel_size: "Wheel Size",
    vehicle_type: "Type",
  },
  km: {
    nav_home: "ទំព័រដើម",
    nav_cars: "រថយន្ត",
    nav_motorbikes: "ម៉ូតូ",
    nav_bicycles: "កង់",
    nav_about: "អំពីយើង",
    nav_about: "អំពីយើង",
    login: "ចូលគណនី",
    register: "ចុះឈ្មោះ",
    day: "ថ្ងៃ",
    per_day: "/ថ្ងៃ",
    seats: "កៅអី",
    quick_view: "មើលរហ័ស",
    view_vehicle: "មើលរថយន្ត",
    compare: "ប្រៀបធៀប",
    in_compare: "ក្នុងបញ្ជីប្រៀបធៀប",
    available_now: "មានឥឡូវនេះ",
    available_in: "មាននៅ {location} ឥឡូវនេះ",
    only_one_left: "នៅសល់ 1 តែប៉ុណ្ណោះ",
    close: "បិទ",
    clear_all: "សម្អាតទាំងអស់",
    compare_specs: "ប្រៀបធៀបលក្ខណៈ",
    compare_now: "ប្រៀបធៀបឥឡូវនេះ",
    remove: "ដកចេញ",
    per_day_label: "ក្នុងមួយថ្ងៃ",
    fuel: "ប្រេង",
    transmission: "បញ្ជូន",
    year: "ឆ្នាំ",
    location: "ទីតាំង",
    price_per_day: "តម្លៃ / ថ្ងៃ",
    vehicle: "រថយន្ត",
    pickup_location: "ទីតាំងយករថយន្ត",
    from: "ចាប់ពី",
    est_cost: "តម្លៃប៉ាន់ស្មាន",
    add_to_compare_hint:
      "ជ្រើសរើស {category} រហូតដល់ 3 គ្រឿង ដើម្បីប្រៀបធៀបលក្ខណៈ",
    trip_duration: "រយៈពេលធ្វើដំណើរ",
    pickup: "យករថយន្ត",
    return: "ប្រគល់រថយន្ត",
    book_now: "កក់ឥឡូវនេះ",
    save_3plus: "សន្សំ {pct}% (3+ ថ្ងៃ)",
    book_3plus_save: "កក់ 3+ ថ្ងៃ និងសន្សំ {pct}% ដោយស្វ័យប្រវត្តិ",
    horsepower: "កម្លាំងសេះ",
    acceleration: "0-100 គ.ម/ម៉",
    drivetrain: "ប្រព័ន្ធដ្រាយ",
    engine_cc: "ម៉ាស៊ីន (cc)",
    fuel_efficiency: "ស៊ីប្រេង",
    top_speed: "ល្បឿនអតិបរមា",
    frame: "សម្ភារៈស៊ុម",
    gears: "ហ្គែរ",
    wheel_size: "ទំហំកង់",
    vehicle_type: "ប្រភេទ",
  },
};

const PreferencesContext = createContext(null);

// oxlint-disable-next-line react/only-export-components
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY))?.language || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ language }));
  }, [language]);

  const formatPrice = (amount) => {
    return `$${Number(amount).toLocaleString("en-US")}`;
  };

  const formatAmount = (amount) => {
    const value = Number(amount) || 0;
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const t = (key, vars = {}) => {
    let text = TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, value);
    });
    return text;
  };

  const value = {
    language,
    setLanguage,
    formatPrice,
    formatAmount,
    t,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
