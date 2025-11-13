import { Box } from "@mui/material";
import { grey } from "@mui/material/colors";

import { PriceFilter } from "./PriceFilter";
import { MaterialFilter } from "./MaterialFilter";
import { OriginFilter } from "./OriginFilter";
export default function FilterSidebar() {
  return (
    <Box
      p={2}
      border={1}
      borderColor={grey[300]}
      borderRadius={2}
      display="flex"
      flexDirection="column"
      gap={2}
      sx={{
        backgroundColor: "white",
      }}
    >
      <MaterialFilter />
      <OriginFilter />
      <PriceFilter />

    </Box>
  );
}
