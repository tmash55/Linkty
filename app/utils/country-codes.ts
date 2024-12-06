const countryCodeMap: { [key: string]: string } = {
  "United States": "US",
  US: "US",
  "United Kingdom": "GB",
  UK: "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Japan: "JP",
  China: "CN",
  India: "IN",
  Brazil: "BR",
  // Add more mappings as needed
};

export function getCountryCode(countryName: string): string {
  return countryCodeMap[countryName] || countryName;
}
