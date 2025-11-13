import { useState } from "react";
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";

export function MaterialFilter() {
    const { setMaterial } = useRedeemReward();

    const originValues = [
        'Nhựa',
        'Kim Loại',
        'Giấy',
        'Vải',
        'Silicone',
        'Bông',
    ];

    const originKeys = [
        'Nhựa',
        'Kim Loại',
        'Giấy',
        'Vải',
        'Silicone',
        'Bông',
    ];

    const [selectedValue, setSelectedValue] = useState<string>("");

    const handleSelect = (value: string) => {
        if (selectedValue === value) {
            // Nếu chọn lại chính nó → hủy chọn
            setSelectedValue("");
            setMaterial("");
        } else {
            // Chọn mới
            setSelectedValue(value);
            setMaterial(value);
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
