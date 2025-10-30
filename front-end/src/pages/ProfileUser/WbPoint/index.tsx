import TopUpList from "./Content";
import WbPointBalance from "./Header";
import React from "react";
import { Box, Container } from "@mui/material";
import {getUserWbPoint} from "../../../api/user/userPoint";
import { getUserDetails} from "~/api/user/userDetails";
import { useState, useEffect } from "react";
export default function WbPoint() {
    const [userPoint, setUserPoint] = useState({
        userPointId: 0,
        totalPoint: 0,
        userRank: "",
        userId: 0,
        userPointHistories: []
    });
    useEffect(()=>{
        const fetchUserWbPoint = async () => {
            try {
                const userDetails = await getUserDetails();
                const userId = userDetails.result.userId
                const userPoint = await getUserWbPoint(userId);
                setUserPoint(userPoint);
            } catch (error) {
                console.error("Error fetching user wb point:", error);
            }
        };
        fetchUserWbPoint();
    }, [])
    return (
        <Box>
            <Container maxWidth="xl">
                <WbPointBalance value={userPoint.totalPoint} />
                <TopUpList />
            </Container>
        </Box>
    );
}