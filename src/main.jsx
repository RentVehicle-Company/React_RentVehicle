import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <PreferencesProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </PreferencesProvider>
    </BrowserRouter>
);
