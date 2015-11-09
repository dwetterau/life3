// App component - represents the whole app
App = React.createClass({

    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            events: Events.find({}).fetch(),
            currentUser: Meteor.user()
        }
    },

    getEmptyEvent() {
        return {
            description: "",
            title: "",
            type: "text"
        };
    },

    renderEvents() {
        let rendered_events = [];
        this.data.events.map((event) => {
            rendered_events.push(<Event key={event._id} event={event} />);
        });

        // We reverse here for rendering purposes. This might change.
        rendered_events.reverse();
        return rendered_events;
    },

    renderPage() {
        // This is only called if the user is logged in
        return (
            <div className="page-content">
                <div className="header-container card">
                    <EditContent event={this.getEmptyEvent()} />
                </div>
                <div className="timeline-container">
                    {this.renderEvents()}
                </div>
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
                    <h1 className="page-title">Fill</h1>
                </header>

                {this.data.currentUser ? this.renderPage() : ''}
            </div>
        );
    }
});