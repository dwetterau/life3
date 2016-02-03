contentTypes = {
    text: "text",
    budget: "budget",
    checklist: "checklist",
    photo: "photo"
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
        this.setState({inEditMode: !this.state.inEditMode});
    },

    updateEvent(eventId, newEvent) {
        Meteor.call("updateEvent", eventId, newEvent);
        this.toggleEditMode();
    },

    deleteEvent() {
        Meteor.call("deleteEvent", this.props.event._id);
    },

    renderOptions() {
        return <EventOptions creating={false}
                             editing={this.state.inEditMode}
                             saveOrEditFunc={this.toggleEditMode}
                             deleteFunc={this.deleteEvent} />
    },

    renderContent(content, index) {
        // TODO: should these be using the content's id instead of index?
        if (content.type == contentTypes.text) {
            return <RenderedTextContent key={index} content={content} />
        } else if (content.type == contentTypes.budget) {
            return <RenderedBudgetContent key={index} content={content} />
        } else if (content.type == contentTypes.checklist) {
            return <RenderedChecklistContent key={index} content={content} />
        } else if (content.type == contentTypes.photo) {
            return <RenderedPhotoContent key={index} content={content} />
        }
    },

    renderEventContents() {
        const eventContents = this.props.event.contents || [];
        return (
            <div className="event-contents">
                {eventContents.map(this.renderContent)}
            </div>
        )
    },

    renderEventBody() {
        const formattedDate = moment(this.props.event.startTime).format("ll");
        return (
            <div className="event-body">
                <div className="event-header">
                    <div className="event-date">{formattedDate}</div>
                    <div className="event-title">{this.props.event.title}</div>
                </div>
                {this.renderEventContents()}
            </div>
        )
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
                <EditEvent event={this.props.event}
                           updateFunc={this.updateEvent}
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