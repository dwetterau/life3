EditContent = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            timeCursor: new Date(),
            newWorkout: false
        }
    },

    getNewWorkoutState() {
        const workoutField = ReactDOM.findDOMNode(this.refs.workoutInput);
        const duration = 60 * 60; // duration is 1 hour in seconds for now
        const workout = {
            description: workoutField.value,
            duration: duration
        };
        workoutField.value = '';
        return workout;
    },

    createEvent() {
        const titleField = ReactDOM.findDOMNode(this.refs.titleInput);
        const descriptionField = ReactDOM.findDOMNode(this.refs.descriptionInput);
        const workout = this.state.newWorkout ? this.getNewWorkoutState() : null;

        // TODO: allow this to be better specified
        const startTime = new Date();

        // TODO: check a prop value of the event id, if present, update instead
        Meteor.call("addEvent", titleField.value, descriptionField.value, startTime, workout);

        titleField.value = '';
        descriptionField.value = '';
    },

    toggleCreateWorkout() {
        this.setState({newWorkout: !this.state.newWorkout});
    },

    renderCreateGeneralContent() {
        const titlePlaceholder = "Title";
        const descriptionPlaceholder = "Description";
        return (
            <div className="general-content-editor">
                <input type="text" ref="titleInput" placeholder={titlePlaceholder}
                       value={this.props.event.title}/>
                <TextArea ref="descriptionInput" placeholder={descriptionPlaceholder}
                          defaultValue={this.props.event.description} rows={4} />
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
            <div className="create-event-container">
                {this.renderCreateGeneralContent()}
                {this.renderCreateWorkoutContent()}
                {this.renderCreateEventButton()}
            </div>
        );
    }
});