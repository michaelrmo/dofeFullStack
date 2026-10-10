import { spawn } from "node:child_process";
import { once } from "node:events";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const botLaunch = async (req, res) => {
    const { gameCode, botName, botNum, pageType, sessionId } = req.body;
    console.log(`Bot launch received: type=${pageType}, session=${sessionId}`);

    if (typeof pageType !== "string" || !/^[a-z][a-z0-9]*$/i.test(pageType)) {
        return res.status(400).json({ message: "Invalid bot type." });
    }

    const scriptPath = fileURLToPath(new URL(`../bots/${pageType}Bot.py`, import.meta.url));
    try {
        await access(scriptPath);
    } catch {
        return res.status(400).json({ message: `The ${pageType} bot is not available.` });
    }

    try {
        const python = process.env.PYTHON_BIN || "python3";
        const args = [gameCode, botNum, botName, sessionId].map(String);
        const bot = spawn(python, [scriptPath, ...args]);

        bot.stdout.on("data", data => {
            console.log(`Bot ${sessionId}: ${data.toString()}`);
        });
        bot.stderr.on("data", data => {
            console.error(`Bot ${sessionId} error: ${data.toString()}`);
        });
        bot.on("close", (code, signal) => {
            const message = `Bot ${sessionId} exited: code=${code}, signal=${signal || "none"}`;
            if (code === 0) console.log(message);
            else console.error(message);
        });
        // Handle missing Python executables without crashing the Express process.
        await once(bot, "spawn");
        console.log(`Bot process started: session=${sessionId}, pid=${bot.pid}`);
        res.status(202).json({ message: "Bot process started", sessionId });
    } catch (error) {
        console.error(`Failed to start bot ${sessionId}: ${error.message}`);
        res.status(500).json({ message: "Could not start Python. Check the bot backend's Python installation and logs." });
    }
};
