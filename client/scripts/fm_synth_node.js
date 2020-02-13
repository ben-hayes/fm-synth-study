define(function () {
return class FMSynthNode extends AudioWorkletNode {
    constructor(context) {
    super(context, 'fm_synth_processor');
    }
}
});