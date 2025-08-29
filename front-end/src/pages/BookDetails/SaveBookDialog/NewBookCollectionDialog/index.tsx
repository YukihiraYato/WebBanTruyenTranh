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
import { useEffect, useState } from "react";
import { BookCollectionViewToX } from "~/pages/ProfileUser/PageOther/BookSeries/BookSeriesDetails/ListBookCollectionView/";
import { createBookCollection } from "~/api/user/bookCollection";
import CustomSnackbar from "~/components/Popup/Snackbar";
import Pagination from "@mui/material/Pagination";
import { useBookCollection } from "~/providers/BookCollectionProvider";
export interface NewBookCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  bookId?: number;
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

export function NewBookCollectionDialog(props: NewBookCollectionDialogProps) {
  const { bookCollections, getBookCollectionsForUser, createBookCollectionForUser, addBookToCollection } = useBookCollection();
  // Trạng thái bước tạo hay lưu sách vào bộ sách
  const [step, setStep] = useState<"create" | "select">("create");

  const { onClose, open, bookId } = props;
  // Snackbar state
  const [onOpenSnackbar, setOpenSnackbar] = useState(false);
  const [messageSnackbar, setMessageSnackbar] = useState("");
  // Dữ liệu bộ sưu tập phân trang
  const [bookCollection, setBookCollection] = useState<BookCollectionViewToX[]>(bookCollections);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  // Local state để binding vào input
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<boolean>(true);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [listIdBookCollection, setListIdBookCollection] = useState<number[]>([]);
  const [image, setImage] = useState<File | null>(null);

  // Reset khi mở Dialog
  useEffect(() => {
    if (open) {
      if (bookId !== undefined) {
        setStep("select");
        fetchBookCollections(0);
      } else {
        setStep("create");
        setTitle("");
        setDescription("");
        setVisibility(true);
        setCurrentPage(0);
        setImage(null);
      }
    }
  }, [open, bookId]);

  // Fetch danh sách bộ sưu tập
  const fetchBookCollections = async (page: number) => {
    try {
      setIsLoadingCollection(true);
      const res = await getBookCollectionsForUser({ pageParam: page });
      if (res.content) {
        setBookCollection(res.content);
        setTotalPages(res.totalPages);
        setCurrentPage(res.pageable.pageNumber);
        console.log("Danh sách bộ sách:", res.content);
      } else {
        console.error("Lỗi khi lấy danh sách bộ sách:", res);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setIsLoadingCollection(false);
      console.log("Đã lấy xong bộ sách");
    }
  };

  // Tạo bộ sưu tập mới
  const handleCreateCollection = async () => {
 const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description);
    formData.append("isPublic", visibility.toString());
    formData.append("image", image );
    console.log("image", image);
    const res = await createBookCollectionForUser(formData);
    if (res.code === 1000) {
      setMessageSnackbar("Tạo bộ sách thành công!");
      setOpenSnackbar(true);

      // Nếu có bookId thì chuyển sang bước thêm
      if (bookId) {
        await fetchBookCollections(0);
        setStep("select");
        return;
      }
      onClose();
    } else {
      setMessageSnackbar("Tạo bộ sách thất bại!");
      setOpenSnackbar(true);
    }
  };

  // Thêm sách vào bộ sưu tập
  const handleAddBookToCollection = async (collectionId: number) => {
    const res = await addBookToCollection(collectionId, [bookId!]);
    if (res.code === 1000) {
      setMessageSnackbar(res.result);
    } else {
      setMessageSnackbar(res.result);
    }
    setOpenSnackbar(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {step === "create" ? "Tạo bộ sách mới" : "Thêm sách vào bộ sưu tập"}
      </DialogTitle>

      <DialogContent>
        {step === "create" ? (
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
                value={visibility.toString()}
                onChange={(e) => setVisibility(e.target.value === "true")}
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
            <Box display="flex" gap={2} alignItems="center">
              {/* Input ẩn */}
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-image"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                  } else {
                    setImage(null);
                  }
                }}
              />

              {/* Nút chọn ảnh */}
              <label htmlFor="upload-image">
                <Button variant="contained" component="span">
                  Chọn ảnh
                </Button>
              </label>

              {/* TextField hiện tên ảnh */}
              <TextField
                label="Tên file"
                value={image?.name || ""}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                sx={{ width: 300 }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {isLoadingCollection ? (
              <Typography align="center" color="textSecondary" fontStyle="italic" mt={2}>
                Đang tải bộ sưu tập...
              </Typography>
            ) : !bookCollection || bookCollection.length === 0 ? (
              <Typography color="error" textAlign="center" fontWeight="bold" mt={2}>
                {typeof bookId === "number"
                  ? "Hiện chưa có bộ sách nào, hãy tạo thêm bộ sách mới để lưu"
                  : "Lưu bộ sách bị lỗi, vui lòng thử lại sau"}
              </Typography>
            ) : (
              <>
                <Typography fontWeight="bold" mb={1}>
                  Chọn bộ sách để thêm:
                </Typography>

                <Box display="flex" flexDirection="column" gap={1}>
                  {bookCollection.map((item) => (
                    <FormControl key={item.id}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setListIdBookCollection(prev => [...prev, item.id])
                            } else {
                              setListIdBookCollection(prev => prev.filter(id => id != item.id))
                            }
                          }}
                        />
                        <Typography>{item.name}</Typography>
                      </label>
                    </FormControl>
                  ))}
                </Box>

                {totalPages > 1 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      count={totalPages}
                      page={currentPage + 1}
                      onChange={(_, page) => fetchBookCollections(page - 1)}
                      color="primary"
                    />
                  </Box>
                )}

              </>
            )}

          </Box>
        )}
      </DialogContent>

      <DialogActions>

        {step === "select" ? (
          <>
            <Button onClick={() => {
              listIdBookCollection.forEach(id => {
                handleAddBookToCollection(id);
              })
            }}>Lưu</Button>
            <Button onClick={onClose}>Đóng</Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Đóng</Button>
            <Button onClick={handleCreateCollection}>Tạo</Button>
          </>
        )}
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
