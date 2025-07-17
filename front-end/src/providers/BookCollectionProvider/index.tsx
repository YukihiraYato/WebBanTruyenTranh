import { createContext, useContext, useEffect, useState } from "react";
import { getUserBookCollections, createBookCollection, addBookToBookCollection, getDetailsBookCollection, updateBookCollection,  deleteBookFromCollectionItem, findBookCollectionByName } from "~/api/user/bookCollection";
interface BookCollectionContextType {
    bookCollections: any[];
    book: any[];
 createBookCollectionForUser : (collectionData: any) => Promise<any>;
 addBookToCollection: (collectionId: number, bookIds: number[]) => Promise<any>;
 getBookCollectionsForUser: ({pageParam}: any) => Promise<any>;
getListBookFromCollection: (collectionId: number) => Promise<any>;
updateBookCollectionOfUser: (collectionId: number, collectionData: any) => Promise<any>;
deleteBookCollection: (collectionId: number) => Promise<any>;
deleteBookFromCollection: (collectionId: number, bookId: number) => Promise<any>;
findBookCollectionOfUser: (page: number, name: string) => Promise<any>;
}
const BookCollectionContext = createContext<BookCollectionContextType | null>(null);

export function useBookCollection() {
  const context = useContext(BookCollectionContext);
  if (!context) {
    throw new Error("useBookCollection must be used within a BookCollectionProvider");
  }
  return context;
}
export default function BookCollectionProvider({ children }: { children: React.ReactNode }) {
  const [bookCollections, setBookCollections] = useState<any[]>([]);
  const [book, setBook] = useState<any[]>([]);
  const createBookCollectionForUser = async (collectionData: any) => {
    // Implement API call to create a book collection
    try {
      // Simulate API call
       await createBookCollection(collectionData);
      const res = await getUserBookCollections({ pageParam: 0 });
      setBookCollections(res.content);
      return res.code
    } catch (error) {
      console.error("Error creating book collection:", error);
      throw error;
    }
  };

  const addBookToCollection = async (collectionId: number, bookIds: number[]) => {
    // Implement API call to add books to a collection
    try{
        const res = await addBookToBookCollection(collectionId, bookIds);
        return res;
    } catch (error) {
        console.error("Error adding books to collection:", error);
        throw error;
    }
  };

  const getBookCollectionsForUser = async ({ pageParam }: any) => {
    // Implement API call to get user book collections
    try {
        const res = await getUserBookCollections({ pageParam });
        setBookCollections(res.content);
        return res;
    } catch (error) {
        console.error("Error getting user book collections:", error);
        throw error;
    }
  };

  const getListBookFromCollection = async (collectionId: number) => {
    // Implement API call to get details of a book collection
    try {
      const res = await getDetailsBookCollection(collectionId);
      return res;
    } catch (error) {
      console.error("Error getting book collection details:", error);
      throw error;
    }
  };

  const updateBookCollectionOfUser = async (collectionId: number, collectionData: any) => {
    // Implement API call to update a book collection
    try {
      const res = await updateBookCollection(collectionId, collectionData);
      return res;
    } catch (error) {
      console.error("Error updating book collection:", error);
      throw error;
    }
  };

  const deleteBookCollection = async (collectionId: number) => {
    // Implement API call to delete a book collection
  };
  const deleteBookFromCollection = async (collectionId: number, bookId: number) => {
    // Implement API call to delete a book from a 
    try {
       await deleteBookFromCollectionItem(collectionId, bookId);
      const res = await getListBookFromCollection(collectionId);
      setBook(res.books);
    } catch (error) {
      console.error("Error deleting book from collection:", error);
      throw error;
    }
  };

  const findBookCollectionOfUser = async (page: number, name: string) => {
    try {
      const res = await findBookCollectionByName(page, name);
      return res;
    } catch (error) {
      console.error("Error finding book collection of user:", error);
      throw error;
    }
  };

  return (
    <BookCollectionContext.Provider value={{
        bookCollections,
        book,
      createBookCollectionForUser,
      addBookToCollection,
      getBookCollectionsForUser,
      getListBookFromCollection,
      updateBookCollectionOfUser,
      deleteBookCollection,
      deleteBookFromCollection,
      findBookCollectionOfUser
    }}>
      {children}
    </BookCollectionContext.Provider>
  );
}
