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
        this.note_timeout_ = undefined;
    }

    async initialize() {
        if (this.initialized_) return;

        await this.context_.audioWorklet.addModule('scripts/fm_synth_processor.js');
        this.node_ = new FMSynthNode(this.context_);
        this.node_.connect(this.context_.destination);

        this.initialized_ = true;
    }

    setParam(paramName, value, rampTime) {
        this.node_.parameters.get(paramName).value = value;
    }

    setAllParams(paramStates, rampTime) {
        for (let param in paramStates) {
            this.node_.parameters.get(param).value = paramStates[param];
        }
    }

    getParam(paramName) {
        return this.node_.parameters.get(paramName).value;
    }

    getAllParams() {
        const paramStates = {};
        for (const key of this.node_.parameters.keys()) {
            paramStates[key] = this.node_.parameters.get(key).value;
        }
        return paramStates;
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

    playNoteWithEnvLengths(note, sustainTime, segmentLength) {
        const attackTime = Math.max(
            this.getParam('attack_1'),
            this.getParam('attack_2'),
            this.getParam('attack_3'));
        const decayTime = Math.max(
            this.getParam('decay_1'),
            this.getParam('decay_2'),
            this.getParam('decay_3'));

        const holdTime = (attackTime + decayTime + sustainTime) * segmentLength;

        this.startNote(note);
        if (this.noteTimeout !== undefined) clearTimeout(this.noteTimeout);
        this.noteTimeout = setTimeout(() => this.endNote(), holdTime * 1000);
    }
}
});