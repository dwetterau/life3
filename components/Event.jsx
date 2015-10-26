Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render() {
        return (
            <div className="event-container">
                {this.props.event.title}
                {this.props.event.description}
                {this.props.event.startTime}
                {this.props.event.workouts}
            </div>
        );
    }
});