export interface ComparisonResult {
  topic: string;
  referenceValue: string;
  analysisValue: string;
  comparison: {
    pass: boolean;
    reason: string;
  };
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
}