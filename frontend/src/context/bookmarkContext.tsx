import { createContext, useState, useEffect, type ReactNode } from "react";
import { toggleBookmark as toggleBookmarkAPI, fetchMyBookmarkIds } from "../services/bookmarkService";
import useAuth from "./useAuth";

interface BookmarkContextType {
  bookmarkedIds: string[];
  toggleBookmark: (jobId: string) => Promise<void>;
  isBookmarked: (jobId: string) => boolean;
}

export const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if(user){
      loadBookmarkIds();
    }else{
      setBookmarkedIds([]);
    }
  }, [user]);

  const loadBookmarkIds = async () => {
    try{
      const ids = await fetchMyBookmarkIds();
      setBookmarkedIds(ids);
    }catch(err){
      console.error("Failed to fetch bookmarks", err);
    }
  };

  const toggleBookmark = async (jobId: string) => {
    try {
      const isNowBookmarked = await toggleBookmarkAPI(jobId);
      if (isNowBookmarked) {
        setBookmarkedIds((prev) => [...prev, jobId]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== jobId));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const isBookmarked = (jobId: string) => bookmarkedIds.includes(jobId);

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};