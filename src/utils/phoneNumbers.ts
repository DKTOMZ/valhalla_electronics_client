interface CountryPhoneNumber {
    countryName: string;
    phoneCode: string;
    regexPattern: string;
    samplePhoneNumber: string,
    maxLength: number
}

export const countryPhoneNumbers: CountryPhoneNumber[] = [
    {
        countryName: "Argentina",
        phoneCode: "+54",
        regexPattern: "^\\+54[0-9]{10}$",
        samplePhoneNumber: "1234567890",
        maxLength: 10
    },
    {
        countryName: "Brazil",
        phoneCode: "+55",
        regexPattern: "^\\+55[0-9]{10,11}$",
        samplePhoneNumber: "1234567890(1)",
        maxLength: 11
    },
    {
        countryName: "Canada",
        phoneCode: "+1",
        regexPattern: "^\\+1([0-9]{7}$|^[0-9]{10}$)",
        samplePhoneNumber: "4165551234",
        maxLength: 10
    },
    {
        countryName: "Egypt",
        phoneCode: "+20",
        regexPattern: "^\\+20[0-9]{7,9}$",
        samplePhoneNumber: "1234567(89)",
        maxLength: 9
    },
    {
        countryName: "France",
        phoneCode: "+33",
        regexPattern: "^\\+33[0-9]{9}$",
        samplePhoneNumber: "123456789",
        maxLength: 9
    },
    {
        countryName: "Ghana",
        phoneCode: "+233",
        regexPattern: "^\\+233[0-9]{5,9}$",
        samplePhoneNumber: "24123(4567)",
        maxLength: 9
    },
    {
        countryName: "Ireland",
        phoneCode: "+353",
        regexPattern: "^\\+353[0-9]{7,11}$",
        samplePhoneNumber: "8712345(6726)",
        maxLength: 11
    },
    {
        countryName: "Kenya",
        phoneCode: "+254",
        regexPattern: "^\\+254[0-9]{10}$",
        samplePhoneNumber: "7123456789",
        maxLength: 10
    },
    {
        countryName: "Netherlands",
        phoneCode: "+31",
        regexPattern: "^\\+31[0-9]{9}$",
        samplePhoneNumber: "612345678",
        maxLength: 9
    },
    {
        countryName: "Nigeria",
        phoneCode: "+234",
        regexPattern: "^\\+234[0-9]{7,10}$",
        samplePhoneNumber: "8123456(789)",
        maxLength: 10
    },
    {
        countryName: "Portugal",
        phoneCode: "+351",
        regexPattern: "^\\+351([0-9]{9}$|^[0-9]{11}$",
        samplePhoneNumber: "91234567881",
        maxLength: 11
    },
    {
        countryName: "Rwanda",
        phoneCode: "+250",
        regexPattern: "^\\+250[0-9]{9}$",
        samplePhoneNumber: "721234567",
        maxLength: 10
    },
    {
        countryName: "Senegal",
        phoneCode: "+221",
        regexPattern: "^\\+221[0-9]{9}$",
        samplePhoneNumber: "701234567",
        maxLength: 9
    },
    {
        countryName: "South Africa",
        phoneCode: "+27",
        regexPattern: "^\\+27[0-9]{9}$",
        samplePhoneNumber: "831234567",
        maxLength: 9
    },
    {
        countryName: "Spain",
        phoneCode: "+34",
        regexPattern: "^\\+34[0-9]{9}$",
        samplePhoneNumber: "912345678",
        maxLength: 9
    },
    {
        countryName: "Tanzania",
        phoneCode: "+255",
        regexPattern: "^\\+255[0-9]{9}$",
        samplePhoneNumber: "712345678",
        maxLength: 9
    },
    {
        countryName: "Uganda",
        phoneCode: "+256",
        regexPattern: "^\\+256[0-9]{9}$",
        samplePhoneNumber: "701234567",
        maxLength: 9
    },
    {
        countryName: "United Kigndom",
        phoneCode: "+44",
        regexPattern: "^\\+44[0-9]{7,12}$",
        samplePhoneNumber: "123456789031",
        maxLength: 12
    },
    {
        countryName: "United States",
        phoneCode: "+1",
        regexPattern: "^\\+1[0-9]{7,10}$",
        samplePhoneNumber: "4155552671",
        maxLength: 10
    },
];
