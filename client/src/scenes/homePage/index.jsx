import React from 'react';
import NavBar from '../navBar';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardContent, Grid, Button, useTheme, useMediaQuery, Box } from '@mui/material';
import StarField from './pageStyle';

const HomePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleCardClick = (botName) => {
        console.log(`Clicked on ${botName}`);
        if (botName ===  'Blooket Bot' || botName === "Quizziz Bot") { return; }
        navigate(`/botPage`, { state: { botType: botName } });
      };

    return (
    <>
        
        <StarField /> {/* StarField as a background */}
        
        
        <Box display="flex" flexDirection="column" minHeight="100vh" zIndex="1">
            <NavBar /> {/* NavBar at the top */}

            {/* Main content */}
            <Box flexGrow={1} p={isMobile ? '2rem' : '3rem'} display="flex" flexDirection="column" justifyContent="center">
                <Box textAlign={isMobile ? 'center' : 'left'} paddingBottom={isMobile ? "0.5vh" : "10vh"}>
                    <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ fontSize: isMobile ? '2.5rem' : '3.5rem' }}>
                        Choose a bot and enjoy
                    </Typography>
                    <Button  onClick={() => navigate('/aboutMe')}>
                        Learn more
                    </Button>
                </Box>


                <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
                    {['Kahoot Bot', 'Quizziz Bot', 'Blooket Bot'].map((botName, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card
                                sx={{
                                    minWidth: '20vw', // Using vw for responsive width
                                    minHeight: '25vh', // Using vh for responsive height
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: botName === 'Blooket Bot' || botName === "Quizziz Bot" ? theme.palette.action.disabledBackground : theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: botName ===  'Blooket Bot' || botName === "Quizziz Bot" ? theme.palette.action.disabledBackground : theme.palette.primary.light,
                                    },
                                    [theme.breakpoints.up('md')]: {
                                        padding: '2rem' // Bigger padding in rem for larger screens
                                    },
                                }}
                                onClick={() => handleCardClick(botName)}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="div" sx={{ textAlign: 'center' }}>
                                        {botName}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Button variant="contained" disabled sx={{
                    color: theme.palette.primary.contrastText,
                    fontSize: '1.5rem',
                    padding: '1.5rem 3rem',
                    maxWidth: '80%',
                    alignSelf: 'center',
                    mt: 4,
                }}>
                    Homework Solver For Math - Coming Soon!!
                </Button>
            </Box>

            {/* Footer */}
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

export default HomePage;
