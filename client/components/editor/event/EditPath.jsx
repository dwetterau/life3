import React from "react";

PathEditor = React.createClass({
    propTypes: {
        // The initial current path value
        path: React.PropTypes.string.isRequired,

        // A function to call when the path is changed
        onChange: React.PropTypes.func.isRequired
    },


    getInitialState() {
        // Split the path into parts, or set the defaults
        return this.fromPath(this.props.path);
    },

    fromPath(path) {
        if (!path || !path.startsWith("/")) {
            throw Error("Invalid path provided to conversion function.", path);
        }
        const splitPath = path.split("/");
        if (splitPath.length > 3 || splitPath.length < 2 || splitPath[0]) {
            throw Error("Invalid path provided to conversion function.", path);
        }
        let folder, filename;
        if (splitPath.length == 2 && !splitPath[1]) {
            // This is the path = "/" case
            folder = "";
            filename = "";
        }  else if (splitPath.length == 2) {
            // This is the path = "/filename" case
            folder = "";
            filename = splitPath[1];
        } else {
            // This is the path = "/folder/filename" case
            folder = splitPath[1];
            filename = splitPath[2];
        }
        return {
            folder: folder,
            filename: filename
        }
    },

    toPath(folder, filename) {
        let toReturn = "/";
        if (folder) {
            // Strip all forward slashes out of the folder name
            folder = folder.replace(/\//g, "");
            toReturn += folder + "/";
        }
        if (filename) {
            toReturn += filename;
        }
        return toReturn;
    },

    handleFolderChange(e) {
        const folder = e.target.value;
        this.setState({folder: folder});
        this.props.onChange(this.toPath(folder, this.state.filename));
    },

    handleFileChange(e) {
        const filename = e.target.value;
        this.setState({filename: filename});
        this.props.onChange(this.toPath(this.state.folder, filename));
    },

    render() {
        const tokenizedClass = " -tokenized";
        return (
            <div className="path-editor">
                <div className="path-part-editor">
                    <div className="label">Folder:</div>
                    <div className={
                            "edit-container" + (
                            (this.state.folder) ? tokenizedClass : "")} >
                        <input type="text" className="edit-folder"
                               defaultValue={this.state.folder}
                               onChange={this.handleFolderChange} />
                    </div>
                </div>
                <div className="path-part-editor">
                    <div className="label">Name:</div>
                    <div className={
                            "edit-container" + (
                            (this.state.filename) ? tokenizedClass : "")} >
                        <input type="text" className="edit-filename"
                               defaultValue={this.state.filename}
                               onChange={this.handleFileChange} />
                    </div>
                </div>
            </div>
        );
    }
});