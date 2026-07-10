import { useContext } from "react";
import { BookmarkContext } from "./bookmarkContext.tsx";

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarkProvider");
  }
  return context;
};