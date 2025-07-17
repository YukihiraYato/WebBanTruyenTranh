import { BookCollectionViewToX } from "~/pages/ProfileUser/PageOther/BookSeries/BookSeriesDetails/ListBookCollectionView/";
import Tippy from "@tippyjs/react";
import {NewBookCollectionDialog} from "~/pages/BookDetails/SaveBookDialog/NewBookCollectionDialog";
import { useState, MouseEvent } from "react";
import { Box, List, ListItemButton } from "@mui/material";

export default function BookCardHorizontalView({
  bookCollection,
}: {
  bookCollection: BookCollectionViewToX;
 
}) {
  const [isOpen, setIsOpen] = useState(false); // Dialog sửa thông tin
  const [showMenu, setShowMenu] = useState(false); // Toggle Tippy menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleRightClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget);
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <>
      {/* Tippy menu chuột phải */}
      <Tippy
        visible={showMenu}
        interactive
        placement="right"
        onClickOutside={handleCloseMenu}
        content={
          <Box sx={{ bgcolor: "white", borderRadius: 1, boxShadow: 3, width: 140 }}>
            <List dense disablePadding>
              <ListItemButton
                onClick={() => {
                  setIsOpen(true);
                  handleCloseMenu();
                }}
              >
                📝 Sửa thông tin
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  // TODO: xử lý xóa sau
                  alert(`Xóa "${bookCollection.name}"`);
                  handleCloseMenu();
                }}
              >
                ❌ Xoá
              </ListItemButton>
            </List>
          </Box>
        }
      >
        {/* Card sách */}
        <div
          onClick={() =>{} }
          onContextMenu={handleRightClick}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          <img
            src={bookCollection.converImage ?? ""}
            alt={bookCollection.name}
            style={{ width: "80px", height: "120px", marginRight: "16px" }}
          />
          <div>
            <h3 style={{ margin: 0 }}>{bookCollection.name}</h3>
            <p style={{ margin: 0, color: "#666" }}>
              {"Ngày tạo: " + bookCollection.createdDate}
            </p>
          </div>
        </div>
      </Tippy>

      {/* Dialog sửa bộ sách */}
      <NewBookCollectionDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        bookCollection={bookCollection}
      />
    </>
  );
}
