import ListCartItem from "./ListCartItem";
import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Sumary from "./Sumary";
import Discount from "./Discount";
import Gift from "./Gift";
import { useCart } from "~/providers/CartProvider";
import { CartItemPropertyResponseDTO } from "~/types/cart";
import { BookItemPropertyResponseDTO, RedeemRewardItemPropertyResponseDTO } from "~/types/cart";

function Cart() {
  const { cart } = useCart();
  const [listItem, setListItem] = useState<CartItemPropertyResponseDTO[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
   const [totalPriceConst, setTotalPriceConst] = useState(0);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  // Key: discountId, Value: số tiền giảm
  const [discountMap, setDiscountMap] = useState<Record<number, number>>({});

  //  Hàm callback để nhận báo cáo từ DiscountCard con
  const handleUpdateDiscountAmount = (discountId: number, amount: number) => {
    setDiscountMap((prev) => {
      // Nếu số tiền không đổi thì thôi ko set lại để tránh render thừa
      if (prev[discountId] === amount) return prev; 
      
      return {
        ...prev,
        [discountId]: amount
      };
    });
  };

  //  Tính tổng tiền giảm giá từ cuốn sổ cái (Derived State)
  const totalOrderDiscount = Object.values(discountMap).reduce((sum, val) => sum + val, 0);

  //  Tính Total
  // Đảm bảo không giảm quá tổng tiền hàng
  const finalDiscount = Math.min(totalOrderDiscount, totalPrice);
  const finalTotal = Math.max(0, totalPrice - finalDiscount);

 // Cập nhật list Book hoặc Redeem mỗi khi cart thay đổi (API)
  useEffect(() => {
    if (cart && cart.length > 0) {
      setListItem((prevList) => {
        // Nếu list hiện tại đang rỗng (lần đầu load), thì lấy luôn từ API
        if (prevList.length === 0) {
             return cart.map((item) => {
                if (item.typePurchase === "BOOK") {
                    return { typePurchase: item.typePurchase, item: item.item as BookItemPropertyResponseDTO };
                } else {
                    return { typePurchase: item.typePurchase, item: item.item as RedeemRewardItemPropertyResponseDTO };
                }
             });
        }

        // --- LOGIC MERGE THÔNG MINH (GIỮ LẠI DISCOUNT) ---
        // Khi tăng giảm số lượng, API trả về cart mới. 
        // Ta cần update số lượng mới đó vào list, NHƯNG KHÔNG ĐƯỢC LÀM MẤT GIÁ DISCOUNT ĐANG CÓ.
        
        const mergedList = cart.map((apiItem) => {
            // Tìm item tương ứng trong danh sách hiện tại (đang có discount)
            const currentItem = prevList.find(p => p.item.productId === apiItem.item.productId);
            
            // Tạo object item mới từ API (để lấy quantity mới, price gốc mới...)
            let newItemData = apiItem.typePurchase === "BOOK" 
                ? { ...(apiItem.item as BookItemPropertyResponseDTO) }
                : { ...(apiItem.item as RedeemRewardItemPropertyResponseDTO) };

            // Nếu tìm thấy item cũ đang tồn tại trong state
            if (currentItem) {
                const currentItemData = currentItem.item as any;
                
                // BÊ NGUYÊN XI CÁC TRƯỜNG DISCOUNT CỦA ITEM CŨ SANG ITEM MỚI
                if (currentItemData.discountedPrice !== undefined) {
                    newItemData = {
                        ...newItemData,
                        discountedPrice: currentItemData.discountedPrice,
                        // Giữ lại cả backup giá gốc (cho logic Book)
                        originalPromotionPrice: currentItemData.originalPromotionPrice
                    };
                }
            }

            return {
                typePurchase: apiItem.typePurchase,
                item: newItemData
            };
        });

        return mergedList;
      });
    }
    setListItem(cart)
  }, [cart]); // Vẫn lắng nghe cart thay đổi
  //  Khi số lượng thay đổi từ CartItem
  const handleQuantityChange = (bookId: number, newQuantity: number) => {
    setListItem((prev) =>
      prev.map((book) =>
        book.item.productId === bookId
          ? {
            ...book,
            item: { ...book.item, quantity: newQuantity } // <--- Phải chui vào 'item'
          }
          : book
      )
    );
  };
  //  Khi checkbox thay đổi
  const handleToggleCheckbox = (bookId: number) => {
    setCheckedItems((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };
  const handleToggleAll = () => {
    if (checkedItems?.length === listItem?.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(listItem?.map((book) => book.item.productId));
    }
  };

 // 3. FIX LỖI: Logic tính tổng thông minh hơn (Gộp cả BOOK và REDEEM)
  useEffect(() => {
    const total = listItem?.reduce((sum, cartItem) => {
      if (checkedItems.includes(cartItem.item.productId)) {
        
        const itemData = cartItem.item as any; // Ép kiểu để check discountedPrice cho nhanh
        
        // Ưu tiên lấy giá Discount, nếu không có thì lấy giá Gốc
        // Logic này đúng cho cả BOOK và REDEEM
        const priceToCalc = (itemData.discountedPrice !== undefined && itemData.discountedPrice !== null)
            ? itemData.discountedPrice
            : itemData.price;

        return sum + (itemData.quantity * priceToCalc);
      }
      return sum;
    }, 0);
    
    // Tự động cập nhật Tạm tính
    setTotalPrice(total);
  }, [listItem, checkedItems]); // Chạy mỗi khi list thay đổi (do DiscountCard update) hoặc check thay đổi

  // Đây là useEffect tính tổng tiền khi chưa áp discount
   useEffect(() => {
    const total = listItem?.reduce((sum, cartItem) => {
      if (checkedItems.includes(cartItem.item.productId)) {
        
        const itemData = cartItem.item as any; // Ép kiểu để check discountedPrice cho nhanh
        
        // Ưu tiên lấy giá Discount, nếu không có thì lấy giá Gốc
        // Logic này đúng cho cả BOOK và REDEEM
        const priceToCalc = (itemData.discountedPrice !== undefined && itemData.discountedPrice !== null)
            ? itemData.discountedPrice
            : itemData.price;

        return sum + (itemData.quantity * priceToCalc);
      }
      return sum;
    }, 0);
    
    // Tự động cập nhật Tạm tính
    setTotalPriceConst(total);
  }, [ checkedItems]); // Chạy mỗi khi list thay đổi (do DiscountCard update) hoặc check thay đổi



  // Truyền data sách được chọn mua cho component Sumary
  const selectedBooks = listItem?.filter((book) =>
    checkedItems.includes(book.item.productId)
  );


  return (
    <Box display="flex" gap={3} alignItems="flex-start" padding={10} paddingTop={5}>
      {/* Bên trái - Danh sách sản phẩm */}
      <Box flex={3}>
        {localStorage.getItem("access_token") ? (
          <ListCartItem
            listBook={listItem}
            onQuantityChange={handleQuantityChange}
            onToggleCheckbox={handleToggleCheckbox}
            onToggleAll={handleToggleAll}
            checkedItems={checkedItems}
          />
        ) : null}
      </Box>

      {/* Bên phải - Khuyến mãi, quà tặng, tổng */}
      <Box flex={1} display="flex" flexDirection="column" gap={2}>
        <Discount onUpdateDiscountAmount={handleUpdateDiscountAmount} totalPrice={totalPrice} setTotalPrice={setTotalPrice} setListItem={setListItem} />
        <Gift />
        <Sumary subTotal={totalPrice} discountAmount={finalDiscount}
        finalTotal={finalTotal}
          selectedBooks={selectedBooks} />
      </Box>
    </Box>
  );
}
export default Cart;
