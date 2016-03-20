Events = new Mongo.Collection("events");

if (Meteor.isClient) {
    // This code is executed on the client only
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    Meteor.subscribe("users");
    Meteor.subscribe("events");

    FlowRouter.route("/", {
        action() {
            ReactLayout.render(Layout, {content: <App />});
        }
    });

    FlowRouter.route("/:username", {
        action(params) {
            ReactLayout.render(Layout, {
                content: <App username={params.username} />
            });
        }
    });

    FlowRouter.route("/:username/:path", {
        action(params) {
            ReactLayout.render(Layout, {
                content: <App username={params.username}
                              path={"/" + params.path} />
            });
        }
    });

    // TODO(david): Figure this out with better routing
    FlowRouter.route("/:username/:path/:path2", {
        action(params) {
            ReactLayout.render(Layout, {
                content: <App username={params.username}
                              path={"/" + params.path + "/" + params.path2} />
            });
        }
    });
    Meteor.startup(function() {
        // Hide the draft.js contentEditable warnings.
        console.error = (function() {
            var error = console.error;

            return function(exception) {
                if ((exception + '').indexOf(
                        'Warning: A component is `contentEditable`') != 0) {
                    error.apply(console, arguments)
                }
            }
        })()
    })
}

if (Meteor.isServer) {
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
}

Meteor.methods({
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