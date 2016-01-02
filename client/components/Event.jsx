contentTypes = {
    text: "text",
    budget: "budget"
};

Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            inEditMode: false
        }
    },

    toggleEditMode() {
        // The edit function should call this method when the event is saved
        this.setState({inEditMode: !this.state.inEditMode});
    },

    deleteEvent() {
        Events.remove(this.props.event._id)
    },

    renderOptions() {
        return <EventOptions creating={false}
                             editing={this.state.inEditMode}
                             saveOrEditFunc={this.toggleEditMode}
                             deleteFunc={this.deleteEvent} />
    },

    renderTextEvent() {
        const source = this.props.event.description || "";
        return (
            <div className="event-body">
                <h1 id="event-title">{this.props.event.title}</h1>
                <ReactMarkdown
                    className="event-description"
                    source={source} />
            </div>
        )
    },

    renderBudgetEvent() {
        return (
            <div className="event-body">
                <h1 id="event-title">{this.props.event.title}</h1>
                <div>Todo: Render the budget item body...</div>
            </div>
        )
    },

    renderEventBody() {
        if (this.props.event.type == contentTypes.text) {
            return this.renderTextEvent();
        } else if (this.props.event.type == contentTypes.budget) {
            return this.renderBudgetEvent();
        }
    },

    renderEvent() {
        if (!this.state.inEditMode) {
            return (
                <div className="rendered-event-container">
                    {this.renderOptions()}
                    {this.renderEventBody()}
                </div>
            )
        } else {
            return (
                <EditContent event={this.props.event}
                             toggleEditMode={this.toggleEditMode}
                             deleteFunc={this.deleteEvent} />
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