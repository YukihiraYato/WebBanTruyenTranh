import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  List,
  ListItemButton,
  Button
} from "@mui/material";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import SearchIcon from "@mui/icons-material/Search";
import { useInfiniteQuery } from "@tanstack/react-query";
import {getUserBookCollections} from "~/api/user/bookCollection"
import BookCardHorizontalView from "~/components/CollectionCardHorizontalView";
import { useInView } from "react-intersection-observer";
const filterOptions = [
  "Gần đây",
  "Thứ tự chữ cái từ A-Z",
  "Thứ tự chữ cái từ Z-A",
  
];
export interface BookCollectionViewToX {
    id : number;
    name: string;
    converImage: string | null;
    createdDate: string;
    description: string | null;
    isPublic: boolean;
}

export function ListBookCollectionView() {
  const [selectedFilter, setSelectedFilter] = useState("Gần đây");
  const { ref, inView } = useInView();

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isError
} = useInfiniteQuery({
  queryKey: ["bookCollections"],
  queryFn: getUserBookCollections,
  getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
  initialPageParam: 0,
});

const isEmpty :boolean =
  data?.pages.length === 1 && data.pages[0].content.length === 0;


useEffect(() => {
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  return (
    <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", height: "100%" }}>
      {/* Hàng tìm kiếm + lọc */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <TextField
          placeholder="Tìm kiếm tên bộ sách"
          size="small"
          sx={{ width: "60%" }}
        />
        <Button
        variant="contained"
        size="small"
        disableTouchRipple
        color="error"
        sx={{
          paddingY: "4px",
          display: {
            xs: "none",
            md: "flex",
          },
          alignItems: "center",
        }}
        onClick={() => {
          // Xử lý tìm kiếm ở đây
        }}
      >
        <SearchIcon fontSize="small" />
      </Button>

        <Tippy
          content={
            <List dense sx={{ bgcolor: "#fff", borderRadius: 1, boxShadow: 2 }}>
              {filterOptions.map((option) => (
                <ListItemButton
                  key={option}
                  selected={option === selectedFilter}
                  onClick={() => setSelectedFilter(option)}
                >
                  {option}
                </ListItemButton>
              ))}
            </List>
          }
          interactive
          placement="bottom-start"
        >
          <Box
            sx={{
              cursor: "pointer",
              px: 2,
              py: 1,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: 1,
              ":hover": {
                backgroundColor: "#eee",
              },
            }}
          >
            {selectedFilter}
          </Box>
        </Tippy>
      </Box>

      {/* Hàng tiêu đề */}
      <Typography variant="h4" gutterBottom color="error" fontWeight="bold">
        Danh sách bộ sách của bạn
      </Typography>
                           {/* Danh sách bộ sách */}
<Box>
  {isError ? (
    <Typography color="error" sx={{ mt: 4 }}>
      Có lỗi xảy ra khi tải danh sách bộ sách. Vui lòng thử lại sau.
    </Typography>
  ) : isEmpty ? (
    <Typography variant="body1" sx={{ mt: 4 }}>
      Bạn chưa có bộ sưu tập sách nào.
    </Typography>
  ) : (
    <>
      {data?.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.content.map((collection: BookCollectionViewToX) => (
            <Box key={collection.id} sx={{ mb: 2 }}>
              <BookCardHorizontalView bookCollection={collection} />
            </Box>
          ))}
        </React.Fragment>
      ))}
      {/* Element để trigger scroll detection */}
      <div ref={ref}></div>
    </>
  )}
</Box>
</Box>
  );
}
