import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Printer } from "lucide-react";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/utils/stock-utils";

// Import Types...

interface ViewImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: any; // Thay bằng ImportReceiptResponse Type của bạn
  onApprove: (id: number) => void;
  onCancel: (id: number) => void;
}

export function ViewImportDialog({ open, onOpenChange, receipt, onApprove, onCancel }: ViewImportDialogProps) {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-full">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="text-xl">Phiếu nhập: {receipt.receiptCode}</DialogTitle>
            <Badge className={getStatusColor(receipt.status)} variant="outline">
              {getStatusLabel(receipt.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Thông tin Header */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground">Nhà cung cấp:</span>
              <p className="font-medium">{receipt.supplierName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Người nhập:</span>
              <p className="font-medium">{receipt.importerName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ngày tạo:</span>
              <p className="font-medium">{new Date(receipt.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ghi chú:</span>
              <p className="italic">{receipt.note || "Không có"}</p>
            </div>
          </div>

          {/* Bảng chi tiết */}
          <div className="font-semibold text-sm mt-2">Danh sách sản phẩm:</div>
          <div className="border rounded-md h-[300px] overflow-hidden flex flex-col">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">Giá nhập</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {receipt.details.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">#{item.productId}</TableCell>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{item.productType}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.importPrice)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="flex justify-end items-center mt-2 p-2 bg-slate-50 rounded border border-dashed">
            <span className="text-muted-foreground mr-2">Tổng giá trị phiếu:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(receipt.totalAmount)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {/* Nút In phiếu (Làm cảnh cho đẹp hoặc làm thật sau này) */}
          <Button variant="outline" className="mr-auto">
            <Printer className="mr-2 h-4 w-4" /> In phiếu
          </Button>

          {/* Chỉ hiện nút duyệt/hủy khi Status là PENDING */}
          {receipt.status === 'PENDING' && (
            <>
              <Button style={{marginRight: "10px"}} variant="destructive" onClick={() => onCancel(receipt.id)}>
                <XCircle className="mr-2 h-4 w-4" /> Hủy phiếu
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onApprove(receipt.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt nhập kho
              </Button>
            </>
          )}

          {receipt.status !== 'PENDING' && (
            <Button variant="secondary" onClick={() => onOpenChange(false)}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}