import { Carousel } from "./Carousel";
import { Container } from "@mui/material";
import { LightNovel } from "./LightNovel";
import { Collection } from "./Collection";
import { TopWeekly } from "./TopWeekly";
import { HomeProvider } from "~/context/HomeContext";
import { Manga } from "./Manga";
import { useCart } from "~/providers/CartProvider";
import { useEffect } from "react";
export function Home() {
  const { fetchCart } = useCart();
  useEffect(()=>{
    fetchCart();
  },[])
  return (
    <HomeProvider>
      <Container
        sx={{ marginTop: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Carousel />
        <LightNovel />
        <Manga />
        {/* <Collection /> */}
        <TopWeekly />
      </Container>
    </HomeProvider>
  );
}
