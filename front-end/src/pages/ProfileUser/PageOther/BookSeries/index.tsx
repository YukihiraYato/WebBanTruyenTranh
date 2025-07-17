import React, { useState, useMemo, useEffect, useRef, use } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Grid2,
  TextField
} from "@mui/material";
import PropTypes from "prop-types";
import BookSeriesDetails from "./BookSeriesDetails";
import { NewBookCollectionDialog } from "~/pages/BookDetails/SaveBookDialog/NewBookCollectionDialog";
import { useBookCollection } from "~/providers/BookCollectionProvider";
import { CollectionCard } from "~/components/CollectionCard";
import { SwipeProvider } from "~/context/CollectionContext";
import Pagination from "@mui/material/Pagination";
import { getUserDetails } from "~/api/user/userDetails";
import SearchIcon from "@mui/icons-material/Search";
// Dropdown sắp xếp
function SortSelect({ sortBy, onSortChange, onCreateNewBookCollection, searchKeyword,onSearchChange }) {

  return (
    <Box sx={{ minWidth: 120, display: "flex", justifyContent: "space-between", alignItems: "left", gap: 1, marginBottom: 2 }}>
      <Button
        onClick={onCreateNewBookCollection}
        sx={{ minWidth: 120 }}>Tạo bô sách mới</Button>
          <TextField
    size="small"
    placeholder="Tìm kiếm tên bộ sách..."
    value={searchKeyword}
    onChange={(e) => onSearchChange(e.target.value)}
    InputProps={{
      startAdornment: <SearchIcon sx={{ mr: 1 }} />,
    }}
    sx={{ width: 250 }}
  />

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="sort-label">Sắp xếp</InputLabel>
        <Select
          labelId="sort-label"
          label="Sắp xếp"
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
        >
          <MenuItem value="az">A → Z</MenuItem>
          <MenuItem value="za">Z → A</MenuItem>
          <MenuItem value="newest">Mới nhất</MenuItem>
          <MenuItem value="oldest">Cũ nhất</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

SortSelect.propTypes = {
  sortBy: PropTypes.oneOf(["az", "za", "newest", "oldest"]).isRequired,
  onSortChange: PropTypes.func.isRequired
};



// Component chính
export default function BookSeries() {
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { bookCollections, getBookCollectionsForUser, findBookCollectionOfUser } = useBookCollection();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  useEffect(() => {
    // Lấy bộ sưu tập sách của người dùngg
    const fetchBookCollections = async () => {
      const res = await getBookCollectionsForUser({ pageParam: currentPage });
      // Lấy thông tin người dùng
      const userDetails = await getUserDetails();
      localStorage.setItem('fullNameUser', userDetails.result.fullName);
      if (res) {
        setTotalPages(res.totalPages);
      }
    };
    fetchBookCollections();
    console.log("Book collections:", bookCollections);
  }, [currentPage]);
  useEffect(() => {

  }, [bookCollections])

  // Sắp xếp
 const filteredBooks  = useMemo(() => {
  return [...bookCollections]
   .filter((collection) =>
      collection.name.toLowerCase().includes(searchKeyword.toLowerCase())
    )
  .sort((a, b) => {
    switch (sortBy) {
      case "az": return a.name.localeCompare(b.name);
      case "za": return b.name.localeCompare(a.name);
      case "oldest": return a.id - b.id;
      default: return b.id - a.id;
    }
  });
}, [bookCollections, sortBy, searchKeyword]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header + Sort */}
      <Box sx={{ display: "flex", justifyContent: "space-between", flexDirection: "column", mb: 2 }}>
        <SortSelect sortBy={sortBy} onSortChange={setSortBy} onCreateNewBookCollection={() => setIsOpen(true)} searchKeyword={searchKeyword} onSearchChange={setSearchKeyword} />
        <Typography variant="h5">📚 Sách theo bộ</Typography>

      </Box>

      {/* Danh sách bộ sách */}
      <Grid2 container spacing={2}>
        {filteredBooks .map((collection) => (
          <Grid2
            key={collection.id}
            sx={{
              flex: '0 0 20%',
              maxWidth: '20%',
            }}
          >
            <SwipeProvider>
              <CollectionCard {...collection} />
            </SwipeProvider>
          </Grid2>
        ))}
      </Grid2>

      {/* Phân trang */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          color={"primary"}
          count={totalPages}
          page={currentPage + 1}
          onChange={(event, value) => {
            setCurrentPage(value - 1);
            console.log("Current page:", currentPage);

          }
          }

        />
      </Box>

      {/* Chi tiết khi chọn */}
      {/* {selectedSeries && (
        <BookSeriesDetails series={selectedSeries} onClose={() => setSelectedSeries(null)} />
      )} */}
      {/* Popup tạo bộ sách */}
      <NewBookCollectionDialog open={isOpen} onClose={() => {
        setIsOpen(false);
      }} />
    </Box>
  );
}