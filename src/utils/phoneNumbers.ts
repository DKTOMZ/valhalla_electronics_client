interface CountryPhoneNumber {
    countryName: string;
    phoneCode: string;
    regexPattern: string;
    samplePhoneNumber: string,
    maxLength: number
}

export const countryPhoneNumbers: CountryPhoneNumber[] = [
    {
        countryName: "Kenya",
        phoneCode: "+254",
        regexPattern: "^\\+254[0-9]{9}$",
        samplePhoneNumber: "712345678",
        maxLength: 9
    }
];
