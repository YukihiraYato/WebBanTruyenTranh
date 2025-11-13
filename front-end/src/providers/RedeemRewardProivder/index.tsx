import { createContext, useContext, useEffect, useState } from "react";
import { getListRedeemReward, getListRedeemRewardWithFilter, getARedeemReward } from "../../api/redeemReward";
import { useLocation } from "react-router-dom";
export interface RedeemRewardType {
  rewardId: number;
  title: string;
  description: string;
  color: string;
  size: string;
  material: string;
  supplier: string;
  manufacturedIn: string;
  origin: string;
  price: number;
  qtyInStock: number;
  weight: string;
  images: any[];
  typePurchase: string;
}


interface RedeemRewardContextType {
  listRedeemReward: RedeemRewardType[];
  fetchRedeemReward: () => void;
  page: number;
  setPage: (page: number) => void;
  size: number;
  setSize: (size: number) => void;
  totalPages: number;
  setTotalPages: (totalPages: number) => void;
  material: string;
  setMaterial: (material: string) => void;
  origin: string;
  setOrigin: (origin: string) => void;
  rangePrice: string;
  setRangePrice: (rangePrice: string) => void;
  redeemRewards: RedeemRewardType;
  setRedeemRewards: (redeemRewards: RedeemRewardType) => void;
  redeemRewardId: number;
  setRedeemRewardId: (redeemRewardId: number) => void;
  keyword: string;
  setKeyword: (keyword: string) => void;
}

const RedeemRewardContext = createContext<RedeemRewardContextType | null>(null);

export const useRedeemReward = () => {
  const context = useContext(RedeemRewardContext);
  if (!context) throw new Error("useCart must be used inside RedeemRewardProvider");
  return context;
};

export function RedeemRewardProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [material, setMaterial] = useState<string | "">("");
  const [origin, setOrigin] = useState<string | "">("");
  const [rangePrice, setRangePrice] = useState<string | "">("");
  const [totalPages, setTotalPages] = useState(0);
  const [listRedeemReward, setListRedeemReward] = useState<RedeemRewardType[]>([]);
  const [redeemRewards, setRedeemRewards] = useState<RedeemRewardType>({
    rewardId: 0,
    title: "",
    description: "",
    color: "",
    size: "",
    material: "",
    supplier: "",
    manufacturedIn: "",
    origin: "",
    price: 0,
    qtyInStock: 0,
    weight: "",
    images: [],
    typePurchase: ""
  });
  const [keyword, setKeyword] = useState<string>("");
  const [redeemRewardId, setRedeemRewardId] = useState<number>(0);
  const location = useLocation();
  const getARedeemRewardFromBackend = async (rewardId: number) => {
    try {
      const res = await getARedeemReward(rewardId);
      setRedeemRewards(res);
    } catch (err) {
      console.error("Lỗi khi lấy redeem reward:", err);
    }
  };
  useEffect(() => {
    if (location.pathname.startsWith("/redeem_details/")) {
      const rewardId = parseInt(location.pathname.split("/redeem_details/")[1]);
      setRedeemRewardId(rewardId);
      if (!isNaN(rewardId)) {
        getARedeemRewardFromBackend(rewardId);
      }
    }
    if (location.pathname === "/redeem-reward") {
      const params = new URLSearchParams(location.search);
      const searchKeyword = params.get("context"); // lấy giá trị sau dấu '='
      const pageUrl = params.get("page");
      const sizeUrl = params.get("size");
      if (searchKeyword) {
        setKeyword(searchKeyword);
      }
     
      setPage(pageUrl ? parseInt(pageUrl) : 0);
      setSize(sizeUrl ? parseInt(sizeUrl) : 12);
      fetchRedeemReward();
    }
  }, [location.pathname]);
//  chỉ fetch khi keyword cập nhập kịp từ useState
useEffect(() => {
  if (location.pathname === "/redeem-reward") {
    fetchRedeemReward();
  }
}, [page, size, material, origin, rangePrice, keyword]);
  const fetchRedeemReward = async () => {
    try {
      const res = await getListRedeemRewardWithFilter(page - 1, size, material, origin, rangePrice, keyword);
      setTotalPages(res.totalPages);
      setListRedeemReward(res.content);

    } catch (err) {
      console.error("Lỗi khi lấy list redeem reward:", err);
    }
  };


  useEffect(() => {
    fetchRedeemReward();
  }, [page, size, material, origin, rangePrice]);

  return (
    <RedeemRewardContext.Provider value={{
      listRedeemReward, fetchRedeemReward, page, setPage, size, setSize, totalPages, setTotalPages
      , material, setMaterial, origin, setOrigin, rangePrice, setRangePrice,
      redeemRewards, setRedeemRewards, redeemRewardId, setRedeemRewardId,
      keyword, setKeyword
    }}>
      {children}
    </RedeemRewardContext.Provider>
  );
}
