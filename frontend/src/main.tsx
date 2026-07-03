import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ApplicationProvider } from "./context/ApplicationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApplicationProvider>
        <App />
      </ApplicationProvider>
    </AuthProvider>
  </BrowserRouter>,
);
