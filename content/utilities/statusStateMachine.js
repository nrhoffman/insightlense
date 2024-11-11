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
        if (!this.states.hasOwnProperty(stateName)) {
            console.error(`Invalid state name: ${stateName}. Available states: summarizing, rewriting, analyzing.`);
            return false;  // Defaulting to false if state name is invalid
        }
        return this.states[stateName];
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
        console.log("Content marked as summarized.");
    }

    /**
     * Changes the state of a specific task (summarizing, rewriting, analyzing) to reflect whether it is running or not.
     * @param {string} type - The type of task to update (e.g., 'summarizing', 'rewriting', 'analyzing').
     * @param {boolean} value - The new state for the task (true for running, false for not running).
     */
    stateChange(type, value) {
        if (!this.states.hasOwnProperty(type)) {
            console.error(`Invalid task type: ${type}. Available types: summarizing, rewriting, analyzing.`);
            return;
        }

        if (this.states[type] === value) {
            console.log(`State for "${type}" is already set to ${value}. No change needed.`);
            return;
        }

        this.states[type] = value;

        if (value) {
            console.log(`Task "${type}" started.`);
        } else {
            console.log(`Task "${type}" finished.`);
        }

        // Log the current state of all tasks
        console.log(`Current States: summarizing=${this.states.summarizing}, rewriting=${this.states.rewriting}, analyzing=${this.states.analyzing}`);
    }

    /**
     * Resets all states to their initial values (not running).
     */
    resetStates() {
        this.states = {
            summarizing: false,
            rewriting: false,
            analyzing: false
        };
        this.summarized = false;
        console.log("All states have been reset.");
    }
}

export default StatusStateMachine;