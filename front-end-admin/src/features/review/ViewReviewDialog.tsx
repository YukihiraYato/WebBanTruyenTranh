import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Review } from "../../types/review";
import { Star, BookOpen, Layers, User, Calendar, ImageIcon } from "lucide-react";
import { format } from "date-fns";

interface ViewReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review;
}

export function ViewReviewDialog({ open, onOpenChange, review }: ViewReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Tăng độ rộng max-w để chứa vừa ảnh và text */}
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết đánh giá #{review.reviewId}</span>
            <Badge variant={review.targetType === 'BOOK' ? 'default' : 'secondary'}>
              {review.targetType}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-6 p-6 pt-2">
          
          {/* CỘT TRÁI: HÌNH ẢNH SẢN PHẨM */}
          <div className="flex-shrink-0">
            <div className="w-full sm:w-[160px] aspect-[2/3] rounded-lg overflow-hidden border bg-muted flex items-center justify-center relative shadow-sm">
              {review.targetImage ? (
                <img 
                  src={review.targetImage} 
                  alt={review.targetName} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Thông tin Header */}
            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-tight text-primary">
                {review.targetName}
              </h3>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">{review.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(review.reviewDate), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex items-center gap-2 bg-yellow-50/50 w-fit px-3 py-1.5 rounded-md border border-yellow-100">
               <span className="font-semibold text-sm text-yellow-700">Xếp hạng:</span>
               <div className="flex items-center gap-1">
                   <span className="font-bold text-lg text-yellow-600">{review.rating}</span>
                   <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
               </div>
            </div>

            {/* Nội dung Review */}
            <div className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                Nội dung đánh giá:
              </h4>
              <ScrollArea className="h-[200px] w-full rounded-md border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed italic text-gray-700 dark:text-gray-300">
                  "{review.reviewText}"
                </p>
              </ScrollArea>
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}