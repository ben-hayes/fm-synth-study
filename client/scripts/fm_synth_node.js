/**
 * Implements a basic AudioWorkletNode to wrap the FM synth processor
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */
define(function () {
return class FMSynthNode extends AudioWorkletNode {
    constructor(context) {
    super(context, 'fm_synth_processor');
    }
}
});