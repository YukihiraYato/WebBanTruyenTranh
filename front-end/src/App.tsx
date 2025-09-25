import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Box, Typography } from "@mui/material";
import  BookDetailsPage  from "./pages/BookDetails/";
import { ProfileUser } from "./pages/ProfileUser";
import CategoryPage from "./pages/Category";
import { Checkout } from "./pages/Checkout";
import { useMemo } from "react";
import { NavBar } from "./components/NavBar";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import Search from "./pages/Search";
import OrderDetail from "./components/Order/OrderDetail";
import ChatBox from "./components/Popup/Chat/ChatBox";

function App() {
  const CheckoutLayout = useMemo(() => {
    return (
      <>
        <NavBar />
        <Box component="main">
          <Outlet />
        </Box>
      </>
    );
  }, []);

  const MainLayout = useMemo(() => {
    return (
      <>
        <NavBar />
        <Box component="main">
          <Outlet />
        </Box>
        <Footer />
      </>
    );
  }, []);
  return (
    <>
      <Routes>
        <Route element={MainLayout}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/details" element={<BookDetailsPage />} />
          <Route path="/details/:id/*" element={<BookDetailsPage />} />
          <Route path="/home" Component={Home} />
          <Route path="/profileUser/*" Component={ProfileUser} />
          <Route
            path="/profileUser/orders/view/order_id/:orderId"
            Component={OrderDetail}
          />
          <Route
            path="*"
            element={
              <Box>
                <Typography>Không tồn tại</Typography>
              </Box>
            }
          />
          <Route path="/category/*" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" Component={Search} />
        </Route>
        <Route element={CheckoutLayout}>
          <Route path="/checkout" Component={Checkout} />
        </Route>
      </Routes>

        <ChatBox
        botAvatar="https://my-upload-for-essay.s3.ap-southeast-2.amazonaws.com/LogoWeb/Logo+Web.PNG"
        userAvatar="https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/470603037_122095130258696709_4944030787428531367_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=YXXXbeOc9tcQ7kNvwELjeTC&_nc_oc=AdmRudJsBHkQ4szIOAxpgs168j-l0kkS77u72hCTMZhUpjiEsG8cGzueTovuCtD3yXg&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=Ashg3Zj2WucQcsEUAT7ogA&oh=00_AfYze55MgHoyyxBrpTLs41zJ-2etO_YHDvFOqz6akpujAg&oe=68D34737"
        width={360}
        height={500}
      />
    
    </>
  );
}

export default App;
