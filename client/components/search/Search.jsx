import React from "react"

Search = React.createClass({
    propTypes: {
        eventsById: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            results: [],
            resultLimit: 5
        }
    },

    updateQueryText(e) {
        this.searchForQuery(e.target.value);
    },

    searchForQuery(query) {
        query = query.trim();
        Meteor.call("getEventIds", query, (error, eventIds) => {
            eventIds = eventIds.filter((eventId) => {
                return this.props.eventsById.hasOwnProperty(eventId);
            });

            // Sort the events by startTime (latest -> oldest) before limiting.
            eventIds.sort((a, b) => {
                return this.props.eventsById[b].startTime - (
                        this.props.eventsById[a].startTime);
            });

            // Limit the results to render
            eventIds = eventIds.filter((eventId, index) => {
                return index < this.state.resultLimit;
            });
            let eventResults = eventIds.map((eventId) => {
                return {
                    id: eventId,
                    event: this.props.eventsById[eventId]
                }
            });



            this.setState({results: eventResults});
        })
    },

    renderSearchResults() {
        return (
            <div className="search-results-container">
                {this.state.results.map((resultDict) => {
                    const {id, event} = resultDict;
                    return <SearchResult key={id} event={event} />
                })}
            </div>
        )
    },

    render() {
        return (
            <div className="search-container card">
                <input className="search-box"
                       onChange={this.updateQueryText}
                       placeholder="Search..."/>
                {this.renderSearchResults()}
            </div>
        );
    }
});