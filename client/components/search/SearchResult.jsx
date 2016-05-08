import moment from "moment"
import React from "react"

SearchResult = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    render() {
        const formattedDate = moment(this.props.event.startTime).format("ll");
        let formattedTitle;
        if (this.props.event.title) {
            formattedTitle = "\"" + this.props.event.title + "\"";
        } else {
            formattedTitle = "(Untitled)"
        }
        return (
            <div className="search-result">
                <a href={"/e/" + this.props.event._id} >
                    <div className="date">{formattedDate}</div>
                    <div className="title">{formattedTitle}</div>
                </a>
            </div>
        );
    }
});