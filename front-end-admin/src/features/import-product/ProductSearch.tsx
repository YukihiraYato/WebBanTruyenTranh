import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useInView } from 'react-intersection-observer';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
// Import Interface và Hàm API mới
import { searchProductsForImport as searchProductsByName } from "@/api/import_product";

interface ProductSearchProps {
    type: 'BOOK' | 'REDEEM_REWARD';
    onSelect: (product: ProductResponse) => void;
}

export interface ProductResponse {
    bookId: number;
    title: string;
    price: number;
    quantityInStock: number;
    imageUrl: string;
    typePurchase: string;
}
export function ProductSearch({ type, onSelect }: ProductSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    // Reset khi đổi loại
    useEffect(() => {
        setQuery("");
        setProducts([]);
    }, [type]);
    const { ref, inView } = useInView();
    useEffect(() => {
        setQuery("");
        setProducts([]);
        setPage(0);
        setHasMore(true);
    }, [type]);
    const fetchProducts = async (isNewSearch: boolean, searchPage: number, searchQuery: string) => {
        setLoading(true);
        try {
            const data = await searchProductsByName(searchQuery, type, searchPage);

            if (isNewSearch) {
                setProducts(data.content);
            } else {
                setProducts(prev => [...prev, ...data.content]);
            }

            // Kiểm tra xem đã hết dữ liệu chưa (dựa vào field 'last' của Page Spring Boot)
            setHasMore(!data.last);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Xử lý khi người dùng GÕ TỪ KHÓA (Debounce)
    useEffect(() => {
        if (!query.trim()) {
            setProducts([]);
            return;
        }

        // Reset lại page về 0 khi gõ từ mới
        setPage(0);
        setHasMore(true);

        const timer = setTimeout(() => {
            fetchProducts(true, 0, query); // true = là search mới
        }, 300);

        return () => clearTimeout(timer);
    }, [query, type]);


    // 2. Xử lý khi SCROLL XUỐNG ĐÁY (Lazy Load)
    useEffect(() => {
        // Chỉ load thêm nếu: đang nhìn thấy đáy + còn dữ liệu + không đang load + có từ khóa
        if (inView && hasMore && !loading && query.trim()) {
            const nextPage = page + 1;
            fetchProducts(false, nextPage, query); // false = là append cũ
            setPage(nextPage);
        }
    }, [inView]);


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto py-2"
                >
                    <span className="truncate text-left">
                        {query ? query : `Tìm ${type === 'BOOK' ? 'sách' : 'quà'}...`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[450px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={type === 'BOOK' ? "Nhập tên sách..." : "Nhập tên quà tặng..."}
                        value={query}
                        onValueChange={setQuery}
                    />

                    {/* CommandList mặc định có max-height và overflow-y-auto */}
                    <CommandList className="max-h-[300px] overflow-y-auto">

                        {!loading && products.length === 0 && query && (
                            <CommandEmpty>Không tìm thấy sản phẩm nào.</CommandEmpty>
                        )}

                        {products.length > 0 && (
                            <CommandGroup heading="Kết quả tìm kiếm">
                                {products.map((product) => (
                                    <CommandItem
                                        key={product.bookId}
                                        value={product.title}
                                        onSelect={() => {
                                            onSelect(product);
                                            setQuery(product.title);
                                            setOpen(false);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                query === product.title ? "opacity-100" : "opacity-0"
                                            )}
                                        />

                                        <div className="flex items-center gap-3 w-full">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded border bg-slate-100">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt="img"
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                        <ImageOff className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <span className="font-medium text-sm truncate">{product.title}</span>
                                                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                    <span className="bg-slate-100 px-1 rounded">ID: {product.bookId}</span>
                                                    <span>|</span>
                                                    <span className={product.quantityInStock === 0 ? "text-red-500 font-bold" : "text-green-600"}>
                                                        SL: {product.quantityInStock}
                                                    </span>
                                                    <span>|</span>
                                                    <span className="text-blue-600 font-medium">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* --- ELEMENT "MỒI" ĐỂ KÍCH HOẠT LOAD MORE --- */}
                        {hasMore && query && products.length > 0 && (
                            <div ref={ref} className="py-2 flex justify-center w-full">
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                    <span className="text-xs text-muted-foreground h-4"></span> // Spacer rỗng để trigger
                                )}
                            </div>
                        )}

                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}