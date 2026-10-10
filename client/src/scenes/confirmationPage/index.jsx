import React, { useEffect, useState } from 'react';
import { Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import StarField from '../homePage/pageStyle';
import Navbar from '../navBar';
import CountdownTimer from './timer';
import { useSelector, useDispatch } from 'react-redux';
import { updateTokens } from '../../state';
import { requestJson } from '../../requestJson';

const ConfirmationPage = () => {
    const user = useSelector((state) => state.user);
    const userId = user._id;
    const dispatch = useDispatch();
    const oldTokens = useSelector((state) => state.user.tokenNum);
    const theme = useTheme();
    const token = useSelector((state) => state.token);
    const [tokens, setTokens] = useState(oldTokens);

    const isMobile = useMediaQuery("(min-width: 1000px)");
    
    useEffect(() => {
        if (userId) {
            requestJson(`/users/tokens/${userId}`, {
                method: 'GET',
                headers: { "Authorization": `Bearer ${token}`, 'Content-Type': 'application/json' },
            })
            .then((data) => {
                setTokens(data.tokens);
                console.log("Tokens:", data.tokens);
            })
            .catch((error) => console.error("Error fetching tokens:", error));
        }
    },[userId, token]);

    const newTokens = tokens - oldTokens;
    
    useEffect(() => {
        dispatch(updateTokens(+newTokens));
      }, [newTokens, dispatch]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <StarField />
            <Navbar />
            <Box sx={{ flexGrow: 1 }}>
                <Box width="100%" p="1rem 6%" textAlign="center">
                    <Typography
                        fontWeight="bold"
                        marginTop={isMobile ? "8rem" : "4rem"}
                        fontSize="clamp(2.5rem,4rem, 4.375rem)"
                        sx={{ color: theme.palette.primary.main }}
                    >
                        Thank you for your order!
                    </Typography>
                </Box>
                <Box width="100%" p="1rem 6%" display="flex" justifyContent="center">
                    <Typography fontSize="clamp(1rem, 2rem, 2.25rem)" width={isMobile ? "60%" : "90%"} height="100%" padding="3rem">
                        Thank you for your order! <br />
                        You now have {tokens !== null ? tokens : '...'} tokens <br />
                        If you have any issues, please contact us
                    </Typography>
                </Box>
            </Box>
            <Box width="100%" p="1rem 6%" textAlign="center">
                <Typography fontSize="clamp(0.75rem, 1.75rem, 2rem)" width={isMobile ? "60%" : "90%"} height="100%" padding="3rem" sx={{ color: theme.palette.primary.main }}>
                    <CountdownTimer />
                </Typography>
            </Box>
            <Box sx={{ py: '2rem', textAlign: 'center', color: theme.palette.neutral.dark }}>
                <Typography variant="h5" fontWeight="500">
                    Email: <a href="mailto:admin@botpulse.xyz" style={{ color: theme.palette.primary.main }}>admin@botpulse.xyz</a>
                </Typography>
            </Box>
        </Box>
    );
};

export default ConfirmationPage;
