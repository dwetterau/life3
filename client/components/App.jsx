// App component - represents the whole app
App = React.createClass({
    propTypes: {
        username: React.PropTypes.string,
        path: React.PropTypes.string
    },

    mixins: [ReactMeteorData],

    getMeteorData() {
        let isCurrentUser = true;
        let currentUser = Meteor.user();
        if (this.props.username) {
            const fetchedUser = Meteor.users.find({
                username: this.props.username
            }).fetch();
            if (fetchedUser && fetchedUser.length == 1) {
                if (currentUser) {
                    // Logged in, but looking at some other user
                    isCurrentUser = this.props.username == currentUser.username;
                } else {
                    isCurrentUser = false;
                }
                currentUser = fetchedUser[0];
            } else {
                // TODO: Show a 404, lets just go home right now. Oh wait,
                // that causes a redirect loop. Need to investigate!
            }
        }

        let events = [];
        if (currentUser) {
            events = Events.find({owner: currentUser._id}).fetch()
        } else if (window.location.pathname != "/welcome") {
            // Redirect to welcome if we have nothing else to show.
            window.location = "/welcome"
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

    redirectHome() {
        window.location = "/";
    },

    renderCreateNewEvent() {
        // If we aren't on our own page and logged in, we can't edit.
        if (!this.data.isCurrentUser) {
            return;
        }
        return (
            <div className="header-container card">
                <EditEvent event={getEmptyEvent()}
                           isCurrentUser={this.data.isCurrentUser}
                           createFunc={this.createEventFunc} />
            </div>
        );
    },

    renderEvents() {
        let allEvents = this.data.events.map(function(event) {
            return event;
        });

        // Filter out events that don't match the path
        allEvents = this.data.events.filter(function(event) {
            if (event.hasOwnProperty("path") && this.props.path) {
                const pathComponents = event.path.split("/");
                const prefixComponents = this.props.path.split("/");
                // Note that we start at 1 because the first split thing should
                // be the empty string.
                let i;
                for (i = 1; i < prefixComponents.length; i++) {
                    if (pathComponents[i] != prefixComponents[i]) {
                        return false;
                    }
                }
                return true;
            }
            return !this.props.path;
        }.bind(this));

        allEvents.sort(function(event1, event2) {
            return moment(event1.startTime).unix() - (
                    moment(event2.startTime).unix());
        });
        let renderedEvents = [];
        allEvents.map((event) => {
            renderedEvents.push(
                <Event key={event._id}
                       isCurrentUser={this.data.isCurrentUser}
                       event={event} />
            );
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
                    <h1 className="page-title" onClick={this.redirectHome}>
                        Lens
                    </h1>
                    <div className="account-ui-wrapper">
                        <AccountsUIWrapper />
                    </div>
                </header>

                {this.data.currentUser ? this.renderPage() : ''}
            </div>
        );
    }
});