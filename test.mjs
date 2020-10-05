import {createPdfViewBtn} from './create-field.mjs'
const pdfFooter = () => {
  const left = '<div></div>'
  const right = "<span>WP-4A Page <span class='pageNumber'></span></span>"
  const style = 'margin: 0 0.25in; font-size: 9px; font-family: Arial, Helvetica; width: 100%; display: flex; justify-content: space-between;'
  return `<div style=${style}>${left}${right}</div>`
}
var params = {
  conn: {
    realm: 'rci',
    userToken: 'by2kdj_u7a_dd277xyce9tjdpssgacgb4ym28s'
  },
  dbid: 'bk6xk8yhm',
  label: 'ZZZ Test Gen Button',
  paramFormula: '"pageID=215&assessmentsRid=" & [Record ID#]',
  footer: pdfFooter()
}
console.log({params});
createPdfViewBtn(params)


