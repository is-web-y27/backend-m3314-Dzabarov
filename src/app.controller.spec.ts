import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  it('should redirect root to programs', () => {
    expect(appController.index()).toBeUndefined();
  });
});
