import {
  getApiErrorMessage,
  getHttpErrorMessage,
  //  translateValidationErrors,
} from './get-error-messages';

export class ErrorMessages {
  static api(code: string) {
    return getApiErrorMessage(code);
  }

  static http(status: string) {
    return getHttpErrorMessage(status);
  }

  // TODO: check this implementation
  /*   static validation(errors: any[]) {
    return translateValidationErrors(errors);
  } */
}
