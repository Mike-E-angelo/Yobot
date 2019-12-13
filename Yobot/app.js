"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*import * as Webhooks from "@octokit/webhooks";
import * as fs from "fs";
import * as path from "path";

import * as template from "url-template";*/
const Yobot_1 = require("./Yobot");
exports.default = (application) => {
    /*const p = path.join(__dirname, "../.data/payload-test.js");
    const document = fs.readFileSync(p, "utf-8").toString();
    const context = JSON.parse(document);

    app.log(context.payload.issue.body);*/
    new Yobot_1.Yobot.Commands().Register(application);
    /*application.on(["pull_request.opened"],
        async (context: Context) => {
            const number = Yobot.ContextParser.New(context).GetIssueNumber();
            if (number != null) {
                await Yobot.Connector.New(context).Connect(number);
            }
        });*/
    application.on(["issue_comment.created"], (context) => __awaiter(void 0, void 0, void 0, function* () {
        application.log("HELLO WORLD!");
        var repo = context.repo(); // context.repo({ owner: context.payload.repository.owner, repo: context.payload.repository.name });
        //application.log(repo);
        const response = yield context.github.request('GET /repos/:owner/:repo/issues/events', repo);
        //const response = await context.github.issues.listEventsForRepo(repo);
        /*const event =
            response.data.find((x) : any => x.event === "merged" &&
                x.commit_id === "565f8fbd4a950bf60870ab20726b1a813165043d");*/
        context.log(response);
        // context.log(response.data.length);
        // Yobot.ConnectedIssueValue.New(context, event)
        /*switch (context.payload.sender.login) {
        case "AppVeyorBot":
            const contents = context.payload.comment.body as string;
            if (contents.startsWith(":white_check_mark:")) {
                await Yobot.Connector.New(context).Mirror(contents);
            }
            break;
        }*/
    }));
};
//# sourceMappingURL=app.js.map