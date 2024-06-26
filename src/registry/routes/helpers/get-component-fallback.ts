import type { IncomingHttpHeaders } from 'node:http';
import url from 'node:url';
import type { Request, Response } from 'express';
import request from 'minimal-request';
import type { Component, Config } from '../../../types';
import * as urlBuilder from '../../domain/url-builder';
import type { GetComponentResult } from './get-component';

type ComponentCallback = (
  err: { registryError: any; fallbackError: any } | null,
  data: Component
) => void;

function getComponentFallbackForViewType(
  buildUrl: (
    component: {
      name: string;
      version?: string;
      parameters?: Record<string, string>;
    },
    baseUrl: string
  ) => string,
  conf: Config,
  req: Request,
  res: Response,
  registryError: string | null,
  callback: ComponentCallback
) {
  const path = buildUrl(
    {
      name: req.params['componentName'],
      version: req.params['componentVersion']
    },
    conf.fallbackRegistryUrl
  );

  return request(
    {
      method: 'get',
      url: path,
      headers: {
        ...req.headers,
        host: url.parse(conf.fallbackRegistryUrl).host,
        accept: 'application/json'
      }
    },
    (fallbackErr, fallbackResponse: string) => {
      if (fallbackErr === 304) {
        return res.status(304).send('');
      }

      if (fallbackErr) {
        return callback(
          {
            registryError: registryError,
            fallbackError: fallbackErr
          },
          undefined as any
        );
      }

      try {
        return callback(null, JSON.parse(fallbackResponse));
      } catch (parseError) {
        return callback(
          {
            registryError: registryError,
            fallbackError: `Could not parse fallback response: ${fallbackResponse}`
          },
          undefined as any
        );
      }
    }
  );
}

export function getComponent(
  fallbackRegistryUrl: string,
  headers: IncomingHttpHeaders,
  component: { name: string; version: string; parameters: IncomingHttpHeaders },
  callback: (result: GetComponentResult) => void
): void {
  request(
    {
      method: 'post',
      url: fallbackRegistryUrl,
      headers: { ...headers, host: url.parse(fallbackRegistryUrl).host },
      json: true,
      body: { components: [component] }
    },
    (err, res: GetComponentResult[]) => {
      if (err || !res || res.length === 0) {
        return callback({
          status: 404,
          response: {
            code: 'NOT_FOUND',
            error: err as any
          }
        });
      }

      return callback(res[0]);
    }
  );
}

export function getComponentPreview(
  conf: Config,
  req: Request,
  res: Response,
  registryError: string | null,
  callback: ComponentCallback
): void {
  getComponentFallbackForViewType(
    urlBuilder.componentPreview,
    conf,
    req,
    res,
    registryError,
    callback
  );
}

export function getComponentInfo(
  conf: Config,
  req: Request,
  res: Response,
  registryError: string | null,
  callback: ComponentCallback
): void {
  getComponentFallbackForViewType(
    urlBuilder.componentInfo,
    conf,
    req,
    res,
    registryError,
    callback
  );
}
