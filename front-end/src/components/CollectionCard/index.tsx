import { Avatar, Box, Divider, Rating, Tooltip, Typography } from "@mui/material";
import { deepOrange, grey, red } from "@mui/material/colors";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import { useSwipe } from "~/context/CollectionContext";
import { useNavigate } from "react-router-dom";
export interface CollectionCardProps {
    id: number,
    name: string,
    description: string,
    coverImage: string,
    public: boolean,
    createdDate: string,
    totalBook: number,
    fullName: string
}
export function CollectionCard(collection: CollectionCardProps) {
    
    const { setAllowSwipe, draggingChild, setDraggingChild } = useSwipe();
    const genres = ['Sách nhật bản', 'Shounen', 'Chiến đấu', 'Drama'];
    const renderedGenres = genres.map((v, i) => (
        <SwiperSlide key={i} style={{ width: 'auto' }}>
            <Typography fontSize={'small'} fontWeight={'bold'} sx={{ whiteSpace: 'nowrap' }}>
                {v}{i < genres.length - 1 ? ', ' : ''}
            </Typography>
        </SwiperSlide>
    ));
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: 1,
                width: 210,
                borderRadius: 2,
                cursor: 'pointer',
                transition: "box-shadow 0.3s ease-in-out",
                '&:hover': {
                    boxShadow: 4,
                },
                gap: '2px',

            }}
            onMouseEnter={() => {
                setAllowSwipe(false)
            }}
            onMouseLeave={() => {
                setAllowSwipe(true)
            }}
            onClick={() => {
                navigate(`/profileUser/book-series/${collection.id}`)
            }}
        >
            <Box sx={{ cursor: 'pointer' }}>
                <img src={collection.coverImage} width={'184px'} height={'190px'} style={{ objectFit: "cover" }} />
            </Box>
            <Tooltip
                title={collection.name}
                arrow
            >
                <Typography fontFamily={'Segoe UI'}
                    sx={{
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        fontSize: 15,
                        fontWeight: 600,
                        color: grey['900'],
                        transition: 'color 0.4s ease-in-out',
                        '&:hover': {
                            color: red['600'],
                        },
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        textOverflow: 'ellipsis',

                    }}
                >
                    {collection.name}
                </Typography>
            </Tooltip>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* <Avatar 
                    sx={{ 
                        bgcolor: deepOrange[500], 
                        width: 35, 
                        height: 35, 
                        border: `solid 2px ${grey['800']}`
                    }} 
                    src={personImage}
                /> */}
                <Box
                    sx={{ height: '100%', flex: 1 }}
                >
                    <Box display={'flex'} gap={1} alignItems={'center'}>
                        <Typography fontSize={'small'}>Người tạo: </Typography>
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: grey['900'],
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                            }}
                        >
                            {collection.fullName || 'Người dùng ẩn danh'}
                        </Typography>

                    </Box>
                    {/* <Rating
                        size="small"
                        name="text-feedback"
                        value={4.5}
                        readOnly
                        precision={0.5}
                    /> */}
                </Box>
            </Box>
            <Box display={'flex'} flexDirection={'column'} justifyContent={'flex-start'}>
                <Typography fontSize={'small'}>{`Số lượng: ${collection.totalBook}`}</Typography>
                <Typography fontSize={'small'}>{`Ngày tạo: ${collection.createdDate}`}</Typography>
            </Box>
            <Divider />
            <Box sx={{ overflow: 'hidden', width: '100%' }}>
                <Swiper
                    nested
                    onTouchMove={() => {
                        if (!draggingChild) {
                            setDraggingChild(true)
                            console.log('true')
                        }
                    }}
                    onTouchEnd={() => {
                        if (draggingChild) {
                            setDraggingChild(false)
                            console.log('false')
                        }
                    }}
                    grabCursor
                    freeMode
                    spaceBetween={8}
                    slidesPerView={'auto'}
                    resistanceRatio={1}
                >
                    {/* {renderedGenres} */}
                </Swiper>
            </Box>
        </Box>
    )
}