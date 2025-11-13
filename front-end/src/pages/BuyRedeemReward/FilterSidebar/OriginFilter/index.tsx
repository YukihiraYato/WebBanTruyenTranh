import { useState } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";

export function OriginFilter() {
    const { setOrigin } = useRedeemReward();

    const originValues = [
        'Trung Quốc',
        'Việt Nam',
        'Thương Hiệu Mỹ',
        'Thương Hiệu Thụy Điển',
        'Thương Hiệu Canada',
        'Thương Hiệu NewZealand',
        'Thương Hiệu Tây Ban Nha',
        'Thương Hiệu Singapore'
    ];

    const originKeys = [
        'Trung Quốc',
        'Việt Nam',
        'Thương Hiệu Mỹ',
        'Thương Hiệu Thụy Điển',
        'Thương Hiệu Canada',
        'Thương Hiệu NewZealand',
        'Thương Hiệu Tây Ban Nha',
        'Thương Hiệu Singapore'
    ];

    const [selectedValue, setSelectedValue] = useState<string>("");

    const handleSelect = (value: string) => {
        if (selectedValue === value) {
            // Nếu chọn lại chính nó → hủy chọn
            setSelectedValue("");
            setOrigin("");
        } else {
            // Chọn mới
            setSelectedValue(value);
            setOrigin(value);
        }
    };

    return (
        <Box>
            <Typography fontWeight={700} fontSize={16} color={grey[800]} mb={1}>
                Giá
            </Typography>
            {originKeys.map((label, index) => (
                <FormControlLabel
                    key={originValues[index]}
                    control={
                        <Checkbox
                            checked={selectedValue === originValues[index]}
                            onChange={() => handleSelect(originValues[index])}
                        />
                    }
                    label={label}
                    sx={{ display: "block" }}
                />
            ))}
        </Box>
    );
}
