import moment from "moment"
import React from "react"
import _ from "underscore"

// App component - represents the whole app
App = React.createClass({
    propTypes: {
        username: React.PropTypes.string,
        path: React.PropTypes.string,
        eventId: React.PropTypes.string
    },

    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            maxEventIndex: 10, // Used for infinite scroll
            eventEditorOpen: false // Used for creating new events
        }
    },

    getMeteorData() {
        Meteor.subscribe("users");
        Meteor.subscribe("events");
        let isFetchedUser = false;
        let currentUser = Meteor.user();
        let fetchedUser = null;
        if (this.props.username) {
            // There is a username in the url
            fetchedUser = Meteor.users.findOne({
                username: this.props.username
            });
            if (fetchedUser) {
                if (currentUser) {
                    // Logged in, check if we are looking at some other user
                    isFetchedUser = this.props.username == currentUser.username;
                } else {
                    // Not logged in, and looking at a real user
                    isFetchedUser = false;
                }
            } else {
                this.redirectTo404();
            }
        } else {
            // We're looking at root. If we're logged in and not looking at an
            // event, we should redirect.
            if (!this.props.eventId && currentUser) {
                this.redirectToUser();
            }
        }

        let events = [];
        if (fetchedUser) {
            events = Events.find({owner: fetchedUser._id}).fetch()
        } else if (this.props.eventId) {
            events = Events.find({_id: this.props.eventId}).fetch()
        } else if (window.location.pathname != "/welcome") {
            // Redirect to welcome if we have nothing else to show.
            // TODO: This doesn't work on mobile either :(
        }
        return {
            events: events,
            currentUser: currentUser,
            fetchedUser: fetchedUser,
            isFetchedUser: isFetchedUser
        }
    },

    createEventFunc(event) {
        return Meteor.call("addEvent", event, (error, response) => {
            if (!error) {
                this.toggleEventEditor();
            }
        })
    },

    cancelEventCreationFunc() {
        this.toggleEventEditor()
    },

    redirectHome() {
        window.location = "/";
    },

    redirectTo404: _.debounce(function() {
        // TODO: do something smarter here where we check that we've fully
        // published the users dict and the user in question still doesn't
        // exist.
        if (!this.data.fetchedUser) {
            window.location = "/404"
        }
    }, 2000),

    redirectToUser() {
        window.location = "/u/" + encodeURIComponent(Meteor.user().username)
    },

    debouncedExtendEvents: _.debounce(function() {
        this.setState({maxEventIndex: this.state.maxEventIndex + 10});
    }, 200, true),

    handleScroll(event) {
        // Near the bottom
        const ele = event.target.scrollingElement;
        if (ele.scrollTop + $(window).height() > ele.scrollHeight - 75) {
            this.debouncedExtendEvents();
        }
    },

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    },

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    },

    toggleEventEditor() {
        this.setState({eventEditorOpen: !this.state.eventEditorOpen});
    },

    renderOpenEditorButton() {
        // If we aren't on our own page and logged in, we can't create a new
        // event here anyway.
        if (!this.data.isFetchedUser) return;
        if (this.state.eventEditorOpen) return;
        return (
            <div className="create-new-button"
                 onClick={this.toggleEventEditor}>
                <a>Create a new event</a>
            </div>
        )
    },

    renderHeader() {
        return (
            <div className="header-container card">
                <Search eventsById={this._getEventsById()} />
                {this.renderOpenEditorButton()}
            </div>
        );
    },

    renderCreateNewEvent() {
        // If we aren't on our own page and logged in, we can't create a new
        // event here anyway.
        if (!this.data.isFetchedUser) return;

        // Don't render this menu if it's not open
        if (!this.state.eventEditorOpen) return;

        // TODO: Implement a cancel function that will close the editor that
        // we should pass in here.
        return (
            <div className="new-event-container card">
                <EditEvent event={getEmptyEvent()}
                           isFetchedUser={this.data.isFetchedUser}
                           createFunc={this.createEventFunc}
                           cancelFunc={this.cancelEventCreationFunc} />
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
            return moment(event2.startTime).unix() - (
                    moment(event1.startTime).unix());
        });

        // Paginate the events.
        allEvents = allEvents.filter(function(event, index) {
            return index < this.state.maxEventIndex
        }.bind(this));

        let renderedEvents = [];
        allEvents.map((event) => {
            renderedEvents.push(
                <Event key={event._id}
                       isFetchedUser={this.data.isFetchedUser}
                       fetchedUser={this.data.fetchedUser}
                       event={event} />
            );
        });

        return (
            <div className="timeline-container">
                {renderedEvents}
            </div>
        );
    },

    _getEventsById() {
        const eventsList = this.data.events || [];
        const eventsById = {};
        eventsList.forEach((event) => {
            eventsById[event._id] = event
        });
        return eventsById;
    },

    renderEventPage() {
        const eventsById = this._getEventsById();
        if (!eventsById.hasOwnProperty(this.props.eventId)) {
            return "Loading...";
        }
        const event = eventsById[this.props.eventId];
        let isFetchedUser = false;
        let fetchedUser = null;
        if (this.data.currentUser && event.owner == this.data.currentUser._id) {
            isFetchedUser = true;
            fetchedUser = this.data.currentUser;
        }
        return (
            <div className="timeline-container">
                <Event key={event._id}
                       isFetchedUser={isFetchedUser}
                       fetchedUser={fetchedUser}
                       event={event} />
            </div>
        )
    },

    renderUserPage() {
        // This is only called if we are querying for the page of a valid user
        return (
            <div className="page-content">
                {this.renderHeader()}
                {this.renderCreateNewEvent()}
                {this.renderEvents()}
            </div>
        );
    },

    render() {
        let page;
        if (this.props.eventId) {
            page = this.renderEventPage()
        } else {
            page = this.data.fetchedUser ? this.renderUserPage() : 'Loading...';
        }
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
                {page}
            </div>
        );
    }
});