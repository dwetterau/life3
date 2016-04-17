import DraftJS from "draft-js"
import DraftMarkup from "draft-markup"
import MarkdownSyntax from "draft-markup/syntaxes/markdown";
import React from "react";

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
        return {
            editorState,
            // State for link editing
            editingLink: false,
            urlValue: ''
        };
    },

    findLinkEntities(contentBlock, callback) {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                return entityKey != null && (
                    DraftJS.Entity.get(entityKey).getType() === 'LINK');
            },
            callback
        );
    },

    getInitialEditorState(text) {
        let rawContent = text;
        if (typeof(rawContent) == "string") {
            // The legacy conversion flow
            rawContent =  converter.toRawContent(text);
        }
        const blocks = DraftJS.convertFromRaw(rawContent);
        let editorState;
        const decorator = new DraftJS.CompositeDecorator([{
            strategy: this.findLinkEntities,
            component: Link
        }]);

        if (blocks.length) {
            const contentState =
                DraftJS.ContentState.createFromBlockArray(blocks);
            editorState = DraftJS.EditorState.createWithContent(
                contentState, decorator)
        } else {
            editorState = DraftJS.EditorState.createEmpty(decorator)
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
        // TODO: Un-disable this. There are issues right now with setting the
        // block type, typing some stuff, and then deleting it all. Seems
        // like the draft.js contributors are aware of the issue.
        if (false && props.initialOptions.hasOwnProperty("block")) {
            const blockType = this.getBlockType(editorState);
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
                                this, styleOptions.style,
                                this.state.editorState)}>
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
                                this, styleOptions.style,
                                this.state.editorState)}>
                            {styleOptions.label}
                        </div>
                    );
                })}
            </div>
        );
    },

    // Other custom styles
    promptForLink() {
        this.setState({editingLink: !this.state.editingLink, urlValue: ''})
    },

    handleUrlChange(e) {
        this.setState({urlValue: e.target.value})
    },

    handleUrlKeyDown(e) {
        if (e.which === 13) {
            this.createNewLink();
        }
    },

    createNewLink() {
        const entityKey = DraftJS.Entity.create('LINK', 'MUTABLE', {
            url: this.state.urlValue});
        this.setState({
            editorState: DraftJS.RichUtils.toggleLink(
                this.state.editorState,
                this.state.editorState.getSelection(),
                entityKey
            ),
            editingLink: false,
            urlValue: ''
        })
    },

    renderLinkPrompt() {
        if (!this.state.editingLink) return;
        return (
            <div className="link-editor">
                <input type="text" placeholder="Type link here.."
                       value={this.state.urlValue}
                       onChange={this.handleUrlChange}
                       onKeyDown={this.handleUrlKeyDown} />
                <a onClick={this.createNewLink}>done</a>
            </div>
        )
    },

    renderLinkButton() {
        return (
            <div className="link-button-container">
                <div className="link-button"
                     onClick={this.promptForLink} >
                    Link
                </div>
            </div>
        )
    },

    renderEditorButtons() {
        if (this.props.readOnly || !this.props.showOptions) {
            return;
        }
        return (
            <div className="draft-editor-buttons">
                {this.renderInlineButtons()}
                {this.renderBlockButtons()}
                {this.renderLinkButton()}
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
                {this.renderLinkPrompt()}
                <DraftJS.Editor
                    editorState={editorState}
                    readOnly={this.props.readOnly}
                    onChange={this.onChange}
                    placeholder={this.props.placeholder} />
            </div>
        );
    }
});
