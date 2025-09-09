// The `stream` property was added to the `MulterFileMock` interface with a dummy implementation
// to ensure compatibility with the `File` type used in the tests. This avoids TypeScript errors
// while maintaining the structure expected by the code. The dummy implementation provides
// placeholder methods (`on` and `pipe`) to satisfy the type requirements without relying on
// Node.js's `stream` module, which is not available in the browser

export interface MulterFileMock {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  stream: any; // Dummy-Stream
}

export const ExpressMulterFileMock = <MulterFileMock[]>[
  {
    fieldname: 'file',
    originalname: 'test-file.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    destination: '/tmp',
    filename: 'test-file.txt',
    path: '/tmp/test-file.txt',
    buffer: new TextEncoder().encode('Test file content'), // Create Uint8Array
    stream: {
      // Dummy-Implementation
      on: () => {},
      pipe: () => {},
    },
  },
];
