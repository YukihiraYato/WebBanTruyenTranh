import { Box, Typography } from "@mui/material";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import { useCallback, useEffect, useRef } from "react";

import { useRedeemReward } from "~/providers/RedeemRewardProivder";
type GalleryImageType = {
  href: string;
  src: string;
};

type BookGalleryProps = {
  gallery: GalleryImageType[];
};

export function RedeemRewardGallery({ gallery }: BookGalleryProps) {
    const { redeemRewards } = useRedeemReward();
    console.log("2131231231231",redeemRewards);
  const renderGallery = useCallback(() => {
    return gallery.slice(1, gallery.length).map(({ href, src }, index) => (
      <a
        className="gallery"
        key={index}
        href={href}
        style={{ display: `${index <= 4 ? "inline-flex" : "none"}` }}
      >
        <Box
          display={"inline-flex"}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            paddingX: 1,
            justifyItems: "center",
            border: "1px solid grey",
            overflow: "hidden",
            marginX: 0.5,
            position: "relative",
          }}
        >
          <img
            height={"100%"}
            width={"100%"}
            alt={`Ảnh ${index + 1}`}
            src={src}
            style={{ objectFit: "contain" }}
          />
          {index === 4 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography fontWeight={"bold"}>
                + {gallery.length - 7}
              </Typography>
            </Box>
          )}
        </Box>
      </a>
    ));
  }, [gallery]);
  const renderImages = useCallback(() => {
    return redeemRewards?.images.map((image, index) => (
      <a
        className="gallery"
        key={index}
        href={encodeURI(image.imageUrl)}
        style={{ display: `${index <= 4 ? "inline-flex" : "none"}` }}
        data-src={encodeURI(image.imageUrl)}
      >
        <Box
          display={"inline-flex"}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            paddingX: 1,
            justifyItems: "center",
            border: "1px solid grey",
            overflow: "hidden",
            marginX: 0.5,
            position: "relative",
          }}
        >
          <img
            height={"100%"}
            width={"100%"}
            alt={`Ảnh ${index + 1}`}
            src={encodeURI(image.imageUrl)}
            style={{ objectFit: "contain" }}
          />
          {index === 4 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography fontWeight={"bold"}>
                + {gallery.length - 7}
              </Typography>
            </Box>
          )}
        </Box>
      </a>
    ));
  }, [redeemRewards?.images, gallery.length]);
  useEffect(() => {
    lightGallery.current.refresh();
  }, [gallery]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lightGallery = useRef<any>(null);
  
  return (
    
    <LightGallery
      selector={".gallery"}
      onInit={(detai) => (lightGallery.current = detai.instance)}
      speed={500}
      plugins={[lgThumbnail, lgZoom]}
    >
      <Box sx={{ display: "inline-flex", gap: 1, flexDirection: "column" }}>
        <a
          className="gallery"
          href={
            redeemRewards?.images.find((image) => image.isThumbnail)?.imageUrl
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ height: 300, width: 450 }}>
            <img
              alt="Ảnh thumbnail"
              height={"100%"}
              width={"100%"}
              style={{ objectFit: "contain" }}
              src={
                redeemRewards?.images.find((image) => image.isThumbnail)?.imageUrl
              }
            />
          </Box>
        </a>
        <Box sx={{ display: "inline-flex", justifyContent: "center" }}>
          {redeemRewards ? renderImages() : renderGallery()}
        </Box>
      </Box>
    </LightGallery>
  );
}
