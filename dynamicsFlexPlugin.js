import { FlexPlugin} from 'flex-plugin';
const loadjs = require ("loadjs")
const PLUGIN_NAME = 'DynamicsPlugin';
​
​
export default class DynamicsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }
​
​
  init(flex, manager) {
​
    loadjs('https://<YOUR_ORG>.crm.dynamics.com/webresources/Widget/msdyn_ciLibrary.js', 'CIF')//You must use your own dynamics URL here
    loadjs.ready('CIF', function() {
      window.Microsoft.CIFramework.addHandler("onclicktoact", function() {
       //your click to act code goes here
      });
​
​
    })
​
    function panel(mode) {
      window.Microsoft.CIFramework.setMode(mode);
    }
​
​
    function screenpop(contactno, caseNumber,incidentID) {
      panel(1);
      if ((caseNumber!=='') && (!caseNumber !== null)){
          // retrieve contact record
        window.Microsoft.CIFramework.searchAndOpenRecords('incident', `?$select=ticketnumber,title&$search=${caseNumber}&$top=1&$filter=incidentid eq ${incidentID}`, false )
      }
      else {
        window.Microsoft.CIFramework.searchAndOpenRecords('contact', `?$select=name,telephone1&$filter=telephone1 eq ‘${contactno}’&$search=${contactno}`, false)
      }
    }
​
    manager.workerClient.on("reservationCreated", function(reservation) {
      var incidentID = `${reservation.task.attributes.incidentID}`; // The incident ID in dynamics
      var caseNumber = `${reservation.task.attributes.caseNumber}`; // The case number to be searched
      var contactno = `${reservation.task.attributes.from}`; // The contact number to be searched
​
     if(reservation.task.attributes.direction !== 'outbound') {
          screenpop(contactno, caseNumber,incidentID)
        } 
      else {
        panel(1);
        }
    });
​
    flex.AgentDesktopView
          .defaultProps
          .showPanel2 = false;
​
    flex.RootContainer.Content.remove("project-switcher")
​
    flex.MainContainer
        .defaultProps
        .keepSideNavOpen = true;
​
    flex.Actions.addListener("afterCompleteTask", (payload) => {
      panel(0);
     });
​
    flex.Actions.addListener("afterNavigateToView", (payload) => {
      panel(1);
     });
​
  }
​
}