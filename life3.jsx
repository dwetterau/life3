import Q from "q"
import React from "react"
import {render} from "react-dom"

Events = new Mongo.Collection("events");
EventsSearchIndex = new Mongo.Collection("events_search_index");

const registerRoutes = function() {
    FlowRouter.route("/", {
        triggersEnter: [function(context, redirect) {
            // see if the user is logged in
            const userId = Meteor.userId();
            if (userId && Meteor.user()) {
                redirect("/u/" + encodeURI(Meteor.user().username))
            } else if (!userId) {
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

    FlowRouter.route("/welcome", {
        action() {
            render(
                <App username="welcome" />,
                document.getElementById("render-target")
            );
        }
    });

    FlowRouter.route("/u/:username", {
        action(params) {
            render(
                <App username={params.username} />,
                document.getElementById("render-target")
            );
        }
    });

    FlowRouter.route("/u/:username/:folder", {
        action(params) {
            render(
                <App username={params.username}
                     path={"/" + params.folder} />,
                document.getElementById("render-target")
            );
        }
    });

    FlowRouter.route("/u/:username/:folder/:name", {
        action(params) {
            render(
                <App username={params.username}
                     path={"/" + params.folder + "/" + params.name} />,
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
    registerRoutes();
    Meteor.startup(function() {});
}

// stub functions that only need to be done on the server:
let indexEvent = (event) => {};
let removeEventFromIndex = (eventId) => {};

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
            // Publish events sorted by newest first.
            return Events.find({
                $or: [
                    {public: true},
                    {owner: this.userId}
                ]
            }, {sort: {startTime: -1}});
        });
    });
    // Startup the search service
    const SearchService = require("./server/search");
    const searchService = new SearchService(Events, EventsSearchIndex);
    searchService.start();

    // Fix up the stub functions.
    indexEvent = (event) =>  {
        searchService.indexEvent(event);
    };
    removeEventFromIndex = (eventId) => {
        searchService.removeEventFromIndex(eventId);
    };

    Meteor.methods({
        getEventIds(query) {
            const eventIdToPriority = searchService.getEvents(query);
            const events = Events.find({
                $and: [
                    {_id: {$in: Object.keys(eventIdToPriority)}},
                    {$or: [
                        {public: true},
                        {owner: this.userId}
                    ]}
                ]
            }).fetch();

            // sort the output from highest priority to lowest
            events.sort((a, b) => {
                return eventIdToPriority[b._id] - eventIdToPriority[a._id];
            });

            return events.map((event) => {
                return event._id;
            });
        }
    });
}

Meteor.methods({
    // TODO: Better input validation. In particular, we need to make sure that
    // paths are sane on creation and update.
    addEvent(event) {
        // Only logged in users can create events
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        event.owner = Meteor.userId();
        // Set the eventId on the event for search infra.
        event._id = Events.insert(event);
        indexEvent(event);
        return event;
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
        // Set the eventId back on the event for the search infra.
        event._id = eventId;
        indexEvent(event);
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
        Events.remove(eventId);
        removeEventFromIndex(eventId);
    }
});