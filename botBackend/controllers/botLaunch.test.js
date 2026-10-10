import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { botLaunch } from "./botLaunch.js";

function response() {
    return {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
    };
}

const body = {
    gameCode: "123456", botNum: 2, botName: "LocalProbe",
    pageType: "kahoot", sessionId: "test-session",
};

test("an unavailable bot script produces an error instead of reporting success", async () => {
    const res = response();
    await botLaunch({ body: { ...body, pageType: "missingtestscript" } }, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /not available/);
});

test("a missing interpreter returns an error without an unhandled process error", async () => {
    const previous = process.env.PYTHON_BIN;
    process.env.PYTHON_BIN = path.join(tmpdir(), "botpulse-missing-python-executable");
    try {
        const res = response();
        await botLaunch({ body }, res);
        assert.equal(res.statusCode, 500);
        assert.match(res.body.message, /Could not start Python/);
    } finally {
        if (previous === undefined) delete process.env.PYTHON_BIN;
        else process.env.PYTHON_BIN = previous;
    }
});

test("launch passes the script and arguments to a harmless interpreter fixture", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "botpulse-launch-test-"));
    const executable = path.join(directory, "python-fixture");
    const output = path.join(directory, "arguments.json");
    const previousPython = process.env.PYTHON_BIN;
    const previousOutput = process.env.BOTPULSE_TEST_OUTPUT;
    await writeFile(executable,
        '#!/usr/bin/env node\n' +
        'require("node:fs").writeFileSync(process.env.BOTPULSE_TEST_OUTPUT, JSON.stringify(process.argv.slice(2)));\n',
        { mode: 0o700 });
    process.env.PYTHON_BIN = executable;
    process.env.BOTPULSE_TEST_OUTPUT = output;
    try {
        const res = response();
        await botLaunch({ body }, res);
        assert.equal(res.statusCode, 202);
        assert.equal(res.body.sessionId, body.sessionId);
        let args;
        for (let attempt = 0; attempt < 100; attempt++) {
            try { args = JSON.parse(await readFile(output, "utf8")); break; }
            catch { await setTimeout(20); }
        }
        assert.ok(args, "the interpreter fixture received the launch");
        assert.ok(path.isAbsolute(args[0]));
        assert.equal(path.basename(args[0]), "kahootBot.py");
        assert.deepEqual(args.slice(1), ["123456", "2", "LocalProbe", "test-session"]);
    } finally {
        if (previousPython === undefined) delete process.env.PYTHON_BIN;
        else process.env.PYTHON_BIN = previousPython;
        if (previousOutput === undefined) delete process.env.BOTPULSE_TEST_OUTPUT;
        else process.env.BOTPULSE_TEST_OUTPUT = previousOutput;
        await rm(directory, { recursive: true, force: true });
    }
});
