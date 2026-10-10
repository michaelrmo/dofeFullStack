import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';

/* Read */

export const getUser = async (req, res) => {
    try{
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch(err){
        res.status(404).json({message: err.message});
    }
}

export const tokenNum = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const tokenNum = user ? user.tokenNum : null;
        res.status(200).json({ tokens: tokenNum }); 
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* Update */
//First stage in bot process
//Prepares bot uuid and subtracts token num from database
export const botPrep = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const { _id, values} = req.body;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        };
        const botNumNew = parseInt(values.botNum);
        let tokenNum = user ? user.tokenNum : null;
        tokenNum -= botNumNew;
        user.tokenNum = tokenNum;
        console.log("User tokenNum:", user.tokenNum);
        await user.save();
        const sessionId = uuidv4(); // Generates a unique UUID
        console.log(sessionId);
        res.status(200).json({sessionId: sessionId});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//second stage in bot process
//makes an api call to the backend to launch and run the bot
export const botLaunch = async (req, res) => {
    try{
        const {values, sessionId,  pageType, authToken } = req.body;
        const gameCode = String(values.gameCode).replace(/\s+/g, '');
        console.log(gameCode);
        const botName = values.botName;
        const botNum = values.botNum;
        const send = async (gameCode ,botName, botNum, pageType, sessionId, authToken) =>{
            const dataToSend = {gameCode, botName, botNum, pageType, sessionId, authToken};
            const botBackendUrl = process.env.BOT_BACKEND_URL || "http://127.0.0.1:3002";
            console.log(`Forwarding bot launch to ${botBackendUrl}: type=${pageType}, session=${sessionId}`);
            const response = await fetch(`${botBackendUrl.replace(/\/$/, "")}/regBots/botLaunch`, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
                signal: AbortSignal.timeout(15000),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Bot backend returned HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
        };
        await send(gameCode ,botName, botNum, pageType, sessionId, authToken);
        res.status(200).json({message: `Session, ${sessionId}, initialised `});
    }catch (err){
        res.status(500).json({ message: err.message });
    }
};

// Third part of the bot process
//Curently Broken
//Is mean to set up a websocket to report the current status of the bot to the front end 
//export const botStatus = async (req, res) =>{
//    try{
//        const { sessionId, status, gameCode, botName } = req.body;
//        console.log(`Status update for session ${sessionId}: ${status}`);
//        // Currently letting this be broken
//        io.to(sessionId).emit('statusUpdate', { status, gameCode, botName });
 //       res.status(200).send("Status update received");
//    }catch (err) {
// Will happen every time currently
//        res.status(500).json({message : `It died ${err.message}`})
//        console.log(`It died ${err.message}`)
//   }
//};


