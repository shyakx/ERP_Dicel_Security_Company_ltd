import { Request, Response, NextFunction } from 'express';

/**
 * Creates a mock Request object for testing
 * @returns A partial Request object with common properties
 */
export const mockRequest = (): Partial<Request> => {
  return {
    query: {},
    params: {},
    body: {},
    headers: {},
    cookies: {},
    signedCookies: {},
    path: '',
    method: 'GET',
    url: '',
    originalUrl: '',
    ip: '',
    ips: [],
    protocol: 'http',
    secure: false,
    subdomains: [],
    hostname: '',
    host: '',
    fresh: false,
    stale: true,
    xhr: false,
    app: {} as any,
    route: {} as any,
    accept: {} as any,
  };
};

/**
 * Creates a mock Response object for testing
 * @returns A partial Response object with common methods
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  
  // Mock common response methods
  res.status = function(code: number) { return this as any; };
  res.json = function(body: any) { return this as any; };
  res.send = function(body: any) { return this as any; };
  res.sendFile = function(path: string) { return this as any; };
  res.download = function(path: string) { return this as any; };
  res.redirect = function(url: string) { return this as any; };
  res.render = function(view: string) { return this as any; };
  res.end = function() { return this as any; };
  res.setHeader = function(name: string, value: string) { return this as any; };
  res.getHeader = function(name: string) { return ''; };
  res.clearCookie = function(name: string) { return this as any; };
  res.cookie = function(name: string, value: string) { return this as any; };
  res.locals = {};
  
  return res;
};

/**
 * Creates a mock NextFunction for testing
 * @returns A mock function
 */
export const mockNext = (): jest.Mock => {
  return jest.fn();
}; 