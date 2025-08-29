import { useState } from 'react';
import { DiscountResponse } from '@/types/discount'
export function useDiscount() {
    const [listDiscount, setListDiscount] = useState<DiscountResponse[]>([]);
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10)
    const [totalPages, setTotalPages] = useState<number>(1);


    return {
      
        listDiscount, setListDiscount,
        page, setPage,
        size, setSize,
        totalPages, setTotalPages
      
    };
}