#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import createLogger from "progress-estimator";

(async () => {
    const logger = createLogger({});

    const questions = [
        {
            type: "input",
            name: "projectName",
            message: "What do you want to name this project?",
            default: "my-platapi-project"
        }
    ];

    const answers = await inquirer.prompt(questions);
    const projectDir = path.resolve(process.cwd(), answers.projectName);

    if (await fs.pathExists(projectDir)) {
        console.error("Unable to create project because the path", projectDir, "already exists");
        return;
    }

    await logger(
        new Promise<void>(async resolve => {
            await fs.ensureDir(projectDir);

            const projectName = path.basename(answers.projectName);

            const packageJSON = {
                name: projectName,
                version: "1.0.0",
                private: "true",
                scripts: {
                    dev: "LOG_LEVEL=debug platapi dev",
                    build: "platapi build"
                }
            };

            await fs.outputJSON(path.join(projectDir, "package.json"), packageJSON);

            await fs.copy(path.resolve(__dirname, "../starter-api/"), path.join(projectDir));

            resolve();
        }),
        "Creating project directory"
    );

    await logger(
        new Promise((resolve, reject) => {
            const process = spawn("npm", ["install", "platapi@latest", "typescript"], {
                //stdio: "inherit",
                cwd: projectDir
            });

            process.on("exit", function (code) {
                resolve(code);
            });
            process.on("error", function (err) {
                console.error("There was a problem installing dependencies", err);
                reject(err);
            });
        }),
        "Installing dependencies"
    );

    await logger(Promise.resolve(), `Try out your PlatAPI:\ncd ${answers.projectName}\nnpm run dev\n\n`);
})();
