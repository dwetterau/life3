/**
 * Created by david on 10/25/15.
 */
CreateContent = React.createClass({

    getInitialState() {
        return {
            timeCursor: new Date(),
            newWorkout: false
        }
    },

    createWorkout(eventId, description) {
        let duration = 1 * 60 * 60; // Duration is 1 hour in seconds for now

        Meteor.call("addWorkout", eventId, description, duration);
    },

    createEvent() {
        const titleField = React.findDOMNode(this.refs.titleInput);
        const descriptionField = React.findDOMNode(this.refs.descriptionInput);

        let workoutDescription = null;
        let workoutField = null;
        if (this.state.newWorkout) {
            workoutField = React.findDOMNode(this.refs.workoutInput);
            workoutDescription = workoutField.value
        }

        // TODO: allow this to be better specified
        const startTime = new Date();

        Meteor.call("addEvent", titleField.value, descriptionField.value, startTime, function(error, result) {
            if (this.state.newWorkout && !error) {
                this.createWorkout(result, workoutDescription)
            }
        }.bind(this));

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
                    <input type="text" ref="titleInput" placeholder="Title"/>
                    <input type="text" ref="descriptionInput" placeholder="description"/>
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
                    <input type="text" ref="workoutInput" placeholder="Workout description"/>
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

    render() {
        return (
            <div className="event-container card">
                {this.renderCreateGeneralContent()}
                {this.renderCreateWorkoutContent()}
                {this.renderCreateEventButton()}
            </div>
        );
    }
});