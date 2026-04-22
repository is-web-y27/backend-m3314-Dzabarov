import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(() => {
    appController = new AppController();
  });

  it('should return main page view model', () => {
    expect(appController.index()).toMatchObject({ title: 'Главная' });
  });
});
