import React from "react"
import {Entity} from "draft-js"

Media = React.createClass({
    switchDisplayMode() {
        if (this.props.blockProps.readOnly) return;
        const entityKey = this.props.block.getEntityAt(0);
        let newViewMode = Entity.get(entityKey).getData().viewMode;
        if (newViewMode === "default") {
            newViewMode = "inline"
        } else {
            newViewMode = "default"
        }
        Entity.mergeData(entityKey, {viewMode: newViewMode});
        this.forceUpdate();
    },

    render() {
        // TODO: Support other types of Media
        const data = Entity.get(this.props.block.getEntityAt(0)).getData();
        let className = "photo-container";
        if (data.viewMode === "inline") {
            className += " inline"
        } else {
            className += " default"
        }
        return (
            <div className={className}>
                <img src={data.src}
                     onClick={this.switchDisplayMode} />
            </div>
        )
    }
});