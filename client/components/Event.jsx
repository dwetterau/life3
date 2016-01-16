contentTypes = {
    text: "text",
    budget: "budget"
};

Event = React.createClass({
    propTypes: {
        event: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            inEditMode: false
        }
    },

    toggleEditMode() {
        this.setState({inEditMode: !this.state.inEditMode});
    },

    updateEvent(eventId, newEvent) {
        Meteor.call("updateEvent", eventId, newEvent);
        this.toggleEditMode();
    },

    deleteEvent() {
        Meteor.call("deleteEvent", this.props.event._id);
    },

    renderOptions() {
        return <EventOptions creating={false}
                             editing={this.state.inEditMode}
                             saveOrEditFunc={this.toggleEditMode}
                             deleteFunc={this.deleteEvent} />
    },

    renderTextContent(content, index) {
        const source = content.description || "";
        return (
            <div className="event-content" key={index}>
                <ReactMarkdown
                    className="event-description"
                    source={source} />
            </div>
        )
    },

    renderBudgetPayee(content) {
        return (
            <h3 className="budget-payee">{content.payee}</h3>
        )
    },

    renderBudgetValue(value, isExpense) {
        // Convert the number to a string
        let fractional = Math.abs(value % 100);

        // Pad with a 0 if needed
        if (fractional < 10) {
            fractional = `0${fractional}`;
        }
        let className = "budget-value";
        if (isExpense) {
            // Flip the sign of an expense, we expect it to be negative
            value *= -1;
            className += " -expense"
        }
        let representation = "";
        if (value >= 0) {
            let integer = Math.floor(value / 100);
            representation = `\$${integer}.${fractional}`;
        } else  {
            className += " -negative";
            let integer = Math.ceil(value / 100);
            representation = `-\$${-1 * integer}.${fractional}`;
        }

        return (
            <div className={className}>
                {representation}
            </div>
        )
    },

    renderBudgetItemRow(itemRow) {
        return (
            <div key={itemRow.index} className="budget-item-row">
                <div className="budget-item-row-header">
                    <div className="budget-item-row-description">
                        {itemRow.description}
                    </div>
                </div>
                {this.renderBudgetValue(itemRow.value, itemRow.isExpense)}
            </div>
        )
    },

    renderBudgetContentItemRows(content) {
        const itemRows = content.itemRows || [];
        return (
            <div className="event-budget-item-rows">
                {itemRows.map(this.renderBudgetItemRow)}
            </div>
        )
    },

    renderBudgetContentTotal(content) {
        const itemRows = content.itemRows || [];

        // Sum up all of the itemRows
        let sum = 0;
        itemRows.forEach(function(itemRow) {
            sum += itemRow.value * ((itemRow.isExpense) ? -1 : 1);
        });
        return (
            <div className="event-budget-total">
                {this.renderBudgetValue(sum, false)}
            </div>
        )
    },

    renderBudgetContent(content, index) {
        return (
            <div className="event-content" key={index}>
                {this.renderBudgetPayee(content)}
                {this.renderBudgetContentItemRows(content)}
                {this.renderBudgetContentTotal(content)}
            </div>
        )
    },

    renderContent(content, index) {
        if (content.type == contentTypes.text) {
            return this.renderTextContent(content, index);
        } else if (content.type == contentTypes.budget) {
            return this.renderBudgetContent(content, index);
        }
    },

    renderEventContents() {
        const eventContents = this.props.event.contents || [];
        return (
            <div className="event-contents">
                {eventContents.map(this.renderContent)}
            </div>
        )
    },

    renderEventBody() {
        const formattedDate = moment(this.props.event.startTime).format("ll");
        return (
            <div className="event-body">
                <div className="event-header">
                    <div className="event-date">{formattedDate}</div>
                    <div className="event-title">{this.props.event.title}</div>
                </div>
                {this.renderEventContents()}
            </div>
        )
    },

    renderEvent() {
        if (!this.state.inEditMode) {
            return (
                <div className="rendered-event-container">
                    {this.renderOptions()}
                    {this.renderEventBody()}
                </div>
            )
        } else {
            return (
                <EditEvent event={this.props.event}
                           updateFunc={this.updateEvent}
                           deleteFunc={this.deleteEvent} />
            )
        }
    },

    render() {
        return (
            <div className="event-container card">
                {this.renderEvent()}
            </div>
        );
    }
});