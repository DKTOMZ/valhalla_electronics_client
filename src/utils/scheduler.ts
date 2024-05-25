// scheduler.ts
import { CurrencyConvert } from '@/models/currencyConvert';
import { HttpService } from '@/services/httpService';
import { GenericResponse } from '@/models/genericResponse';
import { Container } from 'inversify';
import cron from 'node-cron';
import { FrontendServices } from '@/lib/inversify.config';

//const { FrontendServices } : { FrontendServices: Container } = require('@/lib/inversify.config');

const scheduler = async() => {

    const http = FrontendServices.get<HttpService>('HttpService');
    let updatedCurrencies = 0;
    
    const response = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
        JSON.stringify({
        fromValue: 1,
        fromType: 'USD',
        toType: 'KES'
        })
    );
    
    if(response.status == 200 && response.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'USD',
            to: 'KES',
            rate: response.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response.data.error);
    }

    const response2 = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
    JSON.stringify({
    fromValue: 1,
    fromType: 'USD',
    toType: 'GBP'
    })
    );
    
    if(response2.status == 200 && response2.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'USD',
            to: 'GBP',
            rate: response2.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response2.data.error);
    }

    const response3 = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
    JSON.stringify({
    fromValue: 1,
    fromType: 'KES',
    toType: 'USD'
    })
    );
    
    if(response3.status == 200 && response3.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'KES',
            to: 'USD',
            rate: response3.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response3.data.error);
    }

    const response4 = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
    JSON.stringify({
    fromValue: 1,
    fromType: 'KES',
    toType: 'GBP'
    })
    );
    
    if(response4.status == 200 && response4.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'KES',
            to: 'GBP',
            rate: response4.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response4.data.error);
    }

    const response5 = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
    JSON.stringify({
    fromValue: 1,
    fromType: 'GBP',
    toType: 'KES'
    })
    );
    
    if(response5.status == 200 && response5.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'GBP',
            to: 'KES',
            rate: response5.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response5.data.error);
    }

    const response6 = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
    JSON.stringify({
    fromValue: 1,
    fromType: 'GBP',
    toType: 'USD'
    })
    );
    
    if(response6.status == 200 && response6.data ){
        const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`,JSON.stringify({
            from: 'GBP',
            to: 'USD',
            rate: response6.data['result-float']
        }));
        if(updateCurrencyResponse.status == 200){
            updatedCurrencies++;
        } else {
            console.log(updateCurrencyResponse.data.error);
        }
    } else {
        console.log(response6.data.error);
    }

    console.log(`${updatedCurrencies} Currencies refreshed at:`, new Date());
};

const job = // Schedule the task to run every 12 hours
cron.schedule('0 */12 * * *', scheduler);

// Start the cron job when the Next.js app starts
export default {
    async onStart() {
        job.start();
        console.log('Currency Rate Scheduler started...');
    },
};