import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import { AUTH_MODULE_OPTIONS } from './auth.constants';
import type { AuthModuleOptions } from './auth.interfaces';

@Injectable()
export class SuperTokensService {
  constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
  ) {
    supertokens.init({
      framework: 'express',
      supertokens: {
        connectionURI: this.options.connectionURI,
        apiKey: this.options.apiKey,
      },
      appInfo: {
        appName: this.options.appName,
        apiDomain: this.options.apiDomain,
        websiteDomain: this.options.websiteDomain,
        apiBasePath: this.options.apiBasePath,
        websiteBasePath: this.options.websiteBasePath,
      },
      recipeList: [
        EmailPassword.init(),
        Session.init({
          getTokenTransferMethod: () => 'cookie',
        }),
      ],
    });
  }
}
