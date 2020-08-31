/**
 * Fetches a spec from the server in order to run an experiment
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */
define(function() {
async function fetchExperimentParams() {
    const res = await fetch ("/api/get-experiment-spec");
    const text = await res.text();
    const data = JSON.parse(text);
    console.log(data);
    return data;
}

return fetchExperimentParams;
})