import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    FormControl,
    styled,
} from "@mui/material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { use, useEffect, useState } from "react";
import CustomSnackbar from "~/components/Popup/Snackbar";
import { useBookCollection } from "~/providers/BookCollectionProvider";
export interface EditBookCollectionDialogProps {
    open: boolean;
    onClose: () => void;
    collectionId: number;
    name: string;
    description: string;
    isPublic: boolean;
    handleRefresh: () => void; // Hàm của component DetailBookCollection để thông báo cập nhật
}

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

export default function EditBookCollectionDialog(props: EditBookCollectionDialogProps) :any {
    const {  updateBookCollectionOfUser } = useBookCollection();

    const { onClose, open } = props;
    // Snackbar state
    const [onOpenSnackbar, setOpenSnackbar] = useState(false);
    const [messageSnackbar, setMessageSnackbar] = useState("");

    // Local state để binding vào input
    const [title, setTitle] = useState(props.name || "");
    const [description, setDescription] = useState(props.description || "");
    const [visibility, setVisibility] = useState<boolean>(props.isPublic || true);
 

    // Reset khi mở Dialog
    useEffect(() => {
        if (open) {
            setTitle(props.name);
            setDescription(props.description);
            setVisibility(props.isPublic);
 }
    }, [open]);


  // Update bộ sách
    const handleUpdateBookCollection = async () => {
    const updatedBookCollection = {  
        name: title,
        description: description,
        isPublic: visibility,
    };
        const res = await updateBookCollectionOfUser(props.collectionId, updatedBookCollection);
        if (res.description) {
            setOpenSnackbar(true);
            setMessageSnackbar("Cập nhật bộ sách thành công");
            setTitle(res.name);
            setDescription(res.description);
            setVisibility(res.public);
            props.handleRefresh(); // Gọi hàm để thông báo cập nhật từ DetailBookCollection
        } else {
            setOpenSnackbar(true);
            setMessageSnackbar("Cập nhật bộ sách thất bại");
        }
    }



    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {"Chỉnh sửa bộ sách"}
            </DialogTitle>

            <DialogContent>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    <TextField
                        label="Tiêu đề bộ sách"
                        variant="standard"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Mô tả"
                        variant="standard"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <FormControl variant="standard">
                        <InputLabel id="visibility-label">Chế độ hiển thị</InputLabel>
                        <Select
                            labelId="visibility-label"
                            value={visibility ? "true" : "false"}
                            onChange={(e) =>{
                                console.log(e.target.value);
                                 setVisibility(e.target.value === "true")
                            }}
                        >
                            <MenuItem value="true">
                                <Box display="flex" gap={2}>
                                    <PublicRoundedIcon />
                                    <Typography>Công khai</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="false">
                                <Box display="flex" gap={2}>
                                    <LockRoundedIcon />
                                    <Typography>Riêng tư</Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>

            </DialogContent>

            <DialogActions>


                <>
                    <Button onClick={onClose}>Đóng</Button>
                    <Button onClick={handleUpdateBookCollection}>Lưu</Button>
                </>

            </DialogActions>

            <CustomSnackbar
                open={onOpenSnackbar}
                onClose={() => setOpenSnackbar(false)}
                message={messageSnackbar}
                severity="success"
                duration={3000}
            />
        </Dialog>
    );
}

