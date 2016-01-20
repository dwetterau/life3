// App component - represents the whole app
App = React.createClass({
    propTypes: {
        username: React.PropTypes.string
    },

    mixins: [ReactMeteorData],

    getMeteorData() {
        let isCurrentUser = true;
        let currentUser = Meteor.user();
        if (!currentUser && this.props.username) {
            const fetchedUser = Meteor.users.find({
                username: this.props.username
            }).fetch();
            if (fetchedUser && fetchedUser.length == 1) {
                // We aren't the current user, otherwise we wouldn't get here
                isCurrentUser = false;
                currentUser = fetchedUser[0];
            }
        }

        let events = [];
        if (currentUser) {
            events = Events.find({owner: currentUser._id}).fetch()
        }
        return {
            events: events,
            currentUser: currentUser,
            isCurrentUser: isCurrentUser
        }
    },

    createEventFunc(event) {
        return Meteor.call("addEvent", event)
    },

    renderCreateNewEvent() {
        // If we aren't on our own page and logged in, we can't edit.
        if (!this.data.isCurrentUser) {
            return;
        }
        return (
            <div className="header-container card">
                <EditEvent event={getEmptyEvent()}
                           createFunc={this.createEventFunc} />
            </div>
        );
    },

    renderEvents() {
        let allEvents = this.data.events.map(function(event) {
            return event;
        });
        allEvents.sort(function(event1, event2) {
            return moment(event1.startTime).unix() - (
                    moment(event2.startTime).unix());
        });
        let renderedEvents = [];
        allEvents.map((event) => {
            renderedEvents.push(<Event key={event._id} event={event} />);
        });

        // We reverse here for rendering purposes. This might change.
        renderedEvents.reverse();
        return (
            <div className="timeline-container">
                {renderedEvents}
            </div>
        );
    },

    renderPage() {
        // This is only called if we are querying for the page of a valid user
        return (
            <div className="page-content">
                {this.renderCreateNewEvent()}
                {this.renderEvents()}
            </div>
        );
    },

    render() {
        return (
            <div className="page-container">
                <header>
                    <div className="account-ui-wrapper">
                        <AccountsUIWrapper />
                    </div>
                    <h1 className="page-title">L3</h1>
                </header>

                {this.data.currentUser ? this.renderPage() : ''}
            </div>
        );
    }
});