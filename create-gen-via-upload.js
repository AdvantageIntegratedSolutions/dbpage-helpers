require('quickbase');

const pdfFooter = () => {
  const left = '<div></div>'
  const right = "<span>WP-4A Page <span class='pageNumber'></span></span>"
  const style = 'margin: 0 0.25in; font-size: 9px; font-family: Arial, Helvetica; width: 100%; display: flex; justify-content: space-between;'
  return `<div style=${style}>${left}${right}</div>`
}
var params = {
  conn: {
    realm: 'advantageintegratedsolutionsinc',
    userToken: 'b3t2xq_bcf_89fq2bcniizy6b3y4b5nwdv82m'
  },
  dbid: 'bpmpky53p',
  label: 'new filename gen url',
  pdfUploadFid : '20',
  pageUrlFormula: '[PRINT Ashley PDF GEN (Test) _ HR Central]',
  // filenameFormula
  // footer: pdfFooter()
}
console.log({params});
createBtn(params)

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

async function createGenUploadBtn({conn, dbid, label, pageUrlFormula, pdfUploadFid, footer, header, filenameFormula}) {
  const addFieldQry = { dbid, type: "url", mode: "virtual", label };
  const formula = getGenUploadFormula({pdfUploadFid, pageUrlFormula, footer, header, filenameFormula})
  console.log({formula});
  const newField = await qbApi("API_AddField", conn, addFieldQry);
  console.log({newField});
  const { fid, "label": appears_as } = newField;
  const fieldProps = {
    dbid, fid, formula, use_new_window: 1, display_as_button: 1, appears_as
  };
  const updateResult = await qbApi("API_SetFieldProperties", conn, fieldProps);
}

const getGenUploadFormula = ({
  pageUrlFormula, 
  pdfUploadFid,
  footer="<div></div>", 
  header="<div></div>",
  filenameFormula='"unnamed_file_" & [Record ID#] & ".pdf"',
}) => `
//QB FORMULA
//static - do not change
var Text dbPageBase = URLRoot() & "db/" & AppID() & "?a=dbpage&";
var Text pdfHandlerPage = $dbPageBase & "pagename=ais-gen-upload-request-v1.html"; //ensure this dbPage exists

//basic info
var Text fileName =       "${filenameFormula}"; 
var Number pdfUploadFid = ${pdfUploadFid};           //FID of file attachemnt field in this table. set to 0 to omit upload
var Number pdfUploadRid = [Record ID#]; //RID to upload attachment to. set to 0 to omit upload
var Text targetPageUrl =  ${pageUrlFormula}; //form/page to print

//rarely modified
var Text pageMargin =      "0.5in";
var Text pageFormat =      "A4";
var Text printBackground = "true"; // set to "false" to conserve printer ink
var Text waitSelectors =   "[]"; // wait until these elements exist to print ex. "[\".special-class\", \"#item-id\"]"

//Repeating Header/Footer: Set to "<div></div>" to omit. set to "" for default. See note below.
var Text header = "<div></div>";
var Text footer = "<div></div>";

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


$pdfHandlerPage & "&params=" & URLEncode(
"{" &
    "\"genOptions\": {" &
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
  "}," &
  "\"uploadParams\": {" & 
    "\"query\": {" & 
        "\"dbid\": \"" & Dbid() & "\"," & 
        "\"rid\": \"" & $pdfUploadRid & "\"," & 
        "\"field\": {" &
            "\"fid\": \"" & $pdfUploadFid & "\"," & 
            "\"filename\": \"" & $filename & "\"" & 
        "}" &
    "}" &
  "}" &
"}")
`