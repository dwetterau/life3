Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render() {
        return (
            <div className="event-container">
                {this.props.event.description}
            </div>
        );
    }
});