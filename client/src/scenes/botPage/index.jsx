import { Box, useTheme, Typography } from "@mui/material";
import StarField from "../homePage/pageStyle";
import Navbar from "../navBar";
import Form from "./Form";

const BotPage = () => {
    const theme = useTheme();
    return (
        // Set the container to use flex display, direction column, and ensure it takes up the full viewport height
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh', // This ensures the container takes at least the full height of the viewport
        }}>
            <StarField />
            <Navbar />
            <Form />
            {/* This Box acts as a spacer pushing the footer to the bottom */}
            <Box sx={{ flexGrow: 1 }}></Box>
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
    );
};

export default BotPage;
