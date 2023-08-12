var qdb = new QuickBaseClient;
var fidToLabel = new Object();
var field = new Object();
var f = new Object();
var rid = "";
var qid = "";
var fid = new Object();
var vars = new Object();
var ridFid = "3";
var xmlRecord;
var record;
var schema;
var dbid;
var sfid;
var pagename;
var ticketParam;

function qdbEF()
{   dbid="";
    var thisURL = document.location.href;
    window.document.onkeypress = snapShotEF;
    thisURL.match(/\/db\/([^\?]+)\?/);
    dbid = RegExp.$1;
    var clist ="0";
    var queryString = window.location.search;
    queryString = queryString.substring(1);
    var queryNameValuePairs = queryString.split("&");
    for (var i = 0; i < queryNameValuePairs.length; i++)
         {
          var queryNameValuePair = queryNameValuePairs[i].split("=");
          var pairName = queryNameValuePair[0];
          var pairValue = queryNameValuePair[1];
          if(pairName.match(/DBID/i))
              {
               dbid = pairValue;
               }
          else if(pairName.match(/rid/i))
              {
               rid = pairValue;
               }
          else if(pairName.match(/ticket/i))
             {
               console.log('matched ticket', pairValue);
              ticketParam = pairValue;
              }
          else if(pairName.match(/qid/i))
              {
               qid = pairValue;
               }
 
          else if(pairName.match(/clist/i))
              {
               clist = pairValue;
               }
          else if(pairName.match(/sfid/i))
              {
               sfid = pairValue;
               }
          else if(pairName.match(/pagename/i))
              {
               pagename = pairValue;
               }
         }
   if(rid == "" && qid == "")
        {
         alert("Please include the Record ID# of a record as a 'rid' parameter or the query identifier of a report as a 'qid' parameter of the query string!");
         return;
        }
   if(clist =="0")
      {
       schema = qdb.GetSchema(dbid);
       if(qdb.displayErrorAlert("Could not get the schema of your table because: "))
          {
          return;
          }
       ridFid = qdb.selectSingleNode(schema, "/*/table/fields/field[@field_type = 'recordid']/@id").nodeValue;
       var fields = qdb.selectNodes(schema, "/*/table/fields/field");
       clist="";
       for(var i = 0; i < fields.length; i++)
          {
           var thisField = fields[i];
           var txtfid = qdb.selectSingleNode(thisField, "@id").nodeValue;
           clist += txtfid+ ".";
           var fieldLabel = qdb.selectSingleNode(thisField, "label").childNodes[0].nodeValue;
           if(fieldLabel.toLowerCase() == 'length')
      {
      fieldLabel = 'qdbEF_length';
      }
           fidToLabel[txtfid] = fieldLabel;
           }
       }
    if(qid != "")
        {
        xmlRecord = qdb.DoQuery(dbid, qid, clist, "");
        }
    else
        {
        xmlRecord = qdb.DoQuery(dbid, "{'"+ ridFid +"'.EX.'"+ rid +"'}", clist, "");
        }
   if(clist !="0")
        {
        var fields = qdb.selectNodes(xmlRecord, "/*/table/fields/field");
        for(var i = 0; i < fields.length; i++)
          {
           var thisField = fields[i];
           var txtfid = qdb.selectSingleNode(thisField, "@id").nodeValue;
           var fieldLabel = qdb.selectSingleNode(thisField, "label").childNodes[0].nodeValue;
           if(fieldLabel.toLowerCase() == 'length')
      {
      fieldLabel = 'qdbEF_length';
      }
           fidToLabel[txtfid] = fieldLabel;
           }
        }
    var variables = qdb.selectNodes(xmlRecord, "/*/table/variables/var");
    for(var i = 0; i < variables.length; i++)
        {
        var qvar = variables[i];
        var varname = qdb.selectSingleNode(qvar, "@name").nodeValue;
        if(varname.toLowerCase() == 'length')
          {
          varname = 'qdbEF_length';
          }
        var dataNodes = qdb.selectNodes(qvar, "text() | BR");
        vars[varname] = "";        
        vars[varname.toLowerCase()] = "";
        for(var j = 0; j < dataNodes.length; j++)
          {
            var dataNode = dataNodes[j];
            if(dataNode.nodeType == 3)
                {
                vars[varname] += dataNode.nodeValue;
                if(varname != varname.toLowerCase())
                    {
                    vars[varname.toLowerCase()] += dataNode.nodeValue;
                    }
                }
            else
                {
                vars[varname] += "<BR>\r\n";
                if(varname != varname.toLowerCase())
                    {
                    vars[varname.toLowerCase()] += "<BR>\r\n";
                    }
                }
           }
        }
    var templateHTML = window.document.body.innerHTML;
    window.document.body.innerHTML = ""
    var records = qdb.selectNodes(xmlRecord, "/*/table/records/record");
    var pageCounter = 0;
    
    for(var i = 0; i < records.length; i++)
        {
        record = records[i];
        fillRecordArrays(qdb.selectNodes(record, "f"));
        var newNode = window.document.createElement("DIV");
        newNode = window.document.body.appendChild(newNode);
        if(pageCounter > 0)
            {
            newNode.style.pageBreakBefore = "always";
            }
        pageCounter++;
        newNode.innerHTML = replaceTokens(templateHTML);
        }
}

function fillRecordArrays(fields)
{    
    for(var j = 0; j < fields.length; j++)
        {
        var thisField = fields[j];
       var txtfid = qdb.selectSingleNode(thisField, "@id").nodeValue;
       var field_type = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/@field_type").nodeValue;
       var base_type = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/@base_type").nodeValue;
       var data = thisField;
       f[txtfid] = qdb.text(data);
       if(data.childNodes.length == 0)
          {
           data="";
           }
       else if(field_type == "timestamp" || field_type == "date")
          {
           data = qdb.format(data.childNodes[0].nodeValue, "date");           
           }
       else if(field_type == "timeofday")
           {
           data = qdb.format(data.childNodes[0].nodeValue, "timeofday");            
           }
       else if(field_type == "file")
           {
            var url = qdb.selectSingleNode(data, "url");
            if(url)
              {
              data = url.childNodes[0].nodeValue;
              if(data.match(/jpe?g$|gif$|png$/i))
                  {
                  data = "<img src='" + data + "'>";
                  }
               }
            else
               {
               data = "";
               }
            }
       else if(field_type == "dblink")
            {
            var target_dbid = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/target_dbid").childNodes[0].nodeValue;
            var target_fid = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/target_fid").childNodes[0].nodeValue;
            var url = "API_GenResultsTable&query={'"+target_fid+"'.EX.'" + data.childNodes[0].nodeValue + "'}&options=nvw.ned.phd.nfg";
            data = qdb.GetURL(target_dbid, url);
            }
       else if(field_type == "text")
           {
            data="";
            var allowHTMLnode = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/allowHTML");
            var dataNodes = qdb.selectNodes(thisField, "text() | BR");
            for(var k = 0; k < dataNodes.length; k++)
                {
                var dataNode = dataNodes[k];
                if(dataNode.nodeType == 3)
                   {  
                    if (allowHTMLnode && (allowHTMLnode.childNodes[0].nodeValue == 1))
                      {
                      data += dataNode.nodeValue;
                      }
                    else
                      {                 
                        var dataText = dataNode.nodeValue.replace(/&/g, "&amp;");
                            dataText = dataText.replace(/>/g, "&gt;");
                            dataText = dataText.replace(/</g, "&lt;");
                            dataText = dataText.replace(/\"/g, "\&quot;");
                            data += dataText;
                      }
                   }
                else
                   {
                    data += "<BR>\r\n";
                    }
                }
            }
       else if(base_type == "float")
            {
             var currency_symbol = "";
             var currency_format = 0;
             var commas = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/comma_start");
             if(commas)
                {
                 commas=parseInt(commas.childNodes[0].nodeValue);
                 }
             else
                 {
                  commas = 0;
                  }
             var decimal_places = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/decimal_places");
             if(decimal_places)
                {
                 decimal_places=parseInt(decimal_places.childNodes[0].nodeValue);
                 }
             else
                 {
                  decimal_places= undefined;
                  }

             if(field_type == "currency")
                 {
                  currency_symbol = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/currency_symbol").childNodes[0].nodeValue;
                  currency_format = qdb.selectSingleNode(xmlRecord, "/*/table/fields/field[@id="+txtfid+"]/currency_format").childNodes[0].nodeValue;
                  }
             data=data.childNodes[0].nodeValue;
             var divideByHundred = data.match(/%/);
             data = data.replace(/[\,%]/g, "");   
             if(field_type == "percent" && !divideByHundred)
                {
                data = parseFloat(data) * 100;
                }
             else
                {
                data = parseFloat(data);
                }
            if(decimal_places != undefined)
                {
                data = data * Math.pow(10, decimal_places);
                data = Math.round(data);
                data = data * Math.pow(10, -1 * decimal_places);
                var preDecimal;
                var strLength;
                            data = data.toString();
                if(data.match(/(-?\d*)\.(\d*)/))
                   {
                    preDecimal = RegExp.$1;
                    data = preDecimal + "." + RegExp.$2 + "000000000000000";
                    }
                else
                    {
                     preDecimal = data;
                     data += ".000000000000000";
                     }
                if(decimal_places == 0)
                    {
                    strLength = preDecimal.length;
                    }
                else
                    {
                    strLength = preDecimal.length + 1 + decimal_places;
                    }
                data = data.toString().substring(0,strLength);
                }
            else
                {
                data = data.toString()
                }
             if(field_type == "currency")
                {
                if(currency_format == "1")
                    {
                    data = currency_symbol + data;
                    }
                else if(currency_format == "2")
                    {
                    data = data + " " + currency_symbol;
                    }
                else
                    {
                    data = currency_symbol + data;
                    }                
                }
             if(commas)
                {
                if(!data.match(/\./))
                    {
                    if(data.match(/(\d)(\d{3})$/))
                        {
                        data = data.replace(/(\d)(\d{3})$/,RegExp.$1 + "," + RegExp.$2);
                        }
                    }
                else
                    {
                    if(data.match(/(\d)(\d{3}\.)/))
                        {
                        data = data.replace(/(\d)(\d{3}\.)/,RegExp.$1 + "," + RegExp.$2);
                        }
                    }
                while(data.match(/(\d)(\d{3},)/))
                    {
                    data = data.replace(/(\d)(\d{3},)/,RegExp.$1 + "," + RegExp.$2);
                    }
                }            
             if(field_type == "percent")
                 {
                  data += "%";
                  }
             }        
       else if(field_type == "userid")
            {
            var luserID = qdb.selectSingleNode(xmlRecord, "/*/table/lusers/luser[@id='"+data.childNodes[0].nodeValue+"']");
            if(luserID)
                {                        
                data = qdb.text(luserID);
                }
            else
                {
                data=data.childNodes[0].nodeValue;
                }
            }        
       else if(base_type == "bool")
             {
             if(data.childNodes[0].nodeValue == "0")
                 {
                  data = "No";
                  }
              else
                  {
                   data = "Yes"
                  }
             }
       else
            {
             data=data.childNodes[0].nodeValue;
             }
       field[fidToLabel[txtfid]] = data;
       field[fidToLabel[txtfid].toLowerCase()] = data;
       fid[txtfid] = data;
      }
}

function replaceTokens(innerHTML)
{
    innerHTML = innerHTML.split("~");
    
    if(innerHTML.length <= 1)
      {
       //There are no tokens
       return "<b><font color=\"red\">This document contains no tildes (~) to specify fields. Please make sure you have at least one matching pair of tildes.</font></b>";
       }
    else if(innerHTML.length % 2 == 0)
       {
       //There are unmatched tildas
        return "<b><font color=\"red\">This document has an odd number of tildes. Please make sure to enclose each field in tildes (~).</font></b>";
        }
    else
       {
       for(var chunk = 1; chunk < innerHTML.length; chunk +=2)
          {
           var token = innerHTML[chunk].replace(/<[^>]+>/g,"");
           token = token.replace(/&amp;/g, "&");
           token = token.replace(/\s+/g, " ");
           if(token.match(/^[1-9]\d*$/))
              {
              innerHTML[chunk] = fid[token];
              }
           else if(token.substr(0,1) == "=")
              {
              token = token.replace(/&lt;/g, "<");
              token = token.replace(/&gt;/g, ">");
              try
                 {
                  innerHTML[chunk]  = eval(token.substr(1));
                  }
              catch(exception)
                  {
                  var message = "Sorry,\r\n\r\n'" + token.substr(1) + "\r\ncontains a JavaScript error:\r\n\r\n" + exception.message;
                  alert(message);
                  innerHTML[chunk] = message;
                  }
              }
           else
              {
              var tokenLabel = token.toLowerCase();
              if(tokenLabel == 'length')
        {
        tokenLabel = "qdbEF_length";
        }
              innerHTML[chunk] = field[tokenLabel];
              }
           }
        return innerHTML.join("");
        }    
}

function snapShotEF(event)
  {
    var keycode;
  if (!event)
    event = window.event;

  if (event)
    {
    if (event.keyCode)
      keycode = event.keyCode;
    else
      keycode = event.which;
        if(keycode != 115 && keycode != 83)
            {
            return;
            }
        if (event.shiftKey)
      {
            sfid=undefined;
            }
        }
    else
        {
        return;
        }
    
    //check for the 's' key which is code 115
    //get the schema.
    if(sfid)
        {        
        var fileField = new Object();
        fileField.fid = sfid;
        fileField.filename = pagename;
        window.document.body.onload = "";
        var html = window.document.childNodes[0].innerHTML;
        html = html.replace(/<script\s.*/gi, "");
        html = html.replace(/<\/script>/gi, "");
        html = html.replace(/onload=\"qdbEF\(\)\"/i, "");
        //get the html node of the document window.document.childNodes[0].innerHTML
        qdb.EditRecord(dbid, rid, [fileField, qdb.encode64("<HTML>" + html + "</HTML>")]);
        if(qdb.displayErrorAlert("Could not snapshot your Exact Form because: "))
          {
          return;
          }
        else
            {
            flashSnapShotMessage();
            }
        }
    else
        {
        //we need to configure the sfid parameter
        newDIV = window.document.createElement("DIV");
        var divHTML = "<DIV class=PopBox>Please choose a file attachment field.<br>";
        divHTML += "<select id=sfid><option value=0>Please Choose...</option>";
        if(!schema)
              {
               schema = qdb.GetSchema(dbid);
               }
        var fileAttachmentFields = qdb.selectNodes(xmlRecord, "/*/table/fields/field[@field_type='file']");
        for(var i = 0; i < fileAttachmentFields.length; i++)
            {
            var label = qdb.text(qdb.selectSingleNode(fileAttachmentFields[i], "label"));
            var fid = qdb.text(qdb.selectSingleNode(fileAttachmentFields[i], "@id"));
            divHTML += "<option value=" + fid + ">" + label + "</option>";
            }
        divHTML += "<option value=0>-------------------</option>";
        divHTML += "<option value=-1>Create a new file attachment field</option>";
        divHTML += "</select><input id=oksfid type=button value=OK><input id=cancelsfid type=button value=Cancel>";
        divHTML += "</DIV>";
        newDIV.innerHTML= divHTML;
        window.document.body.insertBefore(newDIV, window.document.body.childNodes[0]);
        document.getElementById("oksfid").onclick = saveSFID;
        document.getElementById("cancelsfid").onclick = hideDiv;
        }
  }

function hideDiv()
{
newDIV.style.display = "none";
}

function hideSnapShotMessage()
{
newDIV.style.display = "none";
window.location.href = "/up/" + dbid + "/a/r" + rid + "/e" + sfid + "/v0";
}
  
var newDIV;

function saveSFID()
{
var sfidSelect = document.getElementById("sfid");
sfid = sfidSelect.options[sfidSelect.selectedIndex].value;
if(sfid == 0)
    {
    sfidSelect.focus();
    alert("Please make a selection.");    
    return;
    }
if(!schema)
    {
     schema = qdb.GetSchema(dbid);
     }
if(qdb.displayErrorAlert("Could not access schema to look for Exact Form buttons because: "))
        {
        return;
        }
var efButtons = qdb.selectNodes(schema, "/*/table/fields/field[@field_type='url' and @mode='virtual']");
if(efButtons.length == 0)
    {
    alert("Sorry there are no Exact Form Buttons to configure.");
    return;
    }
if(sfid == -1)
    {
    sfid = qdb.AddField(dbid, "Exact Form Snapshot", "file", "");
    if(qdb.displayErrorAlert("Could not add a new file attachment field because: "))
        {
        return;
        }
    }

for(var i = 0; i < efButtons.length; i++)
    {
    var formula = qdb.selectSingleNode(efButtons[i], "formula");
    if(formula)
        {
        formula = qdb.text(formula);
        //var rg = new RegExp("a=dbpage&pagename=\" & URLEncode(\"" + pagename + "\")" , "i");
        var rg = new RegExp("a=dbpage&(sfid=\\d+&)?pagename=\"\\s*&\\s*URLEncode\\(\"" + pagename + "\"\\)" , "i");
        if(formula.match(rg))
            {
            //modify the formula to include the sfid parameter
            formula = formula.replace(/a=dbpage&(sfid=\d+&)?pagename=/, "a=dbpage&sfid="+sfid+"&pagename=");
            var urlfid = qdb.text(qdb.selectSingleNode(efButtons[i], "@id"));
            qdb.SetFieldProperties(dbid, urlfid, "formula", formula);
            if(qdb.displayErrorAlert("Could not reconfigure Exact Form button field for snapshotting because: "))
                {
                return;
                }
            else
                {
                alert("Your Exact Form has been configured for snapshotting!");
                hideDiv();
                return;
                }
            }
        }
    }
alert("Sorry, of " + efButtons.length + " buttons, none correspond to this Exact Form (" + pagename + ").");
}

function flashSnapShotMessage()
{
    newDIV = window.document.createElement("DIV");
    var divHTML = "<DIV class=PopBox>Your Exact Form has been snapshotted!";
    divHTML += "</DIV>";
    newDIV.innerHTML= divHTML;
    window.document.body.insertBefore(newDIV, window.document.body.childNodes[0]);
    window.setTimeout("hideSnapShotMessage();", 1000);
}

//QuickBase Client for JavaScript

function QuickBaseClient(qdbServer)
{
if(qdbServer)
  {
  this.qdbServer = qdbServer;
  }
else
  {
  this.qdbServer = "";
  }

this.username = "";
this.password = "";
this.ticket = ticketParam || "";
this.error;
this.errortext;
this.errordetail;
this.errormessage="";

 this.Authenticate = function(username, password)
      {
       this.username = username;
       this.password= password;
       this.ticket = ticketParam || "";
       }

  this.GetSchema = function(dbid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       return this.APIXMLPost(dbid, "API_GetSchema", "");
        }

  this.GetDBInfo = function(dbid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       return this.APIXMLPost(dbid, "API_DBInfo", xmlQDBRequest);
        }

  this.CloneDatabase = function(dbid, newdbname, newdbdesc )
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "newdbname", newdbname);
       this.addParameter(xmlQDBRequest, "newdbdesc", newdbdesc );       
       xmlQDBResponse = this.APIXMLPost(dbid, "API_CloneDatabase", xmlQDBRequest);
       var newdbid = this.selectSingleNode(xmlQDBResponse, "/*/newdbid");
       if(newdbid)
          {
           return newdbid.childNodes[0].nodeValue;
           }
       return newdbid;
        }


  this.AddField = function(dbid, label, type, mode)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "label", label);
       this.addParameter(xmlQDBRequest, "type", type);
       if(mode != "")
          {
          this.addParameter(xmlQDBRequest, "mode", mode);
           }
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_AddField", xmlQDBRequest);
       var fid = this.selectSingleNode(xmlQDBResponse, "/*/fid");
       if(fid)
          {
           return fid.childNodes[0].nodeValue;
           }
       return fid;
        }

  this.DeleteField = function(dbid, fid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_DeleteField", xmlQDBRequest);
       return;
       }


  this.SetFieldProperties = function(dbid, fid, propertyName, value)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       this.addParameter(xmlQDBRequest, propertyName, value);
       return this.APIXMLPost(dbid, "API_SetFieldProperties", xmlQDBRequest);
        }

  this.GrantedDBs = function()
       {
       var xmlQDBRequest = this.initXMLRequest();
       return this.APIXMLPost("main", "API_GrantedDBs", xmlQDBRequest);
        }

  this.AddRecord = function(dbid, recordArray)
       {
       var xmlQDBRequest = this.initXMLRequest();
       for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2)
           {
            this.addFieldParameter(xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1]);
            }
       return this.APIXMLPost(dbid, "API_AddRecord", xmlQDBRequest);
        }


  this.EditRecord = function(dbid, rid, recordArray)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "rid", rid);
       for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2)
           {
            if(typeof(recordArray[fieldCounter]) == 'string' || typeof(recordArray[fieldCounter]) == 'number')
                {
                this.addFieldParameter(xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1]);
                }
            else
                {
                this.addFieldParameter(xmlQDBRequest, recordArray[fieldCounter].fid, recordArray[fieldCounter + 1], recordArray[fieldCounter].filename);
                }
            }
       return this.APIXMLPost(dbid, "API_EditRecord", xmlQDBRequest);
        }


  this.DeleteRecord = function(dbid, rid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "rid", rid);
       return this.APIXMLPost(dbid, "API_DeleteRecord", xmlQDBRequest);
        }

  this.DoQuery = function(dbid, query, clist, slist, options)
       {
       return this.GetURL(dbid, "API_DoQuery", "&query=" + query + "&clist=" + clist + "&slist=" + slist + "&options=" + options + "&fmt=structured", true);
        }

   this.ImportFromCSV = function(dbid, CSV, clist, rids, skipfirst)
       {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter(xmlQDBRequest, "clist", clist);
        this.addParameter(xmlQDBRequest, "skipfirst", skipfirst);
        this.addCDATAParameter(xmlQDBRequest, "records_csv", CSV);
        var xmlQDBResponse = this.APIXMLPost(dbid, "API_ImportFromCSV", xmlQDBRequest);
        var RidNodeList = this.selectNodes(xmlQDBResponse, "/*/rids/rid");
        var ridListLength = RidNodeList.length;
        rids = new Array();
        for(var i = 0; i < ridListLength; i++)
            {
             rids.push(RidNodeList(i).childNodes[0].nodeValue);
             }
        var result = this.selectSingleNode(xmlQDBResponse.documentElement, "/*/num_recs_added");
        if(result)
           {
            return parseInt(result.childNodes[0].nodeValue);
            }
        result = this.selectSingleNode(xmlQDBResponse.documentElement, "/*/num_recs_updated");
        if(result)
           {
            return parseInt(result.childNodes[0].nodeValue);
            }
        return 0;
        }

    var xmlQDBRequest;
    
    function createXMLDOM () {
    try {
      if (document.implementation && document.implementation.createDocument) {
        var doc = document.implementation.createDocument("", "", null);         
        return doc;
      }
      if ( window.ActiveXObject != undefined )
        return new ActiveXObject("Microsoft.XmlDom");
    }
    catch (ex) {}
    throw new Error("Sorry. Your browser does not support Exact Forms.");
    };

    
      this.initXMLRequest = function()
       {
    xmlQDBRequest = createXMLDOM();
        xmlQDBRequest.async = false;
        xmlQDBRequest.resolveExternals = false;
        var root = xmlQDBRequest.createElement("qdbapi");
        try{
      xmlQDBRequest.removeChild(xmlQDBRequest.documentElement);
      }
    catch(e)
      {
      }
        xmlQDBRequest.appendChild(root);
        if (!this.ticket)
            {
             if(this.username)
                 {
                 this.addParameter(xmlQDBRequest, "username", this.username);
                 this.addParameter(xmlQDBRequest, "password", this.password); 
                  }
            }
       else
            {
             this.addParameter(xmlQDBRequest, "ticket", this.ticket);
             console.log('added ticket', this.ticket);
             }
        return xmlQDBRequest;
        }

   this.addParameter = function(xmlQDBRequest, Name, Value)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement(Name);
         var TextNode = xmlQDBRequest.createTextNode(Value);
         ElementNode.appendChild(TextNode);
         Root.appendChild(ElementNode);
        }

 this.addFieldParameter = function(xmlQDBRequest, fieldName, Value, filename)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement("field");
         var attrField;
         if(fieldName.match(/^[1-9]\d*$/))
             {
              attrField = xmlQDBRequest.createAttribute("fid");
              }
         else
              {
              attrField = xmlQDBRequest.createAttribute("name");
               }
         attrField.nodeValue= fieldName;
         ElementNode.attributes.setNamedItem(attrField)
         if(filename)
            {
            var attrFileName = xmlQDBRequest.createAttribute("filename");
            attrFileName.nodeValue = filename;
            ElementNode.attributes.setNamedItem(attrFileName)
            }
         var TextNode = xmlQDBRequest.createTextNode(Value);
         ElementNode.appendChild(TextNode);
         Root.appendChild(ElementNode);
        }


   this.addCDATAParameter = function(xmlQDBRequest, Name, Value)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement(Name);
         var CDATANode = xmlQDBRequest.createCDATASection(Value);
         ElementNode.appendChild(CDATANode);
         Root.appendChild(ElementNode);
        }
   
   
   var xmlHTTPPost;
   XMLhttpInit();
   
   function XMLhttpInit()
    {
    try {
      if (!xmlHTTPPost)
        xmlHTTPPost = new XMLHttpRequest();
      }
    catch(e)
      {
      }
    try {
      if (!xmlHTTPPost)
        xmlHTTPPost = new ActiveXObject("Msxml2.XMLHTTP");
      }
    catch(e)
      {
      }
    try {
      if (!xmlHTTPPost)
        xmlHTTPPost = new ActiveXObject("Microsoft.XMLHTTP");
      }
    catch(e)
      {
      alert("Sorry. This browser does not support Exact Forms.");
      }

    }
    
   this.appendTicket = function(uri) {
     if (ticketParam) {
       uri += '&ticket=' + ticketParam;
       console.log('appending ticket to apixml');
     }
     return uri
   },
    
   this.APIXMLPost = function(dbid, action, xmlQDBRequest)
       {
       var script;
//     this.addParameter(xmlQDBRequest, "encoding", "UTF-8");
       script = this.qdbServer + "/db/" + dbid + "?act=" + action;
       script = this.appendTicket(script);
       xmlHTTPPost.open("POST", script, false);

      if ((/MSIE 1/i).test(navigator.appVersion) || window.ActiveXObject !== undefined){
         try { xmlHTTPPost.responseType = 'msxml-document'; } catch (e) { }
      }


       xmlHTTPPost.setRequestHeader("Content-Type","text/xml");

       xmlHTTPPost.send(xmlQDBRequest);
       var xmlAPI = xmlHTTPPost.responseXML;
       var topLevelChildren = xmlAPI.documentElement.childNodes;
       for (var i = 0; i < topLevelChildren.length; i++) 
      {
      if(topLevelChildren[i].nodeName == "ticket")
        {
        this.ticket = topLevelChildren[i].childNodes[0].nodeValue;
        }
      if(topLevelChildren[i].nodeName == "errcode")
        {
        this.errorcode = topLevelChildren[i].childNodes[0].nodeValue;
        }
      if(topLevelChildren[i].nodeName == "errtext")
        {
        this.errortext = topLevelChildren[i].childNodes[0].nodeValue;
        }
      if(topLevelChildren[i].nodeName == "errdetail")
        {
        this.errordetail = topLevelChildren[i].childNodes[0].nodeValue;
        this.errormessage += "\r\n\r\n" + this.errordetail;
        }
      }
       return xmlAPI;
       }

this.xpe = null;
this.nsResolver = null;

this.selectSingleNode = function (aNode, aExpr)
  {
  if((typeof aNode.selectSingleNode) != "undefined")
    {
    return aNode.selectSingleNode(aExpr);
    }
  if(this.xpe == null)
      {    
      this.xpe = new XPathEvaluator();
      }
  this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
  var result = this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null);
  return result.iterateNext();
  }

this.selectNodes = function (aNode, aExpr)
  {
  if((typeof aNode.selectNodes) != "undefined")
    {
    return aNode.selectNodes(aExpr);
    }
  if(this.xpe == null)
      {    
      this.xpe = new XPathEvaluator();
      }
  this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
  var result = this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null);
  var found = [];
  while (res = result.iterateNext())
            {
      found.push(res);
            }
  return found;
  }

this.text = function(aNode)
  {
  if((typeof aNode.text) != "undefined")
      {
      return aNode.text;
      }
  var nodetext = "";
  for(var i = 0; i < aNode.childNodes.length; i++)
      { 
      if(aNode.childNodes[i].nodeValue != null)
    {
    nodetext += aNode.childNodes[i].nodeValue;
    }
      }
  return nodetext;
  }
        
this.GetURL = function(dbid, action, params, xml)
       {
       var script;
       script = this.qdbServer + "/db/" + dbid + "?act=" + action + params;
       script = this.appendTicket(script);
       xmlHTTPPost.open("GET", script, false);
       xmlHTTPPost.send(null);

if(xml){
       var xmlAPI = xmlHTTPPost.responseXML;
       var topLevelChildren = xmlAPI.documentElement.childNodes;
       return xmlAPI;
}

       return xmlHTTPPost.responseText; 
       }

   this.displayErrorAlert = function(message)
       {
            if(this.errorcode != '0')
               {
                alert(message + " " + this.errormessage);
                return true;
                }
            else
               {
                return false;
                }
        }

monthNames = new Array(12)
monthNames[1] = "January"
monthNames[2] = "February"
monthNames[3] = "March"
monthNames[4] = "April"
monthNames[5] = "May"
monthNames[6] = "June"
monthNames[7] = "July"
monthNames[8] = "August"
monthNames[9] = "September"
monthNames[10] = "October"
monthNames[11] = "November"
monthNames[12] = "December"

dayNames = new Array(7)
dayNames[1] = "Sunday"
dayNames[2] = "Monday"
dayNames[3] = "Tuesday"
dayNames[4] = "Wednesday"
dayNames[5] = "Thursday"
dayNames[6] = "Friday"
dayNames[7] = "Saturday"


this.format = function(data, format)
{
if(format.match(/^date/i))
   {
   var intData = parseInt(data);
   var objGMTDate = new Date(intData);
   var milliGMToffset = objGMTDate.getTimezoneOffset()*60000;
   var oneDate = new Date(intData+ milliGMToffset);
   var date = oneDate.getDate();
   var day = oneDate.getDay() + 1;
   var month = oneDate.getMonth() + 1;
   var theYear = oneDate.getYear();
   if(theYear < 1900)
      {
      theYear += 1900;
       }
   if(format.match(/friend/i))
      {
       return monthNames[month] + " " + date + ", " + theYear;
       }
   if(format.match(/long/i))
      {
       return dayNames[day] + ", " + monthNames[month] + " " + date + ", " + theYear;
       }
   else if(format.match(/timestamp/i))
       {
        return oneDate.toLocaleString();
        }
   else
       {
       return month + "-" + date + "-" + theYear;
        }
   }
if(format.match(/^timeofday/))
   {
    data = parseInt(data);
    var intHours=Math.floor(data/3600000);
    var intMinutes=Math.floor(data/60000)%60;
    if (intMinutes < 10){intMinutes="0"+intMinutes;}
    return ""+intHours+":"+intMinutes;
    }
}

var keyStr = "ABCDEFGHIJKLMNOP" +
                "QRSTUVWXYZabcdef" +
                "ghijklmnopqrstuv" +
                "wxyz0123456789+/" +
                "=";

this.encode64 = function(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;
      var tempStrBuffer = "";
      do {
         chr1 = getNextCharacter();
         chr2 = getNextCharacter();
         chr3 = getNextCharacter();
         enc1 = chr1 >> 2;
         enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
         enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
         enc4 = chr3 & 63;

         if (isNaN(chr2)) {
            enc3 = enc4 = 64;
         } else if (isNaN(chr3)) {
            enc4 = 64;
         }

         output = output + 
            keyStr.charAt(enc1) + 
            keyStr.charAt(enc2) + 
            keyStr.charAt(enc3) + 
            keyStr.charAt(enc4);
         chr1 = chr2 = chr3 = "";
         enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
    function getNextCharacter()
        {
        if(tempStrBuffer.length)
            {
            chr = tempStrBuffer.charCodeAt(0);
            if(tempStrBuffer.length > 1)
                {
                tempStrBuffer = tempStrBuffer.substring(1);
                }
            else
                {
                tempStrBuffer = "";
                }
            }
        else
            {
            chr = input.charCodeAt(i++);
            if(chr > 255)
                {
                tempStrBuffer = "#" + chr + ";";
                chr = 38; //the ampersand character
                }
            }
        return chr;
        }
   }


this.ParseDelimited = function(data, delim)
   {
      var output = new Array();
      var line = new Array();
      var offset = 0;
      
      var field="";
      var lineEmpty=true;
      var maxsize = 0;
      var numfields=0;
      var i = new Array();
      var field = "";
      
      // Parse lines until the eof is hit
      while (GetNextLine())
         {
            if(!lineEmpty)
               {
                  output.push(line);
                  numfields=line.length;
                  if (numfields > maxsize)
                     {
                        maxsize = numfields;
                     }
               }
         }
         
      
      // If there are any lines which are shorter than the longest
      // lines, fill them out with "" entries here. This simplifies
      // checking later.
      for (var i = 0; i < output.length; i++)
         {
            while (output[i].length < maxsize)
               {
                  output[i].push ("");
               }
         }
         
      return output;


function GetNextLine()
   {
      line = new Array();
      //skip any empty lines
      while ((offset < data.length) && ((data.substr(offset, 1) == "\r") || (data.substr(offset, 1) == "\n")))
         {
            offset++;
            }   
               
            if (offset >= data.length)
               {
                  return false;
               }
               
            lineEmpty = true;
            var moreToCome =true;
            while(moreToCome)
               {
                  moreToCome = GetNextField();
                  line.push(field);
                  if (field)
                     {
                        lineEmpty = false;
                     }
               }
            return true;
         }
      
function GetNextField()
         {
            var BEFORE_FIELD=0;
            var IN_QUOTED_FIELD=1;
            var IN_UNQUOTED_FIELD=2;
            var DOUBLE_QUOTE_TEST=3;
            var c="";
            var state = BEFORE_FIELD;
            var p = offset;
            var endofdata = data.length;
            
               
            field = "";
               
            while (true)
               {
                  if (p >= endofdata)
                     {
                        // File, line and field are done
                        offset = p;
                        return false;
                     }
                  
                  c = data.substr(p, 1);
                     
                  if(state == DOUBLE_QUOTE_TEST)
                     {
                        // These checks are ordered by likelihood */
                        if (c == delim)
                           {
                              // Field is done; delimiter means more to come
                              offset = p + 1;
                              return true;
                           }
                        else
                           {
                              if (c == "\n" || c == "\r")
                                 {
                                    // Line and field are done
                                    offset = p + 1;
                                    return false;
                                 }
                                 else
                                 {
                                    if (c == '"')
                                       {
                                          // It is doubled, so append one quote
                                          field += '"';
                                          p++;
                                          state = IN_QUOTED_FIELD;
                                       }
                                         else
                                       {
                                          // !!! Shouldn't have anything else after an end quote!
                                          // But do something reasonable to recover: go into unquoted mode
                                          field += c;
                                          p++;
                                          state = IN_UNQUOTED_FIELD;
                                       }
                                    }                
                                 } 
                           }
                        else
                           {
                              if(state == BEFORE_FIELD)
                                 {
                                    // These checks are ordered by likelihood */
                                    if (c == delim)
                                       {
                                          // Field is blank; delimiter means more to come
                                          offset = p + 1;
                                          return true;
                                       }
                                    else
                                       {
                                          if (c == '"')
                                             {
                                                // Found the beginning of a quoted field
                                                p++;
                                                state = IN_QUOTED_FIELD;
                                             }
                                          else
                                             {
                                                if (c == "\n" || c == "\r")
                                                   {
                                                      // Field is blank and line is done
                                                      offset = p + 1;
                                                      return false;
                                                   }
                                                else
                                                     {
                                                      if (c == ' ')
                                                         {
                                                            // Ignore leading spaces
                                                            p++;
                                                         }
                                                      else
                                                         {
                                                            // Found some other character, beginning an unquoted field
                                                            field += c;
                                                            p++;
                                                            state = IN_UNQUOTED_FIELD;
                                                         }
                                                    }
                                             }
                                       }
                                 }
                              else
                                 {
                                    if (state == IN_UNQUOTED_FIELD)
                                       {
                                          // These checks are ordered by likelihood */
                                          if (c == delim)
                                             {
                                                // Field is done; delimiter means more to come
                                                offset = p + 1;
                                                return true;
                                             }
                                          else
                                             {
                                                if (c == "\n" || c == "\r")
                                                   {
                                                      // Line and field are done
                                                      offset = p + 1;
                                                      return false;
                                                   }
                                                else
                                                   {
                                                      // Found some other character, add it to the field
                                                      field += c;
                                                      p++;
                                                   }
                                             }
                                       }
                                    else
                                       {
                                          if(state == IN_QUOTED_FIELD)
                                             {
                                                if (c == '"')
                                                   {
                                                      p++;
                                                      state = DOUBLE_QUOTE_TEST;
                                                   }
                                                else
                                                   {
                                                      // Found some other character, add it to the field
                                                      field += c;
                                                      p++;
                                                   }
                                             }
                                       }
                                  }
                              }             
                          }
                     }
              }                  
 }
 