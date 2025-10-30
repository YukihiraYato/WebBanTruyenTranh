import { createContext, useContext, useEffect, useState } from "react";
import { getDiscountForUser } from "~/api/discount";
import { getUserDetails } from "~/api/user/userDetails";

export interface DiscountResult {
  code: number;
  result: string;
}
export interface DiscountType {
  discountId: number;
  code: string;
  title: string;
  description: string;
  discountType: string;
  value: number;
  targetType: string;
  minOrderAmount: number;
  usageLimit: number;
  useCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;

}
export type DiscountSelections = {
  ORDER?: DiscountType;
  CATEGORY?: DiscountType;
  BOOK?: DiscountType;
  [key: string]: DiscountType | undefined;

};
interface DiscountContextType {
  listDiscount: DiscountType[];
  listDiscountChosen?: DiscountSelections[];
  fetchDiscount: () => void;
  setListDiscountChosen?: (discounts: DiscountSelections[]) => void;
}

const DiscountContext = createContext<DiscountContextType | null>(null);

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (!context) throw new Error("useDiscount must be used inside DiscountProvider");
  return context;
};

export function DiscountProvider({ children }: { children: React.ReactNode }) {
  const [listDiscount, setListDiscount] = useState<DiscountType[]>([]);
  const [listDiscountChosen, setListDiscountChosen] = useState<DiscountSelections[]>([]);
  const fetchDiscount = async () => {
    try {
      const resUserDetails = await getUserDetails();
      const userId = resUserDetails.result.userId;
      const res = await getDiscountForUser(userId);
      setListDiscount(res.result);

    } catch (err) {
      console.error("Lỗi khi lấy Discount:", err);
    }
  };


  useEffect(() => {
    fetchDiscount();
  }, []);

  return (
    <DiscountContext.Provider value={{ listDiscount, fetchDiscount, listDiscountChosen, setListDiscountChosen }}>
      {children}
    </DiscountContext.Provider>
  );
}
