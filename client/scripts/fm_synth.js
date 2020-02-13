// FM Synth

// constructor (audioContext, initialParams?)
//  - initiates audio worklet node and processor

// set parameter (param, value, rampTime?)
//  - sets a given parameter to a particular value
//  - can ramp its value over time

// set all parameters (obj of param states, rampTime?)
//  - sets all parameters to a given state snapshot
//  - can ramp all values over time

// play note (note number)
//  - starts synth sounding (attack portion)

// end note ()
//  - end any sounding note

define(['./fm_synth_node'], function (FMSynthNode) {
return class FMSynth {
    constructor(audioContext) {
        this.context_ = audioContext;
        this.initialized_ = false;
    }

    async initialize() {
        if (this.initialized_) return;

        await this.context_.audioWorklet.addModule('scripts/fm_synth_processor.js');
        this.node_ = new FMSynthNode(this.context_);
        this.node_.connect(this.context_.destination);

        this.initialized_ = true;
    }

    setParam(paramName, value, rampTime) {

    }

    setAllParams(paramStates, rampTime) {

    }

    startNote(note) {
        this.node_.port.postMessage({
            'type': 'note_on',
            'note': note,
        });
    }

    endNote() {
        this.node_.port.postMessage({
            'type': 'note_off',
        });
    }
}
});