requirejs(
    ['./experiment'],
    function(experiment)
{
    function getUrlVars() {
        let vars = {};
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }
    function getUrlParam(parameter, defaultvalue){
        let urlparameter = defaultvalue;
        if(window.location.href.indexOf(parameter) > -1){
            urlparameter = getUrlVars()[parameter];
        }
        return urlparameter;
    }
    let pid = getUrlParam('pid', 'undefined');

    experiment.createQuestionnaire(pid).then(exp => exp.run());
});