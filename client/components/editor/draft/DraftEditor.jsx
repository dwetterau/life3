converter = new DraftMarkup(MarkdownSyntax);
DraftEditor = React.createClass({
    propTypes: {
        text: React.PropTypes.oneOfType([
            React.PropTypes.string, // legacy Markdown format
            React.PropTypes.object // new RawContent format
        ]).isRequired,

        readOnly: React.PropTypes.bool.isRequired,

        onTextChange: React.PropTypes.func.isRequired,

        showOptions: React.PropTypes.bool.isRequired,

        initialOptions: React.PropTypes.object,

        placeholder: React.PropTypes.string
    },

    getInitialState() {
        // Convert the markdown text to an initial content object
        const editorState = this.getInitialEditorState(this.props.text);
        return {editorState};
    },

    getInitialEditorState(text) {
        let rawContent = text;
        if (typeof(rawContent) == "string") {
            // The legacy conversion flow
            rawContent =  converter.toRawContent(text);
        }
        const blocks = DraftJS.convertFromRaw(rawContent);
        let editorState;
        if (blocks.length) {
            const contentState =
                DraftJS.ContentState.createFromBlockArray(blocks);
            editorState = DraftJS.EditorState.createWithContent(contentState)
        } else {
            editorState = DraftJS.EditorState.createEmpty()
        }
        return editorState;
    },

    initializeEditor(props, editorState) {
        // initialize the editor styles that we want, forcing into them if we
        // have to.
        if (!props.initialOptions) return;
        if (props.initialOptions.hasOwnProperty("inline")) {
            let currentStyle = editorState.getCurrentInlineStyle();
            props.initialOptions["inline"].forEach(function(style) {
                if (!currentStyle.has(style)) {
                    this.handleInlineClick(style, editorState)
                }
            }.bind(this));
        }
        if (props.initialOptions.hasOwnProperty("block")) {
            const blockType = this.getBlockType(editorState);
            console.log(blockType, props.initialOptions["block"]);
            if (blockType != props.initialOptions["block"]) {
                this.handleBlockClick(
                    props.initialOptions["block"],
                    editorState);
            }
        }
    },

    getBlockType(editorState) {
        const selection = editorState.getSelection();
        return editorState.getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();
    },

    componentDidMount() {
        this.initializeEditor(this.props, this.state.editorState);
    },

    componentWillReceiveProps(newProps) {
        if (!newProps.text && this.props.text) {
            console.log("Will receive new props", newProps);
            const editorState = this.getInitialEditorState(newProps.text);
            this.onChange(editorState);
            this.initializeEditor(newProps, editorState);
        }
    },

    onChange(editorState) {
        const contentState = editorState.getCurrentContent();
        const rawContent = DraftJS.convertToRaw(contentState);
        this.props.onTextChange(rawContent);
        this.setState({editorState})
    },

    // Editor buttons
    // Inline styles
    inlineStyleOptions: [
        {label: 'Bold', style: 'BOLD'},
        {label: 'Italic', style: 'ITALIC'},
        {label: 'Underline', style: 'UNDERLINE'},
        {label: 'Code', style: 'CODE'}
    ],

    handleInlineClick(inlineStyle, editorState) {
        if (!editorState) {
            editorState = this.state.editorState;
        }
        this.onChange(DraftJS.RichUtils.toggleInlineStyle(
            editorState, inlineStyle));
    },

    renderInlineButtons() {
        let currentStyle = this.state.editorState.getCurrentInlineStyle();
        return (
            <div className="inline-styles">
                {this.inlineStyleOptions.map((styleOptions) => {
                    let className = "-" + styleOptions.label;
                    if (currentStyle.has(styleOptions.style)) {
                        className += " -active"
                    }
                    return (
                        <div key={styleOptions.label}
                             className={className}
                             onClick={this.handleInlineClick.bind(
                                this, styleOptions.style)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        );
    },

    // Block styles
    blockStyleOptions: [
        {label: 'H1', style: 'header-one'},
        {label: 'H2', style: 'header-two'},
        {label: 'H3', style: 'header-three'},
        {label: 'Blockquote', style: 'blockquote'},
        {label: 'UL', style: 'unordered-list-item'},
        {label: 'OL', style: 'ordered-list-item'},
        {label: 'Code Block', style: 'code-block'}
    ],

    handleBlockClick(blockStyle, editorState) {
        if (!editorState) {
            editorState = this.state.editorState;
        }
        this.onChange(DraftJS.RichUtils.toggleBlockType(
            editorState, blockStyle));
    },

    renderBlockButtons() {
        const blockType = this.getBlockType(this.state.editorState);
        return (
            <div className="block-styles">
                {this.blockStyleOptions.map((styleOptions) => {
                    let className = "-" + styleOptions.label;
                    if (blockType == styleOptions.style) {
                        className += " -active"
                    }
                    return (
                        <div key={styleOptions.label}
                             className={className}
                             onClick={this.handleBlockClick.bind(
                                this, styleOptions.style)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        );
    },

    renderEditorButtons() {
        if (this.props.readOnly || !this.props.showOptions) {
            return;
        }
        return (
            <div className="draft-editor-buttons">
                {this.renderInlineButtons()}
                {this.renderBlockButtons()}
            </div>
        )
    },

    render() {
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'draft-editor';
        var contentState = this.state.editorState.getCurrentContent();
        if (!contentState.hasText()) {
            const type = contentState.getBlockMap().first().getType();
            if (!(type == 'unstyled' || (
                    this.props.initialOptions &&
                    this.props.initialOptions.hasOwnProperty("block") &&
                    type == this.props.initialOptions["block"]))) {
                className += ' -hide-placeHolder';
            }
        }

        const {editorState} = this.state;
        return (
            <div className={className}>
                {this.renderEditorButtons()}
                <DraftJS.Editor
                    editorState={editorState}
                    readOnly={this.props.readOnly}
                    onChange={this.onChange}
                    placeholder={this.props.placeholder} />
            </div>
        );
    }
});
