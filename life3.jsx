import Q from "q"
import React from "react"
import {render} from "react-dom"

Events = new Mongo.Collection("events");

const registerRoutes = function() {
    FlowRouter.route("/", {
        triggersEnter: [function(context, redirect) {
            // see if the user is logged in
            const userId = Meteor.userId();
            if (userId) {
                const user = Meteor.users.findOne(userId);
                redirect("/" + encodeURI(user.username))
            } else {
                // Hack, this is actually a user called "welcome"
                redirect("/welcome")
            }
        }],
        action() {
            render(<App />, document.getElementById("render-target"));
        }
    });

    // Error handling
    [404].forEach(function(code) {
        FlowRouter.route("/" + code, {
            action() {
                render(
                    <Error code={code} />,
                    document.getElementById("render-target")
                );
            }
        });
    });

    FlowRouter.route("/:username", {
        action(params) {
            render(
                <App username={params.username} />,
                document.getElementById("render-target")
            );
        }
    });

    FlowRouter.route("/:username/:path", {
        action(params) {
            render(
                <App username={params.username}
                     path={"/" + params.path} />,
                document.getElementById("render-target")
            );
        }
    });

    // TODO(david): Figure this out with better routing
    FlowRouter.route("/:username/:path/:path2", {
        action(params) {
            render(
                <App username={params.username}
                     path={"/" + params.path + "/" + params.path2} />,
                document.getElementById("render-target")
            );
        }
    });
};

if (Meteor.isClient) {
    // This code is executed on the client only
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    Q.nfcall(Meteor.subscribe, "users")
        .then(Q.nfcall(Meteor.subscribe, "events"))
        .then(registerRoutes())
        .then(Q.nfcall(Meteor.startup, function() {
            // Hide the draft.js contentEditable warnings.
            /*
            console.error = (function() {
                var error = console.error;

                return function(exception) {
                    if ((exception + '').indexOf(
                            'Warning: A component is `contentEditable`') != 0) {
                        error.apply(console, arguments)
                    }
                }
            })()*/
        }));
}

if (Meteor.isServer) {
    Tracker.autorun(function() {
        Meteor.publish("users", function() {
            return Meteor.users.find({}, {
                fields: {
                    "username": true
                }
            });
        });

        Meteor.publish("events", function() {
            return Events.find({
                $or: [
                    {public: true},
                    {owner: this.userId}
                ]
            });
        });
    })
}

Meteor.methods({
    // TODO: Better input validation. In particular, we need to make sure that
    // paths are sane on creation and update.
    addEvent(content) {
        // Only logged in users can create events
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        content.owner = Meteor.userId();
        return Events.insert(content);
    },

    updateEvent(eventId, event) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        // Make sure that the owner matches for the event being updated
        const owner = Meteor.userId();
        if (owner != event.owner) {
            throw new Meteor.Error("not-authorized");
        }
        const currentEvent = Events.findOne({_id: eventId});
        if (owner != currentEvent.owner) {
            throw new Meteor.Error("not-authorized");
        }

        Events.update(eventId, {
            $set: event
        });
    },

    deleteEvent(eventId) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        // Make sure that the owner matches for the event being updated
        const owner = Meteor.userId();
        const currentEvent = Events.findOne({_id: eventId});
        if (owner != currentEvent.owner) {
            throw new Meteor.Error("not-authorized");
        }
        Events.remove(eventId)
    }
});