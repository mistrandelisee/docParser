// var XMLHttpRequest = require('xhr2');
// import { parseFromString } from 'dom-parser';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const xFieldKey ='x-coordinate'
const yFieldKey ='y-coordinate'

function tableToJson(table) {
  
  const rows = table.rows;
  const headers = [];
  const jsonData = [];
  console.log('rows:', rows.length);
  // Extract headers
  for (let i = 0; i < rows[0].cells.length; i++) {
    // console.log('cell1:', rows[0].cells[i].innerText, 'cell2:', rows[0].cells[i].textContent);
      headers.push(rows[0].cells[i].textContent);
  }
  const max ={};
  // Extract data
  for (let i = 1; i < rows.length; i++) {
      const rowObject = {};
      const cells = rows[i].cells;
      for (let j = 0; j < cells.length; j++) {
          const cellInfo = cells[j].textContent;
          const cellHeader =headers[j];
          rowObject[cellHeader] = cellInfo;

          max[cellHeader] = getMax(cellInfo, max[cellHeader] || 0);

      }
      jsonData.push(rowObject);
  }

  return {
    headers : headers,
    totalRows: rows.length - 1,
    totalCols: headers.length,
    max,
    data : jsonData,
  };//JSON.stringify(jsonData, null, 2);
}
function getMax( current , max ) {
  try {
    if (isNaN(current) || isNaN(max)) return 0;
    return Math.max(+current, +max);
  } catch (error) {
    
  }
  return current;

}
  async function getData(url) {
    // const url = "https://example.org/products.json";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const txt = await response.text();
      const { document } = (new JSDOM(txt)).window;
      const tableElement = document.getElementsByTagName("table")[0];
      const tableJson = tableToJson(tableElement); 
      const tableMap = {};
       tableJson.data.forEach((row)=>{
         const x= row[xFieldKey];
         const y= row[yFieldKey];
         tableMap[x+'_'+y]= row['Character'];
      })
      // console.log(tableJson);
      //console.log(tableMap);
      const max = tableJson.max;
      const max_x= max[xFieldKey];
      const max_y= max[yFieldKey];
      const matrix = [];
      let infost = []
      let output = ''
      for (let y = max_y; y > 0; y--) {// y starts from end to start
        const array = [];
        let infos = ''
        for (let x = 0; x <=max_x; x++) { // x starts from start to end
          const info = tableMap[x+'_'+y] || ' '
          array.push(info);
          infos = infos + info;
          
        }
        // console.log(infos);
        matrix.push(array);
        infost.push(infos);
        output = output + '\n'+ infos;
      }
      // console.log('\n');
      // output = output + '\n';
      // infost.forEach((infos)=> console.log(infos));


      // console.log(output);
      return {
        matrix,
        output,
        infost
      }
    } catch (error) {
      console.error(error.message);
    }
  }
// readTextFile(url);
// const url = 'https://docs.google.com/document/d/e/2PACX-1vRMx5YQlZNa3ra8dYYxmv-QIQ3YJe8tbI3kqcuC7lQiZm-CSEznKfN_HYNSpoXcZIV3Y_O3YoUB1ecq/pub'


(async () => {
  const url = 'https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub'
  const {
    matrix,
    output,
    infost
  } = await getData(url)

  console.log(output);
})();