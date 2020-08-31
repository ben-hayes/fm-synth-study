/**
 * Allows a participant to take only the questionnaire (if for some reason it 
 * wasn't properly submitted)
 * @author Ben Hayes <b.j.hayes@se19.qmul.ac.uk>
 */
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