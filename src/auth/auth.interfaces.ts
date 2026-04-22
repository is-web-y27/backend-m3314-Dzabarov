import type { Type } from '@nestjs/common';

export interface AuthModuleOptions {
  connectionURI: string;
  apiKey?: string;
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath: string;
  websiteBasePath: string;
}

export interface AuthModuleAsyncOptions {
  imports?: Array<Type<unknown>>;
  inject?: Array<Type<unknown> | string | symbol>;
  useFactory: (
    ...args: unknown[]
  ) => AuthModuleOptions | Promise<AuthModuleOptions>;
}
