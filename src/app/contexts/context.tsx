// context.tsx
import { Cart } from '@/models/cart';
import { Category } from '@/models/categories';
import { CurrenciesType } from '@/models/currencies';
import { CurrencyRateType } from '@/models/currencyRate';
import { PromocodeType } from '@/models/promocode';
import { countryPhoneNumbers } from "@/utils/phoneNumbers";
import React, { createContext, useState, useContext, ReactNode } from 'react';


interface SharedState {
  cart: Cart|null;
  setCart: React.Dispatch<React.SetStateAction<Cart|null>>;
  cartSize: number;
  setCartSize: React.Dispatch<React.SetStateAction<number>>;
  currency: CurrenciesType | null;
  setInitialCurrency: (newValue: CurrenciesType|null) => void;
  updateCurrency: (newValue: CurrenciesType|null) => Promise<void>;
  currencies: CurrenciesType[];
  setCurrencies: React.Dispatch<React.SetStateAction<CurrenciesType[]>>;
  cartTotal: number,
  setCartTotal: React.Dispatch<React.SetStateAction<number>>;
  shippingFee: number,
  setShippingFee: React.Dispatch<React.SetStateAction<number>>;
  currencyRates: CurrencyRateType[];
  setCurrencyRates: React.Dispatch<React.SetStateAction<CurrencyRateType[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  currentCheckoutTab: number;
  setCurrentCheckoutTab: React.Dispatch<React.SetStateAction<number>>;
  appliedPromocode: PromocodeType|undefined,
  setAppliedPromocode: React.Dispatch<React.SetStateAction<PromocodeType|undefined>>;
  useCurrentCurrency: (value: number) => number;
  countryName: string;
  setCountryName: React.Dispatch<React.SetStateAction<string>>;
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  phoneCode: string;
  setPhoneCode: React.Dispatch<React.SetStateAction<string>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  postalCode: string;
  setPostalCode: React.Dispatch<React.SetStateAction<string>>;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

interface SharedStateProvider {
    children: ReactNode
}

/** Provider to wrap the app to make app data available globally. */
export const SharedStateProvider: React.FC<SharedStateProvider> = ({ children }) => {

  const [cart, setCart] = useState<Cart|null>(null);
  const [cartSize, setCartSize] = useState<number>(0);
  const [currency, setCurrency] = useState<CurrenciesType|null>(null);
  const [currencyRate,setCurrencyRate] = useState<number>(1);
  const [cartTotal,setCartTotal] = useState<number>(0);
  const [shippingFee,setShippingFee] = useState<number>(0);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRateType[]>([]);
  const [currentCheckoutTab, setCurrentCheckoutTab] = useState<number>(0);
  const [appliedPromocode, setAppliedPromocode] = useState<PromocodeType>();
  const [currencies, setCurrencies] = useState<CurrenciesType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countryName, setCountryName] = useState<string>(countryPhoneNumbers[0].countryName);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneCode, setPhoneCode] = useState<string>(countryPhoneNumbers[0].phoneCode);
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  const setInitialCurrency = (newValue: CurrenciesType|null) => {
    setCurrency(newValue);
  }

  const updateCurrency = async(newValue: CurrenciesType|null) => {
    setCurrency(newValue);
    if(newValue?.shortName != 'KES') {
      const TOKES = currencyRates.filter((rate)=>rate.from==currency?.shortName && rate.to=='KES');
      TOKES && TOKES.length > 0 && setCurrencyRate(TOKES[0].rate);
      const TONEWVALUE = currencyRates.filter((rate)=>rate.from=='KES' && rate.to==newValue?.shortName);
      TONEWVALUE && TONEWVALUE.length > 0 && setCurrencyRate(TONEWVALUE[0].rate);
    } else {
    }
  }

  const useCurrentCurrency = (value: number) => {
    if(currency?.shortName == 'KES'){
      return value;
    } else {
      return parseFloat((currencyRate * value).toFixed(2));
    }
  }

  return (
    <SharedStateContext.Provider value={{ cart, setCart, cartSize, setCartSize, currency, setInitialCurrency, updateCurrency, cartTotal, setCartTotal, shippingFee, setShippingFee, currencyRates, setCurrencyRates, currentCheckoutTab, setCurrentCheckoutTab, appliedPromocode, setAppliedPromocode, useCurrentCurrency, currencies, setCurrencies, categories, setCategories
      , countryName, setCountryName, firstName, setFirstName, lastName, setLastName, phoneNumber, setPhoneNumber, phoneCode, setPhoneCode, address, setAddress, city, setCity, postalCode, setPostalCode
     }}>
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
