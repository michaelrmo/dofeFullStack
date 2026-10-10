import React from 'react';
import { Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from '../navBar';
import StarField from '../homePage/pageStyle';


// Main function
const AboutMePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery("(min-width: 1000px)");

    // Function to convert hex color to RGB format
    const hexToRgb = (hex) => {
        // Remove '#' if present
        hex = hex.replace('#', '');
        // Parse hex to RGB
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        // Return RGB values as string
        return `${r}, ${g}, ${b}`;
    };

    return (
        <>
            <StarField/>
            <Navbar />
            <Box>
                <Box width="100%" p="1rem 6%" textAlign="center">
                    <Typography
                        fontWeight="bold"
                        fontSize="clamp(1.5rem, 3rem, 3.375rem)"
                        sx={{
                            color: theme.palette.primary.main
                        }}
                    >
                        About Me
                    </Typography>
                </Box>
                <Box
                    width="100%"
                    p="1rem 6%"
                    display="flex"
                    justifyContent="center"
                    
                >
                    <Typography
                        fontSize="clamp(1rem, 2rem, 2.25rem)"
                        width={isMobile ? "60%" : "90%"}
                        height="100%"
                        padding="1rem"
                        sx={{
                            backgroundColor: `rgba(${hexToRgb(theme.palette.primary.light)}, 0.8)`,
                            borderRadius: "1rem",
                        }}
                    >
                        Hi, <br></br> <br></br>

                        This is a website made to launch bots and do math homework for you (specifically DrFrost)<br></br><br></br>

                        Despite this website being in development, im pretty happy with how its coming along <br></br><br></br>
                        
                        To actually use the website, just click on one of the bot cards on the home page, enter your bot name and the number of bots you want. Depending on the number of bots, you will be charged a certain amount of tokens. Tokens can be bought or you can ask me. <br></br><br></br>

                        Keep in mind that these are simply made to flood kahoots and will not get the answers right, this feature will be added later<br></br><br></br>

                        
                    </Typography>
                </Box>

                {/* Havent actually made the footer a reusable component yet */}
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
        </>
    );
};

export default AboutMePage;
