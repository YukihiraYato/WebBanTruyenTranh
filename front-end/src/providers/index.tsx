import React from "react";
import { SearchProvider } from "./SearchProvider";
import { CartProvider } from "./CartProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookCollectionProvider from "./BookCollectionProvider";
import { AuthProvider } from "~/context/AuthContext";
const queryClient = new QueryClient();
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookCollectionProvider>
          <SearchProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SearchProvider>
        </BookCollectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}