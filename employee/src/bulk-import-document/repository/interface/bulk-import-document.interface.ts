export interface IBulkImportDocument {
  import(fileName: string, importStartTime: string): Promise<void>;
  download(companyStructureId?: number): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }>;
}
