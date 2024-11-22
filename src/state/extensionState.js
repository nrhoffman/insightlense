class ExtensionState {
    constructor() {
        if (!ExtensionState.instance) {
            this.chatModels = new Map();
            this.statuses = new Map();
            ExtensionState.instance = this;
        }
        return ExtensionState.instance;
    }

    getChatModel(tabId) {
        return this.chatModels.get(tabId);
    }

    hasChatModel(tabId) {
        return this.chatModels.has(tabId);
    }

    setChatModel(tabId, model) {
        this.chatModels.set(tabId, model);
    }

    getStatus(tabId) {
        return this.statuses.get(tabId);
    }

    hasStatus(tabId) {
        return this.statuses.has(tabId);
    }

    setStatus(tabId, status) {
        this.statuses.set(tabId, status);
    }

    cleanUpTab(tabId) {
        this.chatModels.delete(tabId);
        this.statuses.delete(tabId);
    }
}

export default ExtensionState;