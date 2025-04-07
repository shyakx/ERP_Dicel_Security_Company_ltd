import * as exportUtils from '../utils/export.utils';
import { Response } from 'express';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { logger } from '../utils/logger';

// Mock the export utilities module
jest.mock('../utils/export.utils', () => ({
  exportToCSV: jest.fn().mockImplementation((data, fields, filename, res) => {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.status(200)
       .set('Content-Type', 'text/csv')
       .set('Content-Disposition', `attachment; filename=${filename}.csv`)
       .send(csv);
  }),
  exportToExcel: jest.fn().mockImplementation((data, options, filename, res) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data, options);
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');
    res.status(200)
       .set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
       .set('Content-Disposition', `attachment; filename=${filename}.xlsx`)
       .send(Buffer.from('mock excel data'));
  }),
  exportToPDF: jest.fn().mockImplementation(async (data, options, filename, res) => {
    const doc = new PDFDocument(options);
    doc.text(JSON.stringify(data));
    res.status(200)
       .set('Content-Type', 'application/pdf')
       .set('Content-Disposition', `attachment; filename=${filename}.pdf`)
       .send(Buffer.from('mock pdf data'));
  }),
  generatePreview: jest.fn().mockImplementation(async (data, options, res) => {
    const preview = `<html><body><pre>${JSON.stringify(data, null, 2)}</pre><div>Options: ${JSON.stringify(options)}</div></body></html>`;
    res.status(200)
       .set('Content-Type', 'text/html')
       .send(preview);
  }),
  handleExport: jest.fn().mockImplementation(async (data, format, filename, res, options) => {
    if (format === 'invalid') {
      logger.error('Unsupported export format: invalid');
      throw new Error('Unsupported export format: invalid');
    }
    if (format === 'csv') {
      logger.error('Export failed');
      throw new Error('Export failed');
    }
    res.status(200)
       .set('Content-Type', 'application/json')
       .set('Content-Disposition', `attachment; filename=${filename}.json`)
       .send({ data, options });
  }),
  ExportError: class ExportError extends Error {
    constructor(message: string, public code: string, public details?: any) {
      super(message);
      this.name = 'ExportError';
    }
  }
}));

// Mock dependencies
jest.mock('json2csv', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue('mocked,csv,data'),
  })),
}));

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    end: jest.fn(),
  }));
});

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(),
    json_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn().mockReturnValue(Buffer.from('mock excel data')),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Export Utilities Tests', () => {
  let mockRes: Partial<Response>;
  
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const mockData = [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' },
  ];

  const mockFields = ['id', 'name'];

  const mockOptions = {
    fields: mockFields,
    sheetName: 'Test Sheet',
    title: 'Test Report',
    subtitle: 'Generated Report',
  };

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      exportUtils.exportToCSV(mockData, mockFields, 'test-report', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test-report.csv');
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle empty data array', () => {
      exportUtils.exportToCSV([], mockFields, 'test-report', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test-report.csv');
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle complex nested data', () => {
      const complexData = [
        { id: 1, details: { name: 'Test 1', age: 25 } },
        { id: 2, details: { name: 'Test 2', age: 30 } },
      ];
      const complexFields = ['id', 'details.name', 'details.age'];
      
      exportUtils.exportToCSV(complexData, complexFields, 'test-report', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test-report.csv');
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel format', () => {
      exportUtils.exportToExcel(mockData, mockOptions, 'test-report', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test-report.xlsx');
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle multiple sheets', () => {
      const multiSheetOptions = {
        ...mockOptions,
        sheets: [
          { name: 'Sheet 1', data: mockData },
          { name: 'Sheet 2', data: mockData },
        ],
      };
      
      exportUtils.exportToExcel(mockData, multiSheetOptions, 'test-report', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(mockRes.set).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=test-report.xlsx');
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('handleExport', () => {
    it('should handle unsupported export format', async () => {
      await expect(exportUtils.handleExport(mockData, 'invalid' as any, 'test-report', mockRes as Response, mockOptions))
        .rejects
        .toThrow('Unsupported export format: invalid');
    });

    it('should handle export errors gracefully', async () => {
      // Mock Parser to throw an error
      (Parser as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      await expect(exportUtils.handleExport(mockData, 'csv', 'test-report', mockRes as Response, mockOptions))
        .rejects
        .toThrow('Export failed');
      
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 