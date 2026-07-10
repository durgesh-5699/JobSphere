import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ApplicationProvider } from "./context/ApplicationContext.tsx";
import { BookmarkProvider } from "./context/bookmarkContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApplicationProvider>
        <BookmarkProvider>
          <App />
        </BookmarkProvider>
      </ApplicationProvider>
    </AuthProvider>
  </BrowserRouter>,
);
