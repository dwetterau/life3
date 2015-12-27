Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            inEditMode: false
        }
    },

    getMarkdownContent() {
        return "# " + this.props.event.title +
               "\n" + this.props.event.description;
    },

    toggleEditMode() {
        // The edit function should call this method when the event is saved
        this.setState({inEditMode: !this.state.inEditMode});
    },

    renderOptions() {
        return <div className="event-option-edit"
                    onClick={this.toggleEditMode}>Edit</div>
    },

    renderEvent() {
        if (!this.state.inEditMode) {
            // TODO: Render events based on type.
            return (
                <div className="rendered-event-container">
                    <div className="event-header">
                        <div className="event-options">
                            {this.renderOptions()}
                        </div>
                    </div>
                    <div className="event-body">
                        <ReactMarkdown
                            className="event-description"
                            source={this.getMarkdownContent()} />
                    </div>
                </div>
            )
        } else {
            return (
                <EditContent event={this.props.event} toggleEditMode={this.toggleEditMode} />
            )
        }
    },

    render() {
        return (
            <div className="event-container card">
                {this.renderEvent()}
            </div>
        );
    }
});