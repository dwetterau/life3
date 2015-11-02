// App component - represents the whole app
App = React.createClass({

    mixins: [ReactMeteorData],

    getMeteorData() {
        return {
            events: Events.find({}).fetch(),
            currentUser: Meteor.user()
        }
    },

    renderEvents() {
        return this.data.events.map((event) => {
           return <Event event={event} />;
        });
    },

    renderPage() {
        // This is only called if the user is logged in
        return (
            <div className="page-content">
                <CreateContent />
                <div className="plan-container">
                    {this.renderEvents()}
                </div>
            </div>
        );
    },

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Fill</h1>

                    <AccountsUIWrapper />
                </header>

                {this.data.currentUser ? this.renderPage() : ''}
            </div>
        );
    }
});