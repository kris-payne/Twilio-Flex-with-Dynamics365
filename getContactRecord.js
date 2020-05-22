exports.handler = function(context, event, callback) {
    var DynamicsWebApi = require('dynamics-web-api');
    var resource = 'https://<YOUR_ORG>.crm.dynamics.com';
    function acquireToken(dynamicsWebApiCallback){
        dynamicsWebApiCallback(event.token);
    }    
    //create DynamicsWebApi object
    var dynamicsWebApi = new DynamicsWebApi({
        webApiUrl: 'https://<YOUR_ORG>.api.crm.dynamics.com/api/data/v9.0/',
        onTokenRefresh: acquireToken
    });
    
    var request = {
        collection: "contacts",
        select: ["fullname", "firstname","lastname","emailaddress1","contactid","mobilephone"],
        filter: "mobilephone eq '"+ event.contact+"'",
        maxPageSize: 5,
        count: true
    };
     
    //perform a multiple records retrieve operation
    dynamicsWebApi.retrieveMultipleRequest(request).then(function (response) {
        var count = response.oDataCount;
        var nextLink = response.oDataNextLink;
        var records = response.value;
        var recordCount = Object.keys(records).length;
        if (recordCount >=1){
            console.log(records[0].contactid);
            console.log(records[0].firstname);
            console.log(records[0].incidentID);
            var incidentID;
            var caseNumber;
            //Get incidentID
            var caseContact='contact('+records[0].contactid+')';
            console.log(caseContact);
            request = {
                collection: "incidents",
                select: ["ticketnumber,incidentid"],
                filter: "_customerid_value eq "+records[0].contactid,
                maxPageSize: 1,
                count: true
            };
            //perform a multiple records retrieve operation
            dynamicsWebApi.retrieveMultipleRequest(request).then(function (response) {
                var caseRecords = response.value;
                var caseRecordCount = Object.keys(caseRecords).length;
                if (caseRecordCount >=1){
                    incidentID = caseRecords[0].incidentid;
                    caseNumber= caseRecords[0].ticketnumber.substr(4);
                    console.log(caseNumber);
                    console.log('Found case');
                    //callback(null,{ticketNumber: caseRecords[0].ticketnumber, incidentid:caseRecords[0].incidentid} );
                    callback(null, {
            			contact_id: records[0].contactid,
            			first_name: records[0].firstname,
            			email: records[0].emailaddress1,
            			last_name: records[0].lastname,
            			phone: records[0].mobilephone,
            			CaseNumber: caseNumber,
            			incidentID: incidentID
        			});
                }
                else{
                    console.log('No case');
                    callback(null, {
            			contact_id: records[0].contactid,
            			first_name: records[0].firstname,
            			email: records[0].emailaddress1,
            			last_name: records[0].lastname,
            			phone: records[0].mobilephone,
            			CaseNumber: caseNumber,
            			incidentID: incidentID
        			});
                }
            })
            .catch(function (error){
                //catch an error
                console.log(error);
                 console.log('Error no record');
                callback(null,error);
            });
        }
        else{
            console.log('Error no record');
            callback(null,'Error');
        }
        //do something else with a records array. Access a record: response.value[0].subject;
    })
    .catch(function (error){
        //catch an error
        console.log(error);
         console.log('Error no record');
        callback(null,'No Record');
    });
};