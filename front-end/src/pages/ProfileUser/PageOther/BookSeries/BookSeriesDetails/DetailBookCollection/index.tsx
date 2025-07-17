import {
  Box,
  Typography,
  Avatar,
  Chip,
  Pagination,
  Grid,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import BookCollectionViewToX from "~/components/CollectionCardHorizontalView";
import { useBookCollection } from "~/providers/BookCollectionProvider";
import { useParams } from "react-router-dom";
import { BookCard } from "~/components/BookCard";
import EditIcon from '@mui/icons-material/Edit';
import IosShareIcon from '@mui/icons-material/IosShare';
import { getUserDetails } from "~/api/user/userDetails";
import EditBookCollectionDialog from "~/pages/BookDetails/SaveBookDialog/EditBookCollectionDialog";
import { Swiper, SwiperSlide } from "swiper/react";
interface Book {
  bookId: number,
  title: string,
  originalPrice: number,
  discountPercentage: number,
  discountedPrice: number,
  averageRating: number,
  thumbnail: string
}

export interface BookCollectionDetailViewProperties {
  name: string;
  description: string;
  createdDate: string;
  creator: string;
  isPublic: boolean;
  coverImage: string;
  books: Book[];
}

export default function BookCollectionDetailView() {
  const id = useParams<{ collectionId: string }>()?.collectionId;
  const [idBookCollection, setIdBookCollection] = useState<number>(
    id ? parseInt(id) : -1
  );
  const [listBook, setListBook] = useState<Book[]>([]);
  const { getListBookFromCollection, book } = useBookCollection();
  const [fullNameUser, setFullNameUser] = useState<string>("");
  const [isOpenUpdateBookColectionDialog, setIsOpenUpdateBookColectionDialog] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  // const [creator, setCreator] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [userIdOfBookCollection, setUserIdOfBookCollection] = useState<number>(-1);
  const [userIdCurrent, setUserIdCurrent] = useState<number>(-1);
  //state để thông báo update thông tin bộ sách từ Dialog
  const [updateInfoBookCollection, setUpdateInfoBookCollection] = useState(false)
  // hàm để cập nhập lại trạng thái của Dialog
  const handleRefresh = () => {
    setUpdateInfoBookCollection(!updateInfoBookCollection); // 
  };

  const shareBookCollection = () => {
    if (isPublic) {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          alert('Đã copy link chia sẻ vào clipboard!');
        })
    } else {
      alert('Bộ sưu tập này là riêng tư, không thể chia sẻ!');
    }


  }
  useEffect(() => {
    const fetchBookCollectionDetails = async () => {
      try {
        const bookCollectionDetails = await getListBookFromCollection(idBookCollection);
        const userDetails = await getUserDetails();
        if (userDetails) {
          setUserIdCurrent(userDetails.result.userId);
        }
        setUserIdOfBookCollection(bookCollectionDetails.userId);
        console.log("Book collection details:", bookCollectionDetails);
        setFullNameUser(bookCollectionDetails.userName);
        setListBook(bookCollectionDetails.books);
        setName(bookCollectionDetails.name);
        setDescription(bookCollectionDetails.description);
        setCreatedDate(bookCollectionDetails.createdDate);
        // setCreator(bookCollectionDetails.creator);
        // Dùng !! để chuyển sang kiểu boolean
        setIsPublic(bookCollectionDetails.isPublic);
        // setCoverImage(bookCollectionDetails.coverImage);
      } catch (error) {
        console.error("Error fetching book collection details:", error);
      }
    };
    fetchBookCollectionDetails();
  }, [idBookCollection, updateInfoBookCollection]);

  useEffect(() => {
    setListBook(book);
  }, [book])
  return (
    <Box sx={{ px: 4, py: 3, bgcolor: "#ffffff" }}>
      <Grid container spacing={4}>

        {/* BÊN PHẢI - Nội dung chi tiết */}
        <Grid item xs={12} md={12}>
          {/* Phần đầu */}
          <Box display="flex" gap={3} alignItems="center" mb={4}>
            <Box
              sx={{
                width: 160,
                height: 160,
                backgroundColor: "#eee",
                // backgroundImage: `url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 2,
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {/* <Avatar sx={{ width: 28, height: 28 }}>{creator[0]}</Avatar> */}
                <Typography fontSize={14}>Người tạo: {fullNameUser}</Typography>
                <Typography fontSize={14} color="gray">
                  • {createdDate}
                </Typography>
              </Box>
              <Chip
                label={isPublic ? "Công khai" : "Riêng tư"}
                color={isPublic ? "success" : "default"}
                size="small"
              />
              <Typography fontSize={14} mt={1} color="text.secondary">
                {description}
              </Typography>
              <Box mt={2} display="flex" gap={1} alignItems="left">
                {userIdCurrent === userIdOfBookCollection && (
                  <EditIcon
                    onClick={() => {
                      setIsOpenUpdateBookColectionDialog(true)
                      console.log("idBookCollection", idBookCollection)
                      console.log("isOpenUpdateBookColectionDialog", isOpenUpdateBookColectionDialog)
                      console.log("name", name)
                      console.log("description", description)

                    }}
                    sx={{
                      ':hover': {
                        cursor: 'pointer',
                        color: 'primary.main'
                      }
                    }}
                  />
                )}
                <IosShareIcon
                  onClick={shareBookCollection}
                  sx={{
                    ':hover': {
                      cursor: 'pointer',
                      color: 'primary.main'
                    }
                  }}></IosShareIcon>
              </Box>
              <EditBookCollectionDialog
                open={isOpenUpdateBookColectionDialog}
                onClose={() => setIsOpenUpdateBookColectionDialog(false)}
                collectionId={idBookCollection}
                name={name}
                description={description}
                isPublic={isPublic}
                handleRefresh={handleRefresh}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Danh sách sách */}
          <Typography variant="h6" gutterBottom>
            Danh sách sách trong bộ
          </Typography>

          <Box width="100%"  maxWidth="1200px" mx="auto">
            <Swiper
              loop={true}
              slidesPerView={4}
              spaceBetween={5}
              grabCursor
              style={{ width: "auto" }} // Đảm bảo swiper chiếm đủ cha
            >
              {listBook?.map((book) => (
                <SwiperSlide  key={book.bookId}>
                  <BookCard
                    card={{
                      ...book,
                      discountPrice: book.discountedPrice,
                      originallPrice: book.originalPrice,
                      isRemoved: userIdCurrent === userIdOfBookCollection,
                      idBookCollection: idBookCollection,
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>



        </Grid>
      </Grid>
    </Box>
  );
}
