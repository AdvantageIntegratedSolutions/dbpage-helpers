require( './create-gen-via-upload');
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


