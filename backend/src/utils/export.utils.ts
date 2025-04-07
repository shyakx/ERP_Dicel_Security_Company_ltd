import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { logger } from './logger';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

// PDF styling constants
const PDF_STYLES = {
  colors: {
    primary: '#2563eb',
    secondary: '#6b7280',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    light: '#f3f4f6',
    dark: '#1f2937',
    border: '#e5e7eb'
  },
  fonts: {
    header: 'Helvetica-Bold',
    body: 'Helvetica'
  },
  sizes: {
    title: 24,
    subtitle: 14,
    header: 12,
    body: 10
  },
  spacing: {
    margin: 50,
    rowHeight: 25,
    headerPadding: 10
  }
};

interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    light: string;
    dark: string;
    border: string;
  };
  fonts: {
    header: string;
    body: string;
  };
  sizes: {
    title: number;
    subtitle: number;
    header: number;
    body: number;
  };
  spacing: {
    margin: number;
    rowHeight: number;
    headerPadding: number;
  };
}

const themes: Record<string, ThemeConfig> = {
  default: PDF_STYLES,
  dark: {
    colors: {
      primary: '#3b82f6',
      secondary: '#9ca3af',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      light: '#1f2937',
      dark: '#f3f4f6',
      border: '#374151'
    },
    fonts: {
      header: 'Helvetica-Bold',
      body: 'Helvetica'
    },
    sizes: {
      title: 24,
      subtitle: 14,
      header: 12,
      body: 10
    },
    spacing: {
      margin: 50,
      rowHeight: 25,
      headerPadding: 10
    }
  },
  corporate: {
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      light: '#f8fafc',
      dark: '#0f172a',
      border: '#e2e8f0'
    },
    fonts: {
      header: 'Arial-Bold',
      body: 'Arial'
    },
    sizes: {
      title: 28,
      subtitle: 16,
      header: 14,
      body: 12
    },
    spacing: {
      margin: 60,
      rowHeight: 30,
      headerPadding: 15
    }
  }
};

class ExportError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'ExportError';
  }
}

interface ProgressCallback {
  (progress: number, message: string): void;
}

interface ExportOptions {
  fields: string[];
  title?: string;
  subtitle?: string;
  includeCharts?: boolean;
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut';
  chartTitle?: string;
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      fill?: boolean;
    }[];
  };
  theme?: string;
  pageSize?: string;
  fonts?: {
    header: string;
    body: string;
  };
  sheets?: Array<{
    name: string;
    data: any[];
  }>;
  onProgress?: ProgressCallback;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to get color for status
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PRESENT': PDF_STYLES.colors.success,
    'ABSENT': PDF_STYLES.colors.danger,
    'LATE': PDF_STYLES.colors.warning,
    'PENDING': PDF_STYLES.colors.warning,
    'APPROVED': PDF_STYLES.colors.success,
    'REJECTED': PDF_STYLES.colors.danger,
    'PAID': PDF_STYLES.colors.success,
    'CANCELLED': PDF_STYLES.colors.danger,
    'OPEN': PDF_STYLES.colors.warning,
    'IN_PROGRESS': PDF_STYLES.colors.primary,
    'RESOLVED': PDF_STYLES.colors.success,
    'CLOSED': PDF_STYLES.colors.secondary,
    'AVAILABLE': PDF_STYLES.colors.success,
    'ASSIGNED': PDF_STYLES.colors.primary,
    'MAINTENANCE': PDF_STYLES.colors.warning,
    'RETIRED': PDF_STYLES.colors.danger,
    'PLANNING': PDF_STYLES.colors.warning,
    'ACTIVE': PDF_STYLES.colors.success,
    'COMPLETED': PDF_STYLES.colors.success,
  };
  
  return statusMap[status] || PDF_STYLES.colors.secondary;
};

// Helper function to format dates
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount: number | null): string => {
  if (amount === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to get formatted value from object
const getFormattedValue = (item: any, field: string): string => {
  const value = field.split('.').reduce((obj, key) => obj?.[key], item);
  
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return formatDate(value);
  }
  
  if (typeof value === 'number' && field.toLowerCase().includes('amount')) {
    return formatCurrency(value);
  }
  
  return String(value);
};

// Helper function to generate chart image
const generateChartImage = async (options: ExportOptions): Promise<Buffer> => {
  if (!options.chartData) {
    throw new ExportError('Chart data is required', 'CHART_DATA_REQUIRED');
  }

  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: options.chartType || 'bar',
    data: options.chartData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: !!options.chartTitle,
          text: options.chartTitle
        }
      }
    }
  };

  try {
    return await chartJSNodeCanvas.renderToBuffer(configuration);
  } catch (error) {
    logger.error('Error generating chart:', error);
    throw new ExportError('Failed to generate chart', 'CHART_GENERATION_ERROR', error);
  }
};

