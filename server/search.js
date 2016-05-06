import DraftJS from "draft-js"

class SearchService {
    constructor(Events, EventsSearchIndex) {
        this.Events = Events;
        this.EventsSearchIndex = EventsSearchIndex;
        this.eventIdToTokens = {};
    }

    start() {
        // Delete the whole index. lol.
        this.EventsSearchIndex.remove({});
        this.eventIdToTokens = {};
        this.Events.find({}).fetch().forEach((event) => {
            this.indexEvent(event)
        });

        // Yay we have an index, now build a Trie!
        this._rebuildTrie();
    }

    _insertEvent(event) {
        if (!event.hasOwnProperty("contents") || ! event.contents.length) {
            return;
        }
        let allText = "";
        event.contents.forEach((content) => {
            if (content.type == "text") {
                if (typeof(content.description) == "string") {
                    allText += content.description + " ";
                } else {
                    const contentState = DraftJS.convertFromRaw(
                        content.description);
                    allText += contentState.getPlainText() + " ";
                }
            }
        });
        allText = allText.trim();
        if (allText) {
            // Yay there's some text to insert for this event
            allText = allText
                .replace(/[^A-Za-z0-9\s]/g,"")
                .replace(/\s{2,}/g, " ")
                .split(/\s+/);
            // Now insert into our lovely index!
            allText.forEach((token) => {
                token = token.toLowerCase();

                // Update our mapping that we need when updating events.
                if (!this.eventIdToTokens.hasOwnProperty(event._id)) {
                    this.eventIdToTokens[event._id] = {}
                }
                this.eventIdToTokens[event._id][token] = true;

                // TODO: Insert each prefix of a token into this and then
                // user the real FT search index on this thing.
                this.EventsSearchIndex.upsert(
                    {token: token},
                    {$addToSet: {events: event._id}}
                );
            });
        }
    }

    _removeEvent(eventId) {
         // If the event is in our map, delete it.
        if (!this.eventIdToTokens.hasOwnProperty(eventId)) {
            return;
        }
        const oldTokens = Object.keys(this.eventIdToTokens[eventId]);
        this.EventsSearchIndex.update(
            {token: {$in: oldTokens}},
            {$pull: {events: eventId}}
        );
        delete this.eventIdToTokens[eventId];
    }

    _rebuildTrie() {
        this.trie = new SearchTrie(this.EventsSearchIndex.find({}).fetch());
    }

    indexEvent(event) {
        this._removeEvent(event._id);
        this._insertEvent(event);
        this._rebuildTrie();
    }

    removeEventFromIndex(eventId) {
        this._removeEvent(eventId);
        this._rebuildTrie();
    }

    getEvents(query) {
        const tokens = query
            .replace(/[^A-Za-z0-9\s]/g,"")
            .replace(/\s{2,}/g, " ")
            .split(/\s+/);

        // If there are no valid tokens to search for, return the empty list.
        if (!tokens.length) {
            return [];
        }

        // Get the set of events for each token in the query. Then perform an
        // AND of the ids at the end.
        const validEvents = {};
        tokens.forEach((token) => {
            token = token.toLowerCase();
            let events = this.trie.getEvents(token);
            events.forEach((eventId) => {
                if (!validEvents.hasOwnProperty(eventId)) {
                    validEvents[eventId] = 0;
                }
                validEvents[eventId] += 1;
            })
        });

        const finalEvents = {};
        Object.keys(validEvents).forEach((eventId) => {
            if (validEvents[eventId] == tokens.length) {
                finalEvents[eventId] = true;
            }
        });
        return Object.keys(finalEvents);
    }
}

class SearchTrie {
    constructor(searchIndex) {
        this.root = {};
        this.wordIndex = {};
        searchIndex.forEach((entry) => {
            // An entry has an _id, a token (string), and a list of event ids
            let i = 0;
            let node = this.root;
            const token = entry.token;
            this.wordIndex[token] = true;
            for (; i < token.length; i++) {
                if (!node.hasOwnProperty(token[i])) {
                    node[token[i]] = {}
                }
                node = node[token[i]];
                if (!node.hasOwnProperty("ends")) {
                    node.ends = {}
                }
                entry.events.forEach((eventId) => {
                    node.ends[eventId] = true
                });
            }
        });
    }

    getEvents(prefix) {
        let i = 0;
        let node = this.root;
        for (; i < prefix.length; i++) {
            if (!node.hasOwnProperty(prefix[i])) {
                return []
            }
            node = node[prefix[i]];
        }
        return Object.keys(node.ends);
    }
}

module.exports = SearchService;