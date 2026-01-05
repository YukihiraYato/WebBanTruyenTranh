import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ViewImportDialog } from './ViewImportDialog';
import { formatCurrency, getStatusColor, getStatusLabel } from "@/utils/stock-utils";
import { getAllReceipts, getReceiptDetails, approveReceipt, cancelReceipt } from '@/api/import_product';

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE PHÂN TRANG & TÌM KIẾM ---
  const [pageIndex, setPageIndex] = useState(0); // Trang hiện tại (bắt đầu từ 0 theo Spring Boot)
  const [pageSize, setPageSize] = useState(10);  // Số dòng mỗi trang
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang server trả về
  const [totalElements, setTotalElements] = useState(0); // Tổng số bản ghi
  const [keyword, setKeyword] = useState(''); // Từ khóa tìm kiếm
  // ------------------------------------

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Hàm gọi API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Chuẩn bị params chuẩn theo Backend
      const params = {
        page: pageIndex,
        size: pageSize,
        keyword: keyword && keyword.trim() || "", // Nếu rỗng thì gửi null
        status: activeTab === 'ALL' ? null : activeTab // Nếu ALL thì gửi null
      };

      const res = await getAllReceipts(params);

      // Giả sử res.result là cấu trúc Page của Spring: { content, totalPages, totalElements, ... }
      if (res.result) {
        setData(res.result.content || []);
        setTotalPages(res.result.totalPages || 0);
        setTotalElements(res.result.totalElements || 0);
      }
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
      // Xử lý lỗi (toast error...)
    }
  };

  // Trigger fetch khi thay đổi Page, Tab, hoặc Size
  // Lưu ý: Không để keyword vào đây để tránh gọi API liên tục khi đang gõ. 
  // Search sẽ được kích hoạt khi bấm Enter hoặc nút Search.
  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, activeTab]);

  // Khi đổi Tab -> Reset về trang đầu
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setPageIndex(0);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setPageIndex(0); // Reset về trang 1 khi tìm kiếm mới
    fetchData();
  };

  // Xử lý khi nhấn Enter ở ô input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenDetail = async (id: number) => {
    try {
      const res = await getReceiptDetails(id);
      // Lưu ý: check xem response trả về object trực tiếp hay bọc trong result
      setSelectedReceipt(res.result ? res.result : res);
      setViewOpen(true);
    } catch (error) {
      console.error("Lỗi tải chi tiết", error);
    }
  };

  const handleApprove = async (id: number) => {
    if (confirm('Bạn chắc chắn muốn duyệt phiếu này? Kho sẽ được cập nhật.')) {
      try {
        await approveReceipt(id);
        alert('Đã duyệt thành công!');
        setViewOpen(false);
        fetchData(); // Reload lại bảng
      } catch (error) {
        alert("Lỗi khi duyệt phiếu");
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Bạn chắc chắn muốn hủy phiếu này?')) {
      try {
        await cancelReceipt(id);
        alert('Đã hủy phiếu.');
        setViewOpen(false);
        fetchData();
      } catch (error) {
        alert("Lỗi khi hủy phiếu");
      }
    }
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">

      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-800">Duyệt Nhập Kho</h2>
          <p className="text-muted-foreground">Kiểm tra và phê duyệt các phiếu nhập từ nhân viên.</p>
        </div>

      </div>

      {/* Filter Tabs & Search */}
      <Tabs value={activeTab} className="space-y-4" onValueChange={handleTabChange}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="PENDING" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
              Chờ duyệt
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Lịch sử đã nhập</TabsTrigger>
            <TabsTrigger value="CANCELLED">Đã từ chối/Hủy</TabsTrigger>
            <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearch} />
              <Input
                placeholder="Tìm mã phiếu hoặc NCC (Enter)..."
                className="pl-8"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="rounded-md border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Người nhập</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center">Đang tải dữ liệu...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center">Không tìm thấy phiếu nhập nào</TableCell></TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.receiptCode}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>{item.supplierName}</TableCell>
                      <TableCell>{item.importerName}</TableCell>
                      <TableCell className="text-right font-bold text-slate-600">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusColor(item.status)} variant="outline">
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDetail(item.id)}>
                          <Eye className="h-4 w-4 mr-1" /> Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* --- PHÂN TRANG (PAGINATION FOOTER) --- */}
          <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-muted-foreground">
              Hiển thị {data.length} trên tổng số {totalElements} kết quả.
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
              {/* Chọn số lượng hiển thị */}
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Dòng mỗi trang</p>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPageIndex(0); // Reset về trang 1 khi đổi size
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Số trang hiện tại */}
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Trang {pageIndex + 1} / {totalPages}
              </div>

              {/* Nút điều hướng */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setPageIndex(0)}
                  disabled={pageIndex === 0}
                >
                  <span className="sr-only">Về trang đầu</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={pageIndex === 0}
                >
                  <span className="sr-only">Trang trước</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={pageIndex >= totalPages - 1} // Vì index bắt đầu từ 0
                >
                  <span className="sr-only">Trang sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => setPageIndex(totalPages - 1)}
                  disabled={pageIndex >= totalPages - 1}
                >
                  <span className="sr-only">Đến trang cuối</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* ------------------------------------ */}

        </TabsContent>
      </Tabs>

      <ViewImportDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        receipt={selectedReceipt}
        onApprove={handleApprove}
        onCancel={handleCancel}
      />
    </div>
  );
}