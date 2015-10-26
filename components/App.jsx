// App component - represents the whole app
App = React.createClass({

    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            events: Events.find({}).fetch(),
            workouts: Workouts.find({}).fetch(),
            currentUser: Meteor.user()
        }
    },

    joinEvents() {
        // This function joins all events with their associated workout information
        let event_to_workout_list = new Map();
        for (let workout of this.data.workouts) {
            if (!event_to_workout_list.has(workout.eventId)) {
                event_to_workout_list.set(workout.eventId, [])
            }
            event_to_workout_list.get(workout.eventId).push(workout)
        }
        console.log(event_to_workout_list);
        for (let event of this.data.events) {
            if (!event_to_workout_list.has(event._id)) {
                event.workouts = []
            } else {
                event.workouts = event_to_workout_list.get(event._id);
            }
        }
        console.log(this.data.workouts);
        console.log(this.data.events);
    },

    renderEvents() {
        this.joinEvents();
        return this.data.events.map((event) => {
           return <Event event={event} />;
        });
    },

    renderPage() {
        // This is only called if the user is logged in
        return (
            <div className="page-content">
                <CreateContent />
                <div className="plan-container">
                    {this.renderEvents()}
                </div>
            </div>
        );
    },

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Fill</h1>

                    <AccountsUIWrapper />
                </header>

                {this.data.currentUser ? this.renderPage() : ''}
            </div>
        );
    }
});