import { useNavigate } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { AccountCircle, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  LocalShipping,
  CardGiftcard,
  LocalOffer,
  Notifications,
  Favorite,
  MenuBook,
  RateReview,
} from "@mui/icons-material";
import { red } from "@mui/material/colors";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Fragment } from "react";
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import UserRankCard from "../ProfileSections/CardUserRank/index.tsx";
export default function SidebarMenu({
  selected,
  setSelected,
  openAccount,
  setOpenAccount,
  currentPath,
}) {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openWbpoint, setOpenWbpoint] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const handleClick = (path: string) => {
    navigate(`/profileUser/${path}`);
  };
  const accountItems = [
    { label: `${(t('page.profileUser.profileSection.acccountItem.item1'))}`, path: "info/account" },
    { label: `${(t('page.profileUser.profileSection.acccountItem.item2'))}`, path: "info/address" },
    { label: `${(t('page.profileUser.profileSection.acccountItem.item3'))}`, path: "info/password" },
    { label: `${(t('page.profileUser.profileSection.acccountItem.item4'))}`, path: "info/invoice" },
    { label: `${(t('page.profileUser.profileSection.acccountItem.item5'))}`, path: "info/privileges" },
  ];
  //  submenu cho account-wbpoint
  const wbpointItems = [
    { label: "Trang chủ", path: "account-wbpoint/overview" },
    { label: "Lịch sử sử dụng Wb-Point", path: "account-wbpoint/history" },
    // { label: t('page.profileUser.profileSection.wbpointItem.item3'), path: "account-wbpoint/redeem" },
  ];
  const refundItems = [
    { label: "Chính sách đổi trả", path: "refund/rule" },
    { label: "Yêu cầu đổi trả", path: "refund/request" },
  ];
  const otherItems = [
    { label: `${(t('page.profileUser.profileSection.otherItem.item1'))}`, icon: <LocalShipping />, path: "orders" },
    { label: `${(t('page.profileUser.profileSection.otherItem.item2'))}`, icon: <CardGiftcard />, path: "vouchers" },
    { label: `${(t('page.profileUser.profileSection.otherItem.item3'))}`, icon: <LocalOffer /> },
    { label: `${(t('page.profileUser.profileSection.otherItem.item4'))}`, icon: <Notifications />, path: "notifications" },
    { label: `${(t('page.profileUser.profileSection.otherItem.item5'))}`, icon: <Favorite />, path: "wishlist" },
    { label: `${(t('page.profileUser.profileSection.otherItem.item6'))}`, icon: <MenuBook />, path: "book-series" },
    { label: `${(t('page.profileUser.profileSection.otherItem.item7'))}`, icon: <RateReview />, path: "review" },
    { label: "Quản lý đổi trả", icon: <AssignmentReturnedIcon /> },
  ];

  return (
    <Box width={280} bgcolor="#fff" p={2}>
      <Box textAlign="center" mb={2}>
        <UserRankCard  />
       
      </Box>
      <Divider />
      <List disablePadding>
        {/* Account info expand */}
        <ListItemButton
          onClick={() => setOpenAccount(!openAccount)}
          sx={{ pl: 1.5 }}
        >
          <ListItemIcon>
            <AccountCircle color="action" />
          </ListItemIcon>
          <ListItemText
            primary={t('page.profileUser.profileSection.otherItem.item0')}
            primaryTypographyProps={{
              fontWeight: "medium",
              color: accountItems.includes(selected) ? red[700] : "inherit",
            }}
          />
          {openAccount ? (
            <ExpandLess sx={{ color: "#d70018" }} />
          ) : (
            <ExpandMore />
          )}
        </ListItemButton>
        <Collapse in={openAccount} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 4 }}>
            {accountItems.map((item) => (
              <ListItemButton
                key={item.path}
                sx={{ py: 0.5, pl: 0 }}
                onClick={() => {
                  setSelected(item.label);
                  handleClick(item.path);
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: selected === item.label ? red[700] : "inherit",
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
        {/* --- Other section --- */}
        {otherItems.map((item, idx) => {
          if (item.label === t('page.profileUser.profileSection.otherItem.item3')) {
            // 👇 nhóm xổ xuống cho account-wbpoint
            return (
              <Fragment key={idx}>
                <ListItemButton onClick={() => setOpenWbpoint(!openWbpoint)} sx={{ pl: 1.5 }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      color: openWbpoint ? red[700] : "inherit",
                    }}
                  />
                  {openWbpoint ? (
                    <ExpandLess sx={{ color: "#d70018" }} />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItemButton>
                <Collapse in={openWbpoint} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 4 }}>
                    {wbpointItems.map((sub) => (
                      <ListItemButton
                        key={sub.path}
                        sx={{ py: 0.5 }}
                        onClick={() => {
                          setSelected(sub.label);
                          handleClick(sub.path);
                        }}
                      >
                        <ListItemText
                          primary={sub.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                            color: selected === sub.label ? red[700] : "inherit",
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Fragment>
            );
          }
          if (item.label === "Quản lý đổi trả") {
            return (
              <Fragment key={idx}>
                <ListItemButton onClick={() => setOpenRefund(!openRefund)} sx={{ pl: 1.5 }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      color: openRefund ? red[700] : "inherit",
                    }}
                  />
                  {openRefund ? (
                    <ExpandLess sx={{ color: "#d70018" }} />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItemButton>
                <Collapse in={openRefund} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 4 }}>
                    {refundItems.map((sub) => (
                      <ListItemButton
                        key={sub.path}
                        sx={{ py: 0.5 }}
                        onClick={() => {
                          setSelected(sub.label);
                          handleClick(sub.path);
                        }}
                      >
                        <ListItemText
                          primary={sub.label}
                          primaryTypographyProps={{
                            fontSize: 14,
                            color: selected === sub.label ? red[700] : "inherit",
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Fragment>
            )
          }

          // còn lại render bình thường
          return (
            <ListItemButton
              key={idx}
              sx={{ pl: 1.5 }}
              onClick={() => {
                setSelected(item.label);
                handleClick(item.path);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  color: selected === item.label ? red[700] : "inherit",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