// Function implementations
const exportToCSV = (data: any[], fields: string[], filename: string, res: Response): void => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    res.status(200)
       .set('Content-Type', 'text/csv')
       .set('Content-Disposition', `attachment; filename=${filename}.csv`)
       .send(csv);
  } catch (error) {
    logger.error('Error exporting to CSV:', error);
    throw new ExportError('Failed to export data to CSV', 'CSV_EXPORT_ERROR', error);
  }
};

const exportToExcel = (data: any[], options: ExportOptions, filename: string, res: Response): void => {
  try {
    const workbook = XLSX.utils.book_new();
    
    if (options.sheets) {
      // Handle multiple sheets
      options.sheets.forEach(sheet => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });
    } else {
      // Single sheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, options.title || 'Sheet1');
    }
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.status(200)
       .set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
       .set('Content-Disposition', `attachment; filename=${filename}.xlsx`)
       .send(buffer);
  } catch (error) {
    logger.error('Error exporting to Excel:', error);
    throw new ExportError('Failed to export data to Excel', 'EXCEL_EXPORT_ERROR', error);
  }
};

const exportToPDF = async (data: any[], options: ExportOptions, filename: string, res: Response): Promise<void> => {
  try {
    const doc = new PDFDocument({ size: options.pageSize || 'A4' });
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.status(200)
         .set('Content-Type', 'application/pdf')
         .set('Content-Disposition', `attachment; filename=${filename}.pdf`)
         .send(result);
    });
    
    // Add content to PDF
    if (options.title) {
      doc.fontSize(PDF_STYLES.sizes.title)
         .font(PDF_STYLES.fonts.header)
         .text(options.title, { align: 'center' });
    }
    
    if (options.subtitle) {
      doc.fontSize(PDF_STYLES.sizes.subtitle)
         .font(PDF_STYLES.fonts.body)
         .text(options.subtitle, { align: 'center' });
    }
    
    // Add table headers
    const startY = doc.y + 20;
    let currentY = startY;
    
    options.fields.forEach((field, index) => {
      doc.fontSize(PDF_STYLES.sizes.header)
         .font(PDF_STYLES.fonts.header)
         .text(field, 50 + (index * 100), currentY);
    });
    
    currentY += PDF_STYLES.spacing.headerPadding;
    
    // Add table rows
    data.forEach(item => {
      options.fields.forEach((field, index) => {
        doc.fontSize(PDF_STYLES.sizes.body)
           .font(PDF_STYLES.fonts.body)
           .text(getFormattedValue(item, field), 50 + (index * 100), currentY);
      });
      currentY += PDF_STYLES.spacing.rowHeight;
    });
    
    doc.end();
  } catch (error) {
    logger.error('Error exporting to PDF:', error);
    throw new ExportError('Failed to export data to PDF', 'PDF_EXPORT_ERROR', error);
  }
};

const generatePreview = async (data: any[], options: ExportOptions, res: Response): Promise<void> => {
  try {
    const theme = themes[options.theme || 'default'];
    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid ${theme.colors.border}; padding: 8px; text-align: left; }
            th { background-color: ${theme.colors.primary}; color: white; }
            .title { font-size: 24px; text-align: center; margin-bottom: 10px; }
            .subtitle { font-size: 16px; text-align: center; margin-bottom: 20px; color: ${theme.colors.secondary}; }
          </style>
        </head>
        <body>
    `;
    
    if (options.title) {
      html += `<div class="title">${options.title}</div>`;
    }
    
    if (options.subtitle) {
      html += `<div class="subtitle">${options.subtitle}</div>`;
    }
    
    // Add table
    html += '<table><thead><tr>';
    options.fields.forEach(field => {
      html += `<th>${field}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    data.forEach(item => {
      html += '<tr>';
      options.fields.forEach(field => {
        html += `<td>${getFormattedValue(item, field)}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table></body></html>';
    
    res.status(200)
       .set('Content-Type', 'text/html')
       .send(html);
  } catch (error) {
    logger.error('Error generating preview:', error);
    throw new ExportError('Failed to generate preview', 'PREVIEW_ERROR', error);
  }
};

const handleExport = async (
  data: any[],
  format: 'csv' | 'excel' | 'pdf' | 'preview',
  filename: string,
  res: Response,
  options: ExportOptions
): Promise<void> => {
  try {
    switch (format) {
      case 'csv':
        exportToCSV(data, options.fields, filename, res);
        break;
      case 'excel':
        exportToExcel(data, options, filename, res);
        break;
      case 'pdf':
        await exportToPDF(data, options, filename, res);
        break;
      case 'preview':
        await generatePreview(data, options, res);
        break;
      default:
        throw new ExportError(`Unsupported export format: ${format}`, 'UNSUPPORTED_FORMAT');
    }
  } catch (error) {
    logger.error('Error in handleExport:', error);
    throw error;
  }
};

// Export all utility functions
export {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  generatePreview,
  handleExport,
  ExportError,
  ThemeConfig,
  ExportOptions,
  ProgressCallback,
  themes,
  PDF_STYLES,
  getStatusColor,
  formatDate,
  formatCurrency,
  getFormattedValue,
  generateChartImage,
  getCachedData,
  setCachedData
}; 