import moment from "moment"
import React from "react"
import _ from "underscore"

// App component - represents the whole app
App = React.createClass({
    propTypes: {
        username: React.PropTypes.string,
        path: React.PropTypes.string
    },

    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            maxEventIndex: 10 // Used for infinite scroll
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
            // We're looking at root. If we're logged in, we should redirect
            if (currentUser) {
                this.redirectToUser();
            }
        }

        let events = [];
        if (fetchedUser) {
            events = Events.find({owner: fetchedUser._id}).fetch()
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
        return Meteor.call("addEvent", event)
    },

    redirectHome() {
        window.location = "/";
    },

    redirectTo404: _.debounce(function() {
        if (!this.data.fetchedUser) {
            window.location = "/404"
        }
    }, 500),

    redirectToUser() {
        window.location = "/u/" + encodeURIComponent(Meteor.user().username)
    },

    debouncedExtendEvents: _.debounce(function() {
        this.setState({maxEventIndex: this.state.maxEventIndex + 10});
    }, 200, true),

    handleScroll(event) {
        // Near the bottom
        const ele = event.target.scrollingElement;
        if (ele.scrollTop + $(window).height() > ele.scrollHeight - 50) {
            this.debouncedExtendEvents();
        }
    },

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    },

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    },

    renderCreateNewEvent() {
        // If we aren't on our own page and logged in, we can't edit.
        if (!this.data.isFetchedUser) {
            return;
        }
        return (
            <div className="header-container card">
                <EditEvent event={getEmptyEvent()}
                           isFetchedUser={this.data.isFetchedUser}
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

                {this.data.fetchedUser ? this.renderPage() : 'Loading...'}
            </div>
        );
    }
});