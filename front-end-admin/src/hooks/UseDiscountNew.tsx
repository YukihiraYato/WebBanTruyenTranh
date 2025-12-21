import { useState } from "react";



export interface UseDiscountNewProps {
    code: string;
    title: string;
    description: string;
    discountType: string;
    value: string;
    targetType: string;
    minOrderAmount: number;
    usageLimit: number;
    useCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    categoryIds: number[];
    setCategoryIds: (ids: number[]) => void;
    userRank: string;
    setUserRank: (userRank: string) => void;
    usersageLimitPerUser: number;
    setUsageLimitPerUser: (limit: number) => void;
}

export function useDiscountNew() {
    const [code, setCode] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [discountType, setDiscountType] = useState<string>('PERCENT');
    const [value, setValue] = useState<string>("0");
    const [targetType, setTargetType] = useState<string>('ORDER');
    const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
    const [usageLimit, setUsageLimit] = useState<number>(-1);
    const [useCount, setUseCount] = useState<number>(-1);
    const [usageLimitPerUser, setUsageLimitPerUser] = useState<number>(-1);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [userRank, setUserRank] = useState<string>('');
        const [pointCost, setPointCost] = useState<number>(0);
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
        setIsActive,
        categoryIds,
        setCategoryIds,
        userRank,
        setUserRank,
        usageLimitPerUser,
        setUsageLimitPerUser,
        pointCost,
        setPointCost
    };
}