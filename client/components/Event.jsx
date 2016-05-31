import moment from "moment"
import React from "react"

contentTypes = {
    text: "text",
    budget: "budget",
};

Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired,
        isFetchedUser: React.PropTypes.bool.isRequired,

        // Only required if we are the fetchedUser
        fetchedUser: React.PropTypes.object
    },

    getInitialState() {
        return this._getNewStateFromProps(this.props);
    },

    componentWillReceiveProps(newProps) {
        this.setState(this._getNewStateFromProps(newProps))
    },

    _getNewStateFromProps(props) {
        return {
            event: props.event,
            inEditMode: false
        }
    },

    toggleEditMode() {
        this.setState({inEditMode: !this.state.inEditMode});
    },

    updateEvent(eventId, newEvent) {
        Meteor.call("updateEvent", eventId, newEvent, (error, updatedEvent) => {
            this.setState({event: updatedEvent})
        });
        this.toggleEditMode();
    },

    deleteEvent() {
        Meteor.call("deleteEvent", this.state.event._id);
    },

    cancelEventEdit() {
        this.toggleEditMode();
    },

    renderOptions() {
        return <EventOptions creating={false}
                             editing={this.state.inEditMode}
                             isFetchedUser={this.props.isFetchedUser}
                             saveOrEditFunc={this.toggleEditMode}
                             deleteFunc={this.deleteEvent}
                             cancelFunc={this.cancelEventEdit} />
    },

    renderContent(content, index) {
        // TODO: should these be using the content's id instead of index?
        if (content.type == contentTypes.text) {
            return <RenderedTextContent key={index} content={content} />
        } else if (content.type == contentTypes.budget) {
            return <RenderedBudgetContent key={index} content={content} />
        }
    },

    renderEventContents() {
        const eventContents = this.state.event.contents || [];
        return (
            <div className="event-contents">
                {eventContents.map(this.renderContent)}
            </div>
        )
    },

    renderEventPath() {
        // On show the sharing path if we're the current user
        if (!this.props.isFetchedUser) return;
        let path = "/";
        if (this.state.event.hasOwnProperty("path")) {
            path = this.state.event.path;
        }
        if (path == "/") return;
        path = "/u/" + encodeURI(this.props.fetchedUser.username) + path;
        path = encodeURI(path);
        return (
            <div className="event-path">
                Located at:
                <a href={path}>{path}</a>
            </div>
        )
    },

    renderEventBody() {
        const formattedDate = moment(this.state.event.startTime).format("ll");
        return (
            <div className="event-body">
                <div className="event-header">
                    <div className="event-date">{formattedDate}</div>
                    <div className="event-title">
                        <DraftEditor
                            text={this.state.event.title}
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
                <EditEvent event={this.state.event}
                           isFetchedUser={this.props.isFetchedUser}
                           updateFunc={this.updateEvent}
                           deleteFunc={this.deleteEvent}
                           cancelFunc={this.cancelEventEdit} />
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