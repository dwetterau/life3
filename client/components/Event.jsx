import moment from "moment"
import React from "react"

contentTypes = {
    text: "text",
    budget: "budget",
    checklist: "checklist",
    photo: "photo"
};

Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired,
        isCurrentUser: React.PropTypes.bool.isRequired
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
                             isCurrentUser={this.props.isCurrentUser}
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

    renderEventPath() {
        // On show the sharing path if we're the current user
        if (!this.props.isCurrentUser) return;
        let path = "/";
        if (this.props.event.hasOwnProperty("path")) {
            path = this.props.event.path;
        }
        if (path == "/") return;
        path = encodeURI(path);
        return (
            <div className="event-path">
                Located at: {path}
            </div>
        )
    },

    renderEventBody() {
        const formattedDate = moment(this.props.event.startTime).format("ll");
        return (
            <div className="event-body">
                <div className="event-header">
                    <div className="event-date">{formattedDate}</div>
                    <div className="event-title">
                        <DraftEditor
                            text={this.props.event.title}
                            readOnly={true}
                            showOptions={false}
                            onTextChange={(x) => {}} />
                    </div>
                </div>
                {this.renderEventContents()}
                {this.renderEventPath()}
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
                           isCurrentUser={this.props.isCurrentUser}
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