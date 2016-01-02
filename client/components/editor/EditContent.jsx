EditContent = React.createClass({
    propTypes: {
        // The current properties of the event
        event: React.PropTypes.object.isRequired,

        // An optional function to trigger state updates after the save.
        toggleEditMode: React.PropTypes.func,

        // The function to call to delete the event
        deleteFunc: React.PropTypes.func,
    },

    getInitialState() {
        return {
            contentType: this.props.event.type,
            event: this.props.event,
            creating: !this.props.event._id
        }
    },

    initializeAndGetItemRow(rowIndex) {
        if (!this.state.event.itemRows) {
            this.state.event.itemRows = [];
        }
        if (this.state.event.itemRows[rowIndex] === undefined) {
            if (rowIndex != this.state.event.itemRows.length) {
                console.error("Adding a item row at a far away index", rowIndex, this.state.event.itemRows);
            }
            this.state.event.itemRows[rowIndex] = {
                index: rowIndex,
                description: "",
                value: "000"
            };
        }
        return this.state.event.itemRows[rowIndex];
    },

    handleTitleChange(e) {
        this.state.event.title = e.target.value;
        this.setState({event: this.state.event});
    },

    handleDescriptionChange(e) {
        this.state.event.description = e.target.value;
        this.setState({event: this.state.event});
    },

    handleItemRowDescriptionChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        row.description = e.target.value;
        this.setState({event: this.state.event});
    },

    handleItemRowValueChange(rowIndex, e) {
        let row = this.initializeAndGetItemRow(rowIndex);
        // This value is in string format, we need to convert it to be in integer form.
        const floatValue = parseFloat(e.target.value);
        if (isNaN(floatValue)) {
            return e.preventDefault();
        }
        row.value = Math.round(floatValue * 100);
        this.setState({event: this.state.event});
    },

    createEvent() {
        if (!this.state.creating) {
            throw Error("Tried to create event in non-create mode.");
        }
        let content = {};
        if (this.state.contentType == contentTypes.text) {
            content = {
                title: this.state.event.title,
                description: this.state.event.description
            };
        } else if (this.state.contentType = contentTypes.budget) {
            content = {
                title: this.state.event.title,
                itemRows: this.state.event.itemRows
            }
        }
        // TODO: allow this to be better specified
        content.startTime = new Date();
        content.type = this.state.contentType;
        Meteor.call("addEvent", content);

        // Reset the editor to a blank event of the same type
        this.setState({event: {type: this.state.contentType}})
    },

    updateEvent() {
        let newState = {};
        // Clear off the _id value
        Object.keys(this.state.event).forEach(function(key) {
            if (key == "_id") {
                return;
            }
            newState[key] = this.state.event[key];
        }.bind(this));
        Events.update(this.state.event._id, {
            $set: newState
        });
        this.props.toggleEditMode();
    },

    selectContentType(contentType) {
        this.setState({contentType: contentType});
    },

    computeNextBudgetRowIndex() {
        if (!this.state.event.itemRows) {
            return 0;
        } else {
            return this.state.event.itemRows.length;
        }
    },

    renderOptions() {
        const saveOrEdit = (this.state.creating) ? this.createEvent : this.updateEvent;
        return <EventOptions creating={this.state.creating}
                             editing={true}
                             saveOrEditFunc={saveOrEdit}
                             deleteFunc={() => {}} />
    },

    renderCreateBudgetRow(row) {
        const stringValue = row.value.toString();
        const renderedValue = stringValue.substr(0, stringValue.length - 2) + "."
            + stringValue.substr(stringValue.length - 2);
        return (
            <tr key={row.index}>
                <td>
                    <input type="text" placeholder="Description" defaultValue={row.description}
                           onChange={this.handleItemRowDescriptionChange.bind(this, row.index)} />
                </td>
                <td>
                    <input type="text" defaultValue={renderedValue}
                           onChange={this.handleItemRowValueChange.bind(this, row.index)} />
                </td>
            </tr>
        );
    },

    renderCreateBudgetTable() {
        let itemRows = [];
        if (this.state.event.itemRows !== undefined) {
            itemRows = this.state.event.itemRows.map(this.renderCreateBudgetRow);
        }
        // Append on the default row
        itemRows.push(this.renderCreateBudgetRow({
            index: this.computeNextBudgetRowIndex(),
            description: '',
            value: "000"
        }));

        // TODO display a sum, tax + tip (customizable?)
        return (
            <table className="budget-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>$</th>
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
            </table>
        )
    },

    renderCreateBudgetContent() {
        return (
            <div className="budget-content-editor">
                <input type="text" placeholder="Title"
                       value={this.state.event.title}
                       onChange={this.handleTitleChange}/>
                {this.renderCreateBudgetTable()}
                {this.renderEditorSelector()}
            </div>
        )
    },

    renderCreateTextContent() {
        return (
            <div className="text-content-editor">
                <input type="text" placeholder="Title"
                       value={this.state.event.title}
                       onChange={this.handleTitleChange}/>
                <TextArea placeholder="Description"
                          value={this.state.event.description || ""} rows={4}
                          onChange={this.handleDescriptionChange} />
                {this.renderEditorSelector()}
            </div>
        )
    },

    renderEditorSelectorTile(type) {
        const className = "editor-selector-tile -" + type + ((type == this.state.contentType ? " -selected" : ""));
        return (
            <div key={type} className={className} onClick={this.selectContentType.bind(this, type)}>
                {type[0].toUpperCase() + type.substr(1)}
            </div>
        )
    },

    renderEditorSelector() {
        // If we are not creating, we can't change the type
        if (!this.state.creating) return;
        return (
            <div className="editor-selector-container">
                {Object.keys(contentTypes).map(this.renderEditorSelectorTile)}
            </div>
        )
    },

    renderEditor() {
        if (!this.state.contentType) {
            // Render the buttons to select the different types of content
            return this.renderEditorSelector()
        } else if (this.state.contentType == contentTypes.text) {
            return this.renderCreateTextContent()
        } else if (this.state.contentType == contentTypes.budget) {
            return this.renderCreateBudgetContent()
        }
    },

    render() {
        return (
            <div className="create-event-container">
                {this.renderOptions()}
                {this.renderEditor()}
            </div>
        );
    }
});