Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    renderWorkout() {
        if (!this.props.event.workout) {
            return;
        }
        return (
            <div className="workout-container">
                {this.props.event.workout.description},
                {this.props.event.workout.duration}
            </div>
        )
    },

    render() {
        return (
            <div className="event-container">
                {this.props.event.title}
                {this.props.event.description}
                {this.props.event.startTime}
                {this.renderWorkout()}
            </div>
        );
    }
});