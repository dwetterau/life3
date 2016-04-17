import React from "react"
import {Entity} from "draft-js"

Link = React.createClass({
    render() {
        const {url} = Entity.get(this.props.entityKey).getData();
        return (
            <a href={url}>
                {this.props.children}
            </a>
        )
    }
});