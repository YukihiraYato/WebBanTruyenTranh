import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Send, Package, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/stock-utils";
import {createReceipt as createImportReceipt } from '@/api/import_product';

// 1. Import Component Search và Interface
import { ProductSearch } from './ProductSearch'; 
import { ProductResponse } from './ProductSearch'; // Nhớ import interface này để TS không báo lỗi

export default function ImportCreatePage() {
  // --- State Header ---
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  
  // --- State Form Nhập liệu ---
  const [type, setType] = useState<'BOOK' | 'REDEEM_REWARD'>('BOOK');
  
  // 2. State lưu sản phẩm đang chọn (Thay cho productId string cũ)
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  // --- State Danh sách giỏ hàng ---
  const [items, setItems] = useState<any[]>([]);

  // 3. Hàm xử lý khi chọn từ Dropdown Search
  const handleSelectProduct = (product: ProductResponse) => {
      setSelectedProduct(product);
      // Tự động điền giá hiện tại vào ô giá nhập để tham khảo
      setPrice(product.price || 0); 
  };

  // 4. Hàm Thêm vào danh sách (Sửa lại logic lấy ID)
  const handleAddItem = () => {
    // Validate
    if(!selectedProduct) {
        alert("Vui lòng tìm và chọn sản phẩm trước!");
        return;
    }
    if (qty <= 0) {
        alert("Số lượng phải lớn hơn 0");
        return;
    }

    // Tạo item mới
    const newItem = {
      tempId: Date.now(), // ID tạm để render list React
      
      // QUAN TRỌNG: Map đúng trường từ ProductResponse
      productId: selectedProduct.bookId,  // API của bạn trả về bookId
      productType: type,
      productName: selectedProduct.title,
      quantity: Number(qty),
      importPrice: Number(price)
    };
    
    // Thêm vào mảng
    setItems([...items, newItem]);

    // Reset Form nhập liệu (Không reset Supplier/Note)
    setSelectedProduct(null); 
    setQty(1);
    setPrice(0);
  };

  const handleRemoveItem = (tempId: number) => {
      setItems(items.filter(i => i.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if(items.length === 0 || !supplier) {
        alert("Vui lòng nhập nhà cung cấp và ít nhất 1 sản phẩm");
        return;
    }
    try {
        const payload = {
            supplierName: supplier,
            note: note,
            items: items.map(i => ({
                productId: i.productId,
                productType: i.productType,
                quantity: i.quantity,
                importPrice: i.importPrice
            }))
        };
        
        await createImportReceipt(payload);
        
        alert("Thành công! Đã gửi phiếu nhập cho quản lý.");
        // Reset toàn bộ trang
        setItems([]);
        setSupplier('');
        setNote('');
        setSelectedProduct(null);
    } catch (e) {
        console.error(e);
        alert("Lỗi khi tạo phiếu nhập");
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);

  return (
    <div className="h-[calc(100vh-80px)] p-6 grid grid-cols-12 gap-6 bg-slate-50/50 overflow-auto">
      
      {/* --- CỘT TRÁI: FORM NHẬP --- */}
      <div className="col-span-12 md:col-span-5 space-y-4">
        
        {/* Card 1: Thông tin chung */}
        <Card>
           <CardHeader><CardTitle>Thông tin phiếu nhập</CardTitle></CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>Nhà cung cấp <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VD: NXB Kim Đồng..." 
                    value={supplier} 
                    onChange={e => setSupplier(e.target.value)} 
                  />
              </div>
              <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea 
                    placeholder="Ghi chú (nếu có)..." 
                    value={note} 
                    onChange={e => setNote(e.target.value)} 
                  />
              </div>
           </CardContent>
        </Card>

        {/* Card 2: Form Thêm Sản Phẩm */}
        <Card className="h-fit shadow-sm border-blue-200">
          <CardHeader className="bg-blue-50/50 pb-3 border-b">
            <CardTitle className="text-blue-700 flex items-center gap-2">
                <Package className="h-5 w-5"/> Chọn Sản Phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            
            {/* Chọn Loại */}
            <div className="space-y-2">
                <Label>Loại hàng nhập</Label>
                <Select value={type} onValueChange={(v: any) => {
                    setType(v);
                    setSelectedProduct(null); // Reset khi đổi loại
                }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BOOK">Sách</SelectItem>
                        <SelectItem value="REWARD">Quà tặng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* --- COMPONENT TÌM KIẾM --- */}
            <div className="space-y-2">
                <Label>Tìm tên sản phẩm <span className="text-red-500">*</span></Label>
                
                {/* key={items.length} -> Mẹo: Mỗi khi thêm xong 1 món (items đổi), 
                   ProductSearch sẽ được re-render lại từ đầu (trống trơn) 
                */}
                <ProductSearch 
                    key={items.length} 
                    type={type} 
                    onSelect={handleSelectProduct} 
                />

                {/* Phần hiển thị Feedback sau khi chọn */}
                {selectedProduct ? (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex flex-col gap-1">
                        <span className="font-bold flex items-center gap-2">
                            <Package className="h-4 w-4"/> {selectedProduct.title}
                        </span>
                        <div className="flex gap-3 text-xs opacity-80">
                            <span>ID: {selectedProduct.bookId}</span>
                            <span>|</span>
                            <span>Tồn kho: {selectedProduct.quantityInStock}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3"/> Vui lòng gõ tên để tìm và chọn sản phẩm
                    </div>
                )}
            </div>
            {/* -------------------------- */}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Số lượng nhập</Label>
                    <Input 
                        type="number" 
                        min={1} 
                        value={qty} 
                        onChange={e => setQty(Number(e.target.value))} 
                        className="font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Giá nhập (VND)</Label>
                    <Input 
                        type="number" 
                        min={0} 
                        value={price} 
                        onChange={e => setPrice(Number(e.target.value))} 
                    />
                </div>
            </div>
            
            <Button 
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700" 
                size="lg" 
                onClick={handleAddItem}
                disabled={!selectedProduct} // Khóa nút nếu chưa chọn sản phẩm
            >
                <Plus className="mr-2 h-5 w-5" /> Thêm vào danh sách
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- CỘT PHẢI: BẢNG DANH SÁCH (Không đổi) --- */}
      <div className="col-span-12 md:col-span-7 flex flex-col h-full space-y-4">
        <Card className="flex-1 flex flex-col overflow-hidden border-2 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-slate-100 border-b">
                <CardTitle>Hàng chờ nhập ({items.length})</CardTitle>
                <div className="text-lg font-bold text-blue-700">
                    Tổng: {formatCurrency(totalAmount)}
                </div>
            </CardHeader>
            <div className="flex-1 overflow-auto bg-white">
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                        <TableRow>
                            <TableHead>Loại</TableHead>
                            <TableHead>Tên SP</TableHead>
                            <TableHead className="text-right">SL</TableHead>
                            <TableHead className="text-right">Giá nhập</TableHead>
                            <TableHead className="text-right">Thành tiền</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground">Chưa có sản phẩm nào</TableCell></TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.tempId}>
                                    <TableCell className="text-xs font-bold">{item.productType}</TableCell>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.importPrice)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.importPrice)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.tempId)} className="text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="p-4 border-t bg-slate-50">
                <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-sm" onClick={handleSubmit} disabled={items.length === 0}>
                    <Send className="mr-2 h-5 w-5" /> Gửi duyệt phiếu nhập
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
}