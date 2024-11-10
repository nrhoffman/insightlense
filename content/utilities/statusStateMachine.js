class StatusStateMachine {
    constructor() {
        this.initialized = false;
        this.summarized = false;
        this.states = {
            initializing: false,
            summarizing: false,
            rewriting: false,
            analyzing: false
        };
    }

    // Method to get the current state of initialized
    isInitialized() {
        return this.initialized === true;
    }

    // Method to get the current state of summarized
    isSummarized() {
        return this.summarized === true;
    }

    // Method to get the current state of a specific readiness flag
    isRunning(stateName) {
        return this.states[stateName] === true;
    }

    // Method to check if all states are ready
    allNotRunning() {
        return Object.values(this.states).every((state) => !state);
    }

    // Method to mark initialization as complete
    setInitialized() {
        this.initialized = true;
    }

    // Method to mark summarization as complete
    setSummarized() {
        this.summarized = true;
    }

    // Method to transition state based on the type of operation completed
    stateChange(type, value) {
        switch (type) {
            case 'initializing':
                this.states["initializing"] = value;
                break;
            case 'summarizing':
                this.states["summarizing"] = value;
                break;
            case 'rewriting':
                this.states["rewriting"] = value;
                break;
            case 'analyzing':
                this.states["analyzing"] = value;
                break;
            default:
                console.error(`Unknown transition type: ${type}`);
        }
    }
}

export default StatusStateMachine;
