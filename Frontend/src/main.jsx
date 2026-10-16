import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import WebsiteSettingsLoader from "./components/shared/WebsiteSettingsLoader";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <WebsiteSettingsLoader />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)