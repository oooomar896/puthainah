import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Provider store={store}>
          <App />
        </Provider>
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>
);
