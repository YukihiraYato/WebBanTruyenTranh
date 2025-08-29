import { useState } from "react";



export interface UseDiscountNewProps {
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

export function useDiscountNew() {
    const [code, setCode] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [discountType, setDiscountType] = useState<string>('PERCENT');
    const [value, setValue] = useState<number>(0);
    const [targetType, setTargetType] = useState<string>('ORDER');
    const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
    const [usageLimit, setUsageLimit] = useState<number>(0);
    const [useCount, setUseCount] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);

    return {
        code,
        setCode,
        title,
        setTitle,
        description,
        setDescription,
        discountType,
        setDiscountType,
        value,
        setValue,
        targetType,
        setTargetType,
        minOrderAmount,
        setMinOrderAmount,
        usageLimit,
        setUsageLimit,
        useCount,
        setUseCount,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isActive,
        setIsActive
    };
}