import { useState } from "react";



export interface UseDiscountUpdateProps {
    id: number;
    code: string;
    title: string;
    description: string;
    discountType: string;
    value: number;
    targetType: string;
    minOrderAmount: number;
    usageLimit: number;
    useCount: number;
    usageLimitPerUser: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    categoryIds: number[];
    setCategoryIds: (ids: number[]) => void;
    userRank: string;
    setUserRank: (userRank: string) => void;
    setUsageLimitPerUser: (limit: number) => void;
    pointCost: number;
    setPointCost: (pointCost: number) => void;
}

export function useDiscountUpdate() {
    const [id, setId] = useState<number>(0);
    const [code, setCode] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [discountType, setDiscountType] = useState<string>('PERCENT');
    const [value, setValue] = useState<number>(0);
    const [targetType, setTargetType] = useState<string>('ORDER');
    const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
    const [usageLimit, setUsageLimit] = useState<number>(-1);
    const [useCount, setUseCount] = useState<number>(-1);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    const [userRank, setUserRank] = useState<string>('');
    const [usageLimitPerUser, setUsageLimitPerUser] = useState<number>(-1);
    const [pointCost, setPointCost] = useState<number>(0);
    return {
        id,
        setId,
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