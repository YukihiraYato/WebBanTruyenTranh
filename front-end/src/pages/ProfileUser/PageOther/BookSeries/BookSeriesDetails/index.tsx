import React from "react";
import { Box, Typography } from "@mui/material";
import {Grid2} from "@mui/material";
import BookCollectionViewToX from "./ListBookCollectionView"
import BookCollectionDetailView from "./DetailBookCollection";
const BookCollectionLayout: React.FC = () => {
  return (
    <Grid2 container sx={{ height: "100vh", backgroundColor: "#ffffff", color: "#000" }}>
      {/* Sidebar trái */}
      <Grid2
        size= {{ xs:3}}
        sx={{
          backgroundColor: "#b71c1c", // đỏ đậm
          padding: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          color: "#ffffff",
          borderRight: "2px solid #f8f8f8",
        }}
      >
       <Box sx={{ mb: 2 }}>
         {/* <BookCollectionViewToX /> */}
       </Box>
       
   
      </Grid2>

      {/* Nội dung bên phải */}
      <Grid2
        size={{ xs: 9 }}
        sx={{
          padding: 4,
          overflowY: "auto",
          backgroundColor: "#ffffff",
        }}
      >
       {/* Nội dung chính */}
        <Box>
         {/* <BookCollectionDetailView /> */}
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default BookCollectionLayout;
