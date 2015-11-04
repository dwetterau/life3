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
                </div>
                <div className="event-body">
                    <ReactMarkdown
                        className="event-description"
                        source={this.props.event.description} />
                    {this.renderWorkout()}
                </div>
            </div>
        );
    }
});