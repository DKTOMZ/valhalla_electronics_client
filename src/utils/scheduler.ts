// scheduler.ts
import { CurrencyConvert } from '@/models/currencyConvert';
import { HttpService } from '@/services/httpService';
import { GenericResponse } from '@/models/genericResponse';
import cron from 'node-cron';
import { FrontendServices } from '@/lib/inversify.config';
import { CurrencyRateType } from '@/models/currencyRate';
import { CURRENT_DATE_TIME } from './currentDateTime';

const convertAndUpdateCurrency = async (http: HttpService, fromType: string, toType: string): Promise<boolean> => {
    try {
        const response = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
            JSON.stringify({
                fromValue: 1,
                fromType,
                toType
            })
        );

        if (response.status === 200 && response.data) {
            const updateCurrencyResponse = await http.post<GenericResponse>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/edit`, 
                JSON.stringify({
                    from: fromType,
                    to: toType,
                    rate: response.data['result-float']
                })
            );
            if (updateCurrencyResponse.status === 200) {
                return true;
            } else {
                console.log(updateCurrencyResponse.data.error);
            }
        } else {
            console.log(response.data.error);
        }
    } catch (error) {
        console.error(`Error updating currency from ${fromType} to ${toType}:`, error);
    }
    return false;
};

const scheduler = async () => {
    const http = FrontendServices.get<HttpService>('HttpService');
    // const currenciesToUpdate = [
    //     { from: 'USD', to: 'KES' },
    //     { from: 'USD', to: 'GBP' },
    //     { from: 'KES', to: 'USD' },
    //     { from: 'KES', to: 'GBP' },
    //     { from: 'GBP', to: 'KES' },
    //     { from: 'GBP', to: 'USD' }
    // ];

    try {
        let currenciesToUpdate;

        const response = await http.get<CurrencyRateType[]>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currencyRates/fetch`);

        currenciesToUpdate = response.data.map((r)=>{
            return {
                from: r.from,
                to: r.to
            }
        });
        
        let updatedCurrencies = 0;

        for (const { from, to } of currenciesToUpdate) {
            if (await convertAndUpdateCurrency(http, from, to)) {
                updatedCurrencies++;
            }
        }
    
        console.log(`${updatedCurrencies} Currencies refreshed at:`, CURRENT_DATE_TIME());
    } catch (error:any) {
        console.log("Failed to fetch existing currencyRates from database: " + error);
    }
    
};

const job = cron.schedule('0 0 * * *', scheduler); // Runs everyday at 12 AM
const job2 = cron.schedule('0 12 * * *', scheduler); // Runs everyday at 12 PM

// noinspection JSUnusedGlobalSymbols
const schedule = {
    async onStart() {
        job.start();
        job2.start();
        console.log('Currency Rate Scheduler started...');
    },
};

// Start the cron job when the Next.js app starts
export default schedule;
