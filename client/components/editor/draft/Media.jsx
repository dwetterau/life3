import React from "react"
import {Entity} from "draft-js"

Media = React.createClass({
    render() {
        // TODO: Support other types of Media
        const {src} = Entity.get(this.props.block.getEntityAt(0)).getData();
        return (
            <div className="photo-content">
                <div className="photo-container">
                    <img src={src} />
                </div>
            </div>
        )
    }
});