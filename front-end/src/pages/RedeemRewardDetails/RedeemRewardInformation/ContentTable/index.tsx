import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";
import { Box, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

function createData(name: string, value: string) {
  return { name, value };
}

export function ContentTable() {
   const { redeemRewards } = useRedeemReward();
  const { t } = useTranslation();

  const detailsRows = redeemRewards
    ? [
        createData(t('Id: '), redeemRewards.rewardId.toString()),
        createData(t('Màu sắc'), redeemRewards.color),
        createData(t('Kích cỡ'), redeemRewards.size),
        createData(t('Vật liệu'), redeemRewards.material),
        createData(t('Nhà cung cấp'), redeemRewards.supplier),
        createData(t('Xản suất tại'), redeemRewards.manufacturedIn),
        createData(t('Nguồn gốc'), redeemRewards.origin),
        createData(t('Trọng lượng'), redeemRewards.weight),
        createData(t('Chi tiết sản phẩm'), redeemRewards.description),
      ]
    : [];

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 650 }}>
        <TableBody>
          {redeemRewards ? (
            detailsRows.map((row) => (
              <TableRow key={row.name} sx={{ border: 0 }}>
                <TableCell
                  component="th"
                  scope="row"
                  width={200}
                  sx={{ fontWeight: "medium" }}
                >
                  {row.name}
                </TableCell>
                <TableCell align="left">{row.value}</TableCell>
              </TableRow>
            ))
          ) : (
            <>
              {[...Array(7)].map((_, index) => (
                <Box key={index} sx={{ width: "100%", gap: 2, display: "flex" }}>
                  <Skeleton variant="text" sx={{ flex: 1 }} />
                  <Skeleton variant="text" sx={{ flex: 1 }} />
                </Box>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
