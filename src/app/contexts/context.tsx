// context.tsx
import { FrontendServices } from '@/lib/inversify.config';
import { Cart } from '@/models/cart';
import { CurrenciesType } from '@/models/currencies';
import { CurrencyConvert } from '@/models/currencyConvert';
import { HttpService } from '@/services/httpService';
import { StorageService } from '@/services/storageService';
import React, { createContext, useState, useContext, ReactNode } from 'react';


interface SharedState {
  cart: Cart|null;
  updateCart: (newValue: Cart|null) => void;
  cartSize: number;
  updateCartSize: (newValue: number) => void;
  currency: CurrenciesType | null;
  cartTotal: number,
  updateCartTotal: (newValue: number) => void;
  shippingFee: number,
  updateShippingFee: (newValue: number) => void;
  updateCurrency: (newValue: CurrenciesType|null) => void;
  useCurrentCurrency: (value: number) => number;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

interface SharedStateProvider {
    children: ReactNode
}

/** Provider to wrap the app to make app data available globally. */
export const SharedStateProvider: React.FC<SharedStateProvider> = ({ children }) => {

  const storage = FrontendServices.get<StorageService>('StorageService');
  const http = FrontendServices.get<HttpService>('HttpService');

  const [cart, setCart] = useState<Cart|null>(JSON.parse(storage.getSessionObject('cart')||'null') != 'null' ?  JSON.parse(storage.getSessionObject('cart')||'null')  : null);
  const [cartSize, setCartSize] = useState<number>(parseInt(storage.getSessionObject('cartSize')||'0'));
  const [currency, setCurrency] = useState<CurrenciesType|null>(JSON.parse(storage.getSessionObject('currency')||'null') != 'null' ?  JSON.parse(storage.getSessionObject('currency')||'null')  : null);
  const [currencyRate,setCurrencyRate] = useState<number>(parseInt(storage.getSessionObject('currencyRate')||'0'));
  const [cartTotal,setCartTotal] = useState<number>(parseInt(storage.getSessionObject('cartTotal')||'0'));
  const [shippingFee,setShippingFee] = useState<number>(parseInt(storage.getSessionObject('shippingFee')||'0'))

  const updateCart = (newValue: Cart|null) => {
    setCart(newValue);
    newValue ? storage.setSessionObject('cart', JSON.stringify(newValue)) 
    : storage.setSessionObject('cart',null);
  };

  const updateCartSize = (newValue: number) => {
    setCartSize(newValue);
    storage.setSessionObject('cartSize',newValue);
  }

  const updateCurrency = async(newValue: CurrenciesType|null) => {

    const response = await http.post<CurrencyConvert>(`${process.env.NEXT_PUBLIC_VALHALLA_URL}/api/currency/convert`, 
        JSON.stringify({
          fromValue: 1,
          fromType: currency?.symbol.toUpperCase().toString() || 'KES',
          toType: newValue?.symbol.toUpperCase().toString() || ''
        })
    );
    if(response.status == 200 && response.data ){
      setCurrencyRate(parseFloat(response.data['result-float'].toFixed(2)));
      setCurrency(newValue);
      newValue ? storage.setSessionObject('currency', JSON.stringify(newValue)) 
      : storage.setSessionObject('currency', null);
    } else {
      console.log(response.data.error);
    }
  }

  const useCurrentCurrency = (value: number) => {
    return currencyRate ? parseFloat((currencyRate * value).toFixed(2)) : value;   
  }
  
  const updateCartTotal = (newValue: number) => {
    setCartTotal(newValue);
    storage.setSessionObject('cartTotal',newValue);
  };

  const updateShippingFee = (newValue: number) => {
    setShippingFee(newValue);
    storage.setSessionObject('shippingFee',newValue);
  };

  return (
    <SharedStateContext.Provider value={{ cart, updateCart, cartSize, updateCartSize, currency, cartTotal, updateCartTotal, shippingFee, updateShippingFee, updateCurrency, useCurrentCurrency }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = (): SharedState => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};
