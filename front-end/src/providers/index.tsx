import React from "react";
import { SearchProvider } from "./SearchProvider";
import { CartProvider } from "./CartProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookCollectionProvider from "./BookCollectionProvider";
import { AuthProvider } from "~/context/AuthContext";
import { DiscountProvider } from "./DiscountProvider";
import { RedeemRewardProvider } from "./RedeemRewardProivder";
const queryClient = new QueryClient();
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookCollectionProvider>
          <SearchProvider>
            <CartProvider>
              <RedeemRewardProvider>
              <DiscountProvider>
              {children}
              </DiscountProvider>
              </RedeemRewardProvider>
            </CartProvider>
          </SearchProvider>
        </BookCollectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}