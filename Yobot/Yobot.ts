/// <reference path="./probot-commands.d.ts" />
import RegisterCommand from "probot-commands";
import { Application, Context } from "probot"; // eslint-disable-line no-unused-vars
import * as _ from "lodash";
/*import * as Rest from "@octokit/rest";*/
const metadata = require("probot-metadata");

export module Yobot {

    export class Commands {
        Register(application : Application) {
            RegisterCommand(application, "yo", async (context) => {
                if (this.IsValid(context)) {
                    const message = `Yo!  Yobot here, yo.  I understand the following commands, yo:

\`/yoConnection\`
| Reports the current connection status, if any, yo.

\`/yoConnect #<issueNumber>\`
| Connects an issue, where \`<issueNumber>\` is the issue to connect, yo.

\`/yoDisconnect\`
| Disconnects any connected issue, yo.`;
                    await Yobot.Connector.New(context).Notify(message);
                }
            });

            RegisterCommand(application, "yoConnect", async (context, params) =>
            {
                if (this.IsValid(context)) {
                    const number = Number(_.trimStart(params.arguments, "#"));

                    if (!isNaN(number)) {
                        const connector = Yobot.Connector.New(context);
                        await connector.Connect(number);
                        await connector.Connection();
                    }
                }
            });

            RegisterCommand(application, "yoConnection", async (context) =>
            {
                if (this.IsValid(context)) {
                    await Yobot.Connector.New(context).Connection();
                }
            });

            RegisterCommand(application, "yoDisconnect", async (context) =>
            {
                if (this.IsValid(context)) {
                    await Yobot.Connector.New(context).Disconnect();
                }
            });
        }
        private IsValid(context: Context) : boolean {
            return context.payload.sender.login !== "hey-yobot";
        }
    }

    export class ContextParser {
        private static readonly Pattern = /(i|issue|\/)(\d+)$/;

        private readonly pattern: RegExp;
        private readonly context: Context;

        static New(context: Context) : ContextParser {
            return new ContextParser(context, ContextParser.Pattern);
        }

        constructor(context: Context, pattern : RegExp) {
            this.pattern = pattern;
            this.context = context;
        }

        GetIssueNumber() : number | null {
            const pull = this.context.payload.pull_request;
            const ref = pull ? pull.head.ref : null;
            if (ref) {
                const match = ref.match(this.pattern);
                if (match) {
                    return Number(match[2]);
                }
            }

            return null;
        }
    }

    type Parse<T> = (item: string) => T;

    type Format<T> = (value: T) => string;

    class StoreValue<T> {
        private readonly format: Format<T>;
        private readonly parse: Parse<T>;
        private readonly key: string;
        private readonly store : any;

        constructor(store : any, key : string, parse : Parse<T>, format : Format<T>) {
            this.format = format;
            this.parse = parse;
            this.key = key;
            this.store = store;
        }

        async Get(): Promise<T> {
            const stored = await this.store.get(this.key);
            const result = this.parse(stored);
            return result;
        }

        async Set(value : T) {
            await this.store.set(this.key, value);
        }
    }

    export class ConnectedIssueValue extends StoreValue<number | null> {
        static New(context: Context, issue : any = null) : ConnectedIssueValue {
            return new ConnectedIssueValue(metadata(context, issue));
        }

        constructor(store : any) {
            super(store, "connectedIssue", (value) => { return value ? Number(value) : null; },
                (number) => { return number == null || isNaN(number) ? "" : number.toString(); } );
        }
    }

    export class Connector {
        private issueStore: ConnectedIssueValue;
        private readonly context: Context;

        static New(context: Context, issue : any = null) : Connector {
            return new Connector(context, ConnectedIssueValue.New(context, issue));
        }

        constructor(context: Context, issueStore : ConnectedIssueValue) {
            this.issueStore = issueStore;
            this.context = context;
        }

        async Disconnect() {
            const number = await this.issueStore.Get();
            if (number != null) {
                await this.issueStore.Set(null);
                await this.Notify("Yo! This pull request has been disconnected from any issue, yo.");
            } else {
                await this.Connection();
            }
        }

        async Notify(message : string) {
            await this.context.github.issues.createComment(this.context.issue({ body: message }));
        }

        async Connection() {
            const number = await this.issueStore.Get();
            const message = number != null ? `Yo! This pull request is connected to issue #${number}, yo.`
                :
                `Yo!  This is pull request is not currently connected to any issue, yo.  Connect one by calling:

\`\`\`
/yoConnect #<issueNumber>
\`\`\`

Where \`<issueNumber>\` is the issue to connect, yo.`;
            await this.Notify(message);
        }

        async Mirror(contents : string) {
            const number = await this.issueStore.Get();
            if (number != null) {
                const body = `A new candidate build has been provided for this issue.  [Here are the details](${this.context.payload.comment.html_url}):

${contents}

Please feel free to try out this new build and comment here on this issue if you run into any problems or have any questions.  Someone will attend to you shortly.

If no contact is made, a branch build will be made with these changes merged into and an issue will be posted here with the details. 👍
`;
                const issueComment = this.context.issue({ issue_number: number, body: body });
                await this.context.github.issues.createComment(issueComment);
            }
        }

        async Connect(number: number) : Promise<boolean> {
            const result = await this.issueStore.Get() !== number;
            if (result) {
                const payload = this.context.payload;
                const previous = payload.pull_request
                    ? payload.pull_request.body
                    : payload.issue.pull_request
                    ? payload.issue.body
                    : "";
                const body = previous
                    ? `${previous}

--

`
                    : previous;

                const connected =
                    await this.context.github.issues.get(this.context.issue({ issue_number: number }));

                const action = connected.data.labels.map(x => x.name).includes("bug") ? "Fix" : "Clos";

                const text = `${body}${action}es #${number}`;

                const issue = this.context.issue({ body: text });
                await this.context.github.pulls.update(issue);

                await this.issueStore.Set(number);
            }
            return result;
        }
    }
}