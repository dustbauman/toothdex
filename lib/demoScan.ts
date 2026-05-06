/** URI flag for in-app demo scan previews (never pass to `<Image uri=...>` or persist). */
export const DEMO_SCAN_PREVIEW_URI = 'toothdex://demo-scan' as const;

export type DemoScanPreviewUri = typeof DEMO_SCAN_PREVIEW_URI;

export function isDemoScanPreviewUri(uri: string | null): uri is DemoScanPreviewUri {
  return uri === DEMO_SCAN_PREVIEW_URI;
}
