Events = new Mongo.Collection("events");
Workouts = new Mongo.Collection("workouts");

if (Meteor.isClient) {
    // This code is executed on the client only
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    Meteor.subscribe("events");

    Meteor.startup(function () {
        // Use Meteor.startup to render the component after the page is ready
        ReactDOM.render(<App />, document.getElementById("render-target"));
    });
}

if (Meteor.isServer) {
    Meteor.publish("events", function() {
        return Events.find({
            owner: this.userId
        })
    });
    Meteor.publish("workouts", function() {
        return Workouts.find({
            owner: this.userId
        })
    });
}

Meteor.methods({
    addEvent(title, description, startTime, workout) {
        // Only logged in users can create events
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        return Events.insert({
            title: title,
            description: description,
            startTime: startTime,
            workout: workout,
            owner: Meteor.userId()
        });
    }
});