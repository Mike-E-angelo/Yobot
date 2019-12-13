import { Application, Context } from "probot" // eslint-disable-line no-unused-vars
/*import * as Webhooks from "@octokit/webhooks";
import * as fs from "fs";
import * as path from "path";

import * as template from "url-template";*/


import { Yobot } from "./Yobot";

export default (application: Application) => {
    /*const p = path.join(__dirname, "../.data/payload-test.js");
    const document = fs.readFileSync(p, "utf-8").toString();
    const context = JSON.parse(document);

    app.log(context.payload.issue.body);*/

    new Yobot.Commands().Register(application);

    /*application.on(["pull_request.opened"],
        async (context: Context) => {
            const number = Yobot.ContextParser.New(context).GetIssueNumber();
            if (number != null) {
                await Yobot.Connector.New(context).Connect(number);
            }
        });*/

    /*application.on(["issue_comment.created"],
        async (context: Context) => {
            application.log("HELLO WORLD!");
            var repo =
                context.repo(); // context.repo({ owner: context.payload.repository.owner, repo: context.payload.repository.name });
            //application.log(repo);

            const response = await context.github.request('GET /repos/:owner/:repo/issues/events', repo);
            //const response = await context.github.issues.listEventsForRepo(repo);

            /*const event =
                response.data.find((x) : any => x.event === "merged" &&
                    x.commit_id === "565f8fbd4a950bf60870ab20726b1a813165043d");#1#

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
            }#1#
        });*/
};