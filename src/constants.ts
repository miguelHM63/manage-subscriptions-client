import type { FormRule } from 'antd';

export const REDIRECT_TO_LOCAL_STORAGE_KEY = 'redirectTo';

export const ERROR_NAMESPACES = 'error-codes';

type PredefinedFormRules = FormRule[];
const RULE_REQUIRED: FormRule = { required: true };
export const RULE_WHITESPACE: FormRule = { whitespace: true };
export const REQUIRED: PredefinedFormRules = [RULE_REQUIRED];
export const REQUIRED_TEXT: PredefinedFormRules = [RULE_REQUIRED, RULE_WHITESPACE];

export const LOCAL_STORAGE_USER = 'user';
export const LOCAL_STORAGE_TOKEN = 'token';

/* Date format constants */
export const MONTH_DAY_YEAR_FORMAT = 'MM/DD/YYYY';
export const YEAR_MONTH_DAY_FORMAT = 'YYYY-MM-DD';
export const HOUR_MINUTE_MERIDIEM_FORMAT = 'hh:mm a';
export const HOUR_MINUTE_SECOND = 'HH:mm:ss a';
export const ONLY_DAY_FORMAT = 'dddd';
export const MONTH_DAY_READABLE = 'MMMM, DD';
export const FULL_DATE_TIME_FORMAT = `${MONTH_DAY_YEAR_FORMAT} ${HOUR_MINUTE_MERIDIEM_FORMAT}`;
export const SHORT_DATE_FORMAT = 'M/D/YY';
