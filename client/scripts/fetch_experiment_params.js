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