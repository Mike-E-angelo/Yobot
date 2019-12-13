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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./probot-commands.d.ts" />
const probot_commands_1 = __importDefault(require("probot-commands"));
const _ = __importStar(require("lodash"));
/*import * as Rest from "@octokit/rest";*/
const metadata = require("probot-metadata");
var Yobot;
(function (Yobot) {
    class Commands {
        Register(application) {
            probot_commands_1.default(application, "yo", (context) => __awaiter(this, void 0, void 0, function* () {
                if (this.IsValid(context)) {
                    const message = `Yo!  Yobot here, yo.  I understand the following commands, yo:

\`/yoConnection\`
| Reports the current connection status, if any, yo.

\`/yoConnect #<issueNumber>\`
| Connects an issue, where \`<issueNumber>\` is the issue to connect, yo.

\`/yoDisconnect\`
| Disconnects any connected issue, yo.`;
                    yield Yobot.Connector.New(context).Notify(message);
                }
            }));
            probot_commands_1.default(application, "yoConnect", (context, params) => __awaiter(this, void 0, void 0, function* () {
                if (this.IsValid(context)) {
                    const number = Number(_.trimStart(params.arguments, "#"));
                    if (!isNaN(number)) {
                        const connector = Yobot.Connector.New(context);
                        yield connector.Connect(number);
                        yield connector.Connection();
                    }
                }
            }));
            probot_commands_1.default(application, "yoConnection", (context) => __awaiter(this, void 0, void 0, function* () {
                if (this.IsValid(context)) {
                    yield Yobot.Connector.New(context).Connection();
                }
            }));
            probot_commands_1.default(application, "yoDisconnect", (context) => __awaiter(this, void 0, void 0, function* () {
                if (this.IsValid(context)) {
                    yield Yobot.Connector.New(context).Disconnect();
                }
            }));
        }
        IsValid(context) {
            return context.payload.sender.login !== "hey-yobot";
        }
    }
    Yobot.Commands = Commands;
    class ContextParser {
        constructor(context, pattern) {
            this.pattern = pattern;
            this.context = context;
        }
        static New(context) {
            return new ContextParser(context, ContextParser.Pattern);
        }
        GetIssueNumber() {
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
    ContextParser.Pattern = /(i|issue|\/)(\d+)$/;
    Yobot.ContextParser = ContextParser;
    class StoreValue {
        constructor(store, key, parse, format) {
            this.format = format;
            this.parse = parse;
            this.key = key;
            this.store = store;
        }
        Get() {
            return __awaiter(this, void 0, void 0, function* () {
                const stored = yield this.store.get(this.key);
                const result = this.parse(stored);
                return result;
            });
        }
        Set(value) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.store.set(this.key, value);
            });
        }
    }
    class ConnectedIssueValue extends StoreValue {
        static New(context, issue = null) {
            return new ConnectedIssueValue(metadata(context, issue));
        }
        constructor(store) {
            super(store, "connectedIssue", (value) => { return value ? Number(value) : null; }, (number) => { return number == null || isNaN(number) ? "" : number.toString(); });
        }
    }
    Yobot.ConnectedIssueValue = ConnectedIssueValue;
    class Connector {
        constructor(context, issueStore) {
            this.issueStore = issueStore;
            this.context = context;
        }
        static New(context, issue = null) {
            return new Connector(context, ConnectedIssueValue.New(context, issue));
        }
        Disconnect() {
            return __awaiter(this, void 0, void 0, function* () {
                const number = yield this.issueStore.Get();
                if (number != null) {
                    yield this.issueStore.Set(null);
                    yield this.Notify("Yo! This pull request has been disconnected from any issue, yo.");
                }
                else {
                    yield this.Connection();
                }
            });
        }
        Notify(message) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.context.github.issues.createComment(this.context.issue({ body: message }));
            });
        }
        Connection() {
            return __awaiter(this, void 0, void 0, function* () {
                const number = yield this.issueStore.Get();
                const message = number != null ? `Yo! This pull request is connected to issue #${number}, yo.`
                    :
                        `Yo!  This is pull request is not currently connected to any issue, yo.  Connect one by calling:

\`\`\`
/yoConnect #<issueNumber>
\`\`\`

Where \`<issueNumber>\` is the issue to connect, yo.`;
                yield this.Notify(message);
            });
        }
        Mirror(contents) {
            return __awaiter(this, void 0, void 0, function* () {
                const number = yield this.issueStore.Get();
                if (number != null) {
                    const body = `A new candidate build has been provided for this issue.  [Here are the details](${this.context.payload.comment.html_url}):

${contents}

Please feel free to try out this new build and comment here on this issue if you run into any problems or have any questions.  Someone will attend to you shortly.

If no contact is made, a branch build will be made with these changes merged into and an issue will be posted here with the details. 👍
`;
                    const issueComment = this.context.issue({ issue_number: number, body: body });
                    yield this.context.github.issues.createComment(issueComment);
                }
            });
        }
        Connect(number) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = (yield this.issueStore.Get()) !== number;
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
                    const connected = yield this.context.github.issues.get(this.context.issue({ issue_number: number }));
                    const action = connected.data.labels.map(x => x.name).includes("bug") ? "Fix" : "Clos";
                    const text = `${body}${action}es #${number}`;
                    const issue = this.context.issue({ body: text });
                    yield this.context.github.pulls.update(issue);
                    yield this.issueStore.Set(number);
                }
                return result;
            });
        }
    }
    Yobot.Connector = Connector;
})(Yobot = exports.Yobot || (exports.Yobot = {}));
//# sourceMappingURL=Yobot.js.map