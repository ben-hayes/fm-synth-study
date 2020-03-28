
requirejs(['./fm_synth'], function(FMSynth) {
    async function getPatches() {
        const patches = await fetch('https://qm-fm-study.herokuapp.com/api/get-synth-patches');
        const text = await patches.text();
        return JSON.parse(text);
    }

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    document.addEventListener('keydown', () => {
        if (context.state !== 'running') {
            context.resume();
        }
    });
    const synth = new FMSynth(context);

    synth.initialize().then(() => getPatches()).then(patches => {
        const nodes = [];
        const edges = [];
        console.log(patches);
        patches.forEach(patch => {
            nodes.push({
                id: patch.synth_id,
                label: patch.note.toString(),
                color: patch.reference_sound === 'default' ? 'blue' : 'green',
            });
            edges.push({
                from: patch.reference_sound,
                to: patch.synth_id,
                label: patch.prompt.descriptor,
                arrows: 'to',
            })
        });

        const nodes_set = new vis.DataSet(nodes);
        const edges_set = new vis.DataSet(edges);
        // create a network
        var container = document.getElementById('mynetwork');

        // provide the data in the vis format
        var data = {
            nodes: nodes_set,
            edges: edges_set
        };
        var options = {
            layout: {
                hierarchical: true,
            }
        };

        // initialize your network!
        var network = new vis.Network(container, data, options);
        let playing = false;
        network.on('click', e => {
            const clicked_node = e.nodes[0];
            if (clicked_node !== undefined) {
                const selected_patch =
                    patches.find(patch => patch.synth_id === clicked_node);
                if (!playing || playing !== clicked_node) {
                    synth.setAllParams(selected_patch.synth_parameters);
                    synth.startNote(selected_patch.note);
                    playing = clicked_node;
                } else {
                    synth.endNote();
                    playing = false;
                }
            }
        });
    });
});