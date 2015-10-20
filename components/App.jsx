// App component - represents the whole app
App = React.createClass({

    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            timeCursor: new Date(),
            newWorkout: false
        }
    },

    getMeteorData() {
        return {
            events: Events.find({}).fetch(),
            currentUser: Meteor.user()
        }
    },

    createEvent() {
        const titleField = React.findDOMNode(this.refs.titleInput);
        const descriptionField = React.findDOMNode(this.refs.titleInput);

        let workoutDescription = null;
        let workoutField = null;
        if (this.state.newWorkout) {
            workoutField = React.findDOMNode(this.refs.workoutInput);
            workoutDescription = workoutField.value
        }

        // TODO: allow this to be better specified
        const startTime = new Date();

        // TODO: allow this to be better specified
        const duration = 60 * 60; // Hardcoded to be 1 hour in seconds

        Meteor.call("addEvent",
            // General fields
            titleField.value,
            descriptionField.value,

            // Workout fields
            workoutDescription,

            // Time fields
            startTime,
            duration
        );

        titleField.value = '';
        descriptionField.value = '';
        if (workoutField) {
            workoutField.value = '';
        }
    },

    toggleCreateWorkout() {
        this.setState({newWorkout: !this.state.newWorkout});
    },

    renderCreateGeneralContent() {
        return (
            <div className="new-general-content">
                <form>
                    <input type="text" ref="titleInput" placeholder="Title" />
                    <input type="text" ref="descriptionInput" placeholder="description" />
                </form>
            </div>
        )
    },

    renderCreateWorkoutContent() {
        if (!this.state.newWorkout) {
            return (
                <div className="add-workout-content" onClick={this.toggleCreateWorkout}>
                    Click to add a workout!
                </div>
            )
        }
        return (
            <div className="new-workout-content">
                <form>
                    <input type="text" ref="workoutInput" placeholder="Workout description" />
                </form>
                <div className="remove-workout-content" onClick={this.toggleCreateWorkout}>
                    remove
                </div>
            </div>
        )
    },

    renderCreateEventButton() {
        return (
            <div className="add-event-button" onClick={this.createEvent}>
                Click to add your new event!
            </div>
        )
    },

    renderEvents() {
        return this.data.events.map((event) => {
           return <Event key={event._id} event={event} />;
        });
    },

    renderPage() {
        // This is only called if the user is logged in
        return (
            <div className="page-content">
                <div className="event-container card">
                    {this.renderCreateGeneralContent()}
                    {this.renderCreateWorkoutContent()}
                    {this.renderCreateEventButton()}
                </div>
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