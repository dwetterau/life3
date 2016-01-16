RenderedTextContent = React.createClass({
    propTypes: {
        content: React.PropTypes.object.isRequired
    },

    render() {
        const source = this.props.content.description || "";
        return (
            <div className="event-content">
                <ReactMarkdown
                    className="event-description"
                    source={source} />
            </div>
        )
    }
});