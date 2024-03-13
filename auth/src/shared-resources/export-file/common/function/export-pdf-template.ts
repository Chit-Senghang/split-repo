// import { ColumnDefinitionDto } from '../../dto/column-definition.dto';
// import { generateFilePdf } from '../generate-file-pdf/generate-file-pdf';
// import { getRows } from './export-function';

// export const exportPdfTemplate = async (
//   data: any,
//   dataTableName: string,
//   columnDefinitions: ColumnDefinitionDto[]
// ): Promise<Buffer> => {
//   const tableHeaders = columnDefinitions
//     .map((column: { header: string }) => `<th>${column.header}</th>`)
//     .join('');

//   const tableRows = getRows(data, columnDefinitions, dataTableName)
//     .map(
//       (rows: any) =>
//         `<tr>
//     ${rows.map((cell: any) => `<td>${cell ?? ''}</td>`).join('')}
//   </tr>`
//     )
//     .join('');

//   const htmlContent = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document</title>
//     <style>
//       body {
//         color: black;
//       }
//       table {
//         border-collapse: collapse;
//         width: 100%;
//         margin: 20px 0;
//         border: 1px solid black;
//       }
//       th, td {
//         padding: 10px 10px;
//         text-align: left;
//         border: 1px solid black;
//         /* Control column widths for responsiveness */
//         max-width: 200px; /* Adjust as needed */
//         word-wrap: break-word;
//       }
//       /* Additional styles for responsiveness */
//       @media (max-width: 768px) {
//         table {
//           font-size: 12px; /* Reduce font size for smaller screens */
//         }
//       }
//     </style>
//   </head>
//   <body>
//     <table>
//       <caption style="padding: 20px;font-weight:bold;"><u>${dataTableName}</u></caption>
//       <tr>
//         ${tableHeaders}
//       </tr>
//       ${tableRows}
//     </table>
//   </body>
//   </html>`;

//   return await generateFilePdf(htmlContent);
// };
