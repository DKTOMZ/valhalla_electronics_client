export interface CurrencyConvert {
    'from-name': string,
    'from-symbol': string,
    'from-type': string,
    'from-value': string,
    'result': string,
    'result-float': number,
    'to-name': string,
    'to-symbol': string,
    'to-type': string,
    'valid': boolean,
    error?: any,
    'api-error-msg'?: string
}