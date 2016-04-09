import React from "react"

RenderedPhotoContent = React.createClass({
    propTypes: {
        content: React.PropTypes.object.isRequired
    },

    render() {
        const source = this.props.content.description || "";
        return (
            <div className="photo-content">
                <div className="photo-container">
                    <img src={this.props.content.url} />
                </div>
                <div className="photo-description">
                    {this.props.content.description}
                </div>
            </div>
        )
    }
});