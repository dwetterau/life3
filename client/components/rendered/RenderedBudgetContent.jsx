RenderedBudgetContent = React.createClass({
    propTypes: {
        content: React.PropTypes.object.isRequired
    },

    renderBudgetPayee() {
        return (
            <h3 className="budget-payee">{this.props.content.payee}</h3>
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
            <div key={itemRow._id} className="budget-item-row">
                <div className="budget-item-row-header">
                    <div className="budget-item-row-description">
                        {itemRow.description}
                    </div>
                </div>
                {this.renderBudgetValue(itemRow.value, itemRow.isExpense)}
            </div>
        )
    },

    renderBudgetContentItemRows() {
        const itemRows = this.props.content.itemRows || [];
        return (
            <div className="event-budget-item-rows">
                {itemRows.map(this.renderBudgetItemRow)}
            </div>
        )
    },

    renderBudgetContentTotal() {
        const itemRows = this.props.content.itemRows || [];

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

    render() {
        return (
            <div className="event-content">
                {this.renderBudgetPayee()}
                {this.renderBudgetContentItemRows()}
                {this.renderBudgetContentTotal()}
            </div>
        )
    }
});