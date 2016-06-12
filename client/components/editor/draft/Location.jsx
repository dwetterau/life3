import React from "react"
import {Entity} from "draft-js"

Location = React.createClass({
    render() {
        const data = Entity.get(this.props.block.getEntityAt(0)).getData();
        const base = "https://www.google.com/maps/embed/v1";
        const mode = "place";
        const key = Meteor.settings.public.googleMapsEmbedBrowserKey;
        const url = `${base}/${mode}?key=${key}&q=${data.query}`;
        const style = {border: 0};
        return (
            <div className="location-container">
                <iframe
                    width="600"
                    height="450"
                    frameborder="0"
                    style={style}
                    src={url} allowfullscreen>
                </iframe>
            </div>
        )
    }
});