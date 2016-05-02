import React from "react"
import {Entity} from "draft-js"

Media = React.createClass({
    switchDisplayMode() {
        if (this.props.blockProps.readOnly) return;
        const entityKey = this.props.block.getEntityAt(0);
        let newViewMode = Entity.get(entityKey).getData().viewMode;
        if (newViewMode === "default") {
            newViewMode = "inline50"
        } else if(newViewMode === "inline50") {
            newViewMode = "inline25"
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
        if (data.viewMode === "inline50") {
            className += " inline50 clearfix"
        } else if (data.viewMode === "inline25") {
            className += " inline25 clearfix"
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