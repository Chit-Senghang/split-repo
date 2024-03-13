// import { Browser, ErrorCode, PDFOptions, launch } from 'puppeteer';
// import { AppEnvEnum } from './../../../ts/enum/app-env.enum';

// const isErrorCode = (errorInstance: ErrorCode): errorInstance is ErrorCode => {
//   return (
//     errorInstance === 'aborted' ||
//     errorInstance === 'accessdenied' ||
//     errorInstance === 'addressunreachable' ||
//     errorInstance === 'blockedbyclient' ||
//     errorInstance === 'blockedbyresponse' ||
//     errorInstance === 'connectionaborted' ||
//     errorInstance === 'connectionclosed' ||
//     errorInstance === 'connectionfailed' ||
//     errorInstance === 'connectionrefused' ||
//     errorInstance === 'connectionreset' ||
//     errorInstance === 'internetdisconnected' ||
//     errorInstance === 'namenotresolved' ||
//     errorInstance === 'timedout' ||
//     errorInstance === 'failed'
//   );
// };

// const createInstanceBrowser = async (): Promise<Browser> => {
//   return await launch({
//     headless: 'new',
//     ...(process.env.APP_ENV !== AppEnvEnum.LOCAL && {
//       executablePath: '/usr/bin/chromium-browser'
//     }),
//     args: ['--no-sandbox']
//   });
// };

// export const generateFilePdf = async (document: string): Promise<Buffer> => {
//   const pdfOptions: PDFOptions = {
//     format: 'A4',
//     landscape: true,
//     timeout: 0
//   };
//   const browser: Browser = await createInstanceBrowser();
//   try {
//     const page = await browser.newPage();
//     await page.setContent(document, {
//       waitUntil: `networkidle0`,
//       timeout: 0
//     });

//     return await page.pdf(pdfOptions);
//   } catch (error) {
//     if (isErrorCode(error.code)) {
//       throw new Error(`Puppeteer error: ${error.code}`); // Handle puppeteer error
//     }
//   } finally {
//     browser.close();
//   }
// };
