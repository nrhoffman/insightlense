/**
 * Class that manages the state machine for tracking the progress of various tasks (summarizing, rewriting, analyzing).
 */
class StatusStateMachine {
    constructor() {
        this.summarized = false; // Indicates if the content has been summarized
        this.states = {
            summarizing: false, // Tracks if the summarizing operation is currently running
            rewriting: false, // Tracks if the rewriting operation is currently running
            analyzing: false // Tracks if the analyzing operation is currently running
        };
    }

    /**
     * Checks if the content has been summarized.
     * @returns {boolean} - True if the content is summarized, false otherwise.
     */
    isSummarized() {
        return this.summarized === true;
    }

    /**
     * Checks if a specific task (summarizing, rewriting, analyzing) is currently running.
     * @param {string} stateName - The name of the state to check (e.g., 'summarizing', 'rewriting', 'analyzing').
     * @returns {boolean} - True if the task is running, false otherwise.
     */
    isRunning(stateName) {
        return this.states[stateName] === true;
    }

    /**
     * Checks if none of the tracked tasks (summarizing, rewriting, analyzing) are currently running.
     * @returns {boolean} - True if no tasks are running, false otherwise.
     */
    allNotRunning() {
        return Object.values(this.states).every((state) => !state);
    }

    /**
     * Marks the content as summarized.
     */
    setSummarized() {
        this.summarized = true;
    }

    /**
     * Changes the state of a specific task (summarizing, rewriting, analyzing) to reflect whether it is running or not.
     * @param {string} type - The type of task to update (e.g., 'summarizing', 'rewriting', 'analyzing').
     * @param {boolean} value - The new state for the task (true for running, false for not running).
     */
    stateChange(type, value) {
        switch (type) {
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