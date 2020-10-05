require('quickbase');
async function qbApi(
  apiCall, connection, query, 
) {
  try {
    const qb = new QuickBase(connection);
    console.log({qb});
    return await qb.api(apiCall, query);
  } catch (error) {
    throw error
  }
}

export async function createPdfViewBtn({conn, dbid, label, pageUrlFormula, footer, header}) {
  const addFieldQry = { dbid, type: "url", mode: "virtual", label };
  const formula = getFormula(pageUrlFormula, footer, header)
  console.log({formula});
  const newField = await qbApi("API_AddField", conn, addFieldQry);
  console.log({newField});
  const { fid, "label": appears_as } = newField;
  const fieldProps = {
    dbid, fid, formula, use_new_window: 1, display_as_button: 1, appears_as
  };
  const updateResult = await qbApi("API_SetFieldProperties", conn, fieldProps);
}

const getFormula = (pageUrlFormula, footer="<div></div>", header="<div></div>") => `
//QB FORMULA
//static - do not change
var Text dbPageBase = URLRoot() & "db/" & AppID() & "?a=dbpage&";
var Text pdfHandlerPage = $dbPageBase & "pagename=ais-gen-pdf-v1.html"; //ensure this dbPage exists

//basic info
var Text targetPageUrl = ${pageUrlFormula}; //page to print

//Repeating Header/Footer: Set to "<div></div>" to omit. set to "" for default. See note below.
var Text header = ${header};
var Text footer = ${footer};

//rarely modified
var Text pageMargin =      "0.5in";
var Text pageFormat =      "A4";
var Text printBackground = "true"; // set to "false" to conserve printer ink
var Text waitSelectors =   "[]"; // wait until these elements exist to print ex. "[\".special-class\", \"#item-id\"]"


$pdfHandlerPage & "&params=" & URLEncode(
"{" &
  "\"url\": \"" & $targetPageUrl & "\"," &
  "\"pdfOptions\": {"  &
    "\"displayHeaderFooter\": true," &
    "\"headerTemplate\": \"" & $header & "\"," &
    "\"footerTemplate\": \"" & $footer & "\"," &
    "\"printBackground\": " & $printBackground & "," &
    "\"format\": \"" & $pageFormat & "\"" &
  "}," &
  "\"customOptions\": {" &
    "\"waitEval\": false," &
    "\"imgEval\": true," &
    "\"waitSelectors\": " & $waitSelectors & "," &
    "\"styleTags\": [{\"content\": \"@page {margin: " & $pageMargin & "\"}]," &
    "\"scriptTags\": []" &
  "}" &
"}")


//  FOOTER EXAMPLE - page X of Y on bottom right
//  "<div style='font-size: 12px; width: 100%; display: flex; justify-content: flex-end; margin-right: 0.5in'>" & 
//      "<div>Page&nbsp;</div>" & 
//      "<div class='pageNumber'></div>" & 
//      "<div>&nbsp;of&nbsp;</div>" & 
//      "<div class='totalPages'></div>" & 
//  "</div>";

//  footer/header is raw html that will repeat on each page.
//  special classes available for header/footer:
// - <div class='date'></div>:        formatted print date
// - <div class='title'></div>:       document title
// - <div class='url'></div>:         document location
// - <div class='pageNumber'></div>:  current page number
// - <div class='totalPages'></div>:  total pages in the document

//  ONLY the above classes will have an effect. 
//  Other styles must be applied INLINE within header/footer HTML
`