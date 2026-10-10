import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import StarField from "../homePage/pageStyle";
import Navbar from "../navBar";
import React from 'react';
import { useSelector } from "react-redux";

const TokenShop = () => {
    const theme = useTheme();
    const isNonMobile = useMediaQuery(theme.breakpoints.up('md'));
    const user = useSelector((state) => state.user);
    console.log(user._id);
    return (
        // This Box acts as a flex container
        <Box display="flex" flexDirection="column" minHeight="100vh"> 
            <StarField />
            <Navbar />
            <Box p="1rem 6%" textAlign="center" width="100%">
                <Typography
                    fontWeight="bold"
                    fontSize="clamp(1.5rem, 3rem, 3.375rem)"
                    textAlign="center"
                    color="primary"
                >
                    Token Shop
                </Typography>
            </Box>
            <Box gap="30px"
                width={isNonMobile ? "50%" : "93%"}
                p="2rem"
                m="2rem auto"
                borderRadius="1.5rem"
                bgcolor={theme.palette.background.alt}

                //Stripe stuff that was almost the death of me
            >
                <stripe-pricing-table 
                    pricing-table-id="prctbl_1PUDWNJr7oV87jisH1EGf972"
                    publishable-key="pk_test_51Oq1gWJr7oV87jis2dX6hsX5wJpwYOZXFmrbm0CRMQbO5yhXvkIpNjI1i0l0ZjIdozUi1K11cBVsEUwKrCrKfihU00EEY1IoEw"
                    client-reference-id={`${user._id}`}
                >
                </stripe-pricing-table>
            </Box>
            {/* This Box is used to push the footer to the bottom */}
            <Box sx={{ flexGrow: 1 }}></Box> 
            <Box sx={{
                py: '2rem',
                textAlign: 'center',
                color: theme.palette.neutral.dark,
            }}>
                <Typography variant="h5" fontWeight="500">
                    Email: <a href="mailto:admin@botpulse.xyz" style={{ color: theme.palette.primary.main }}>admin@botpulse.xyz</a>
                </Typography>

            </Box>
        </Box>
    );
};

export default TokenShop;
