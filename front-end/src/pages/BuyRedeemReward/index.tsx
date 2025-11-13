import { Container } from "@mui/material";
import { Grid2 } from "@mui/material";
import RedeemRewardList from "./RedeemRewardList";
import FilterSidebar from "./FilterSidebar";

function RedeemRewardPage() {
  return (
    <>
     
        <Container
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              {/* <FilterSidebar /> */}
              <FilterSidebar />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 9 }}>
              <RedeemRewardList />
            </Grid2>
          </Grid2>
        </Container>
     
    </>
  );
}

export default RedeemRewardPage;
