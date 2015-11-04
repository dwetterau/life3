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
                <div className="workout-duration">
                    {this.props.event.workout.duration}
                </div>
                <div className="workout-description">
                    {this.props.event.workout.description},
                </div>
            </div>
        )
    },

    render() {
        return (
            <div className="event-container card">
                <div className="event-header">
                    <div className="event-title">
                        {this.props.event.title}
                    </div>
                    <div className="event-start-time">
                        {this.props.event.startTime}
                    </div>
                </div>
                <div className="event-body">
                    <div className="event-description">
                        {this.props.event.description}
                    </div>
                    {this.renderWorkout()}
                </div>
            </div>
        );
    }
});