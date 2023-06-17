import axios from 'npm:axios@1.4.0'

const TRIP_IR_API = 'https://gateway.trip.ir/api/LowFareSearch'

const getTickets = async (InputFunc, SearchId = null) => {
  const searchURL = TRIP_IR_API + (SearchId ? `?searchId=${SearchId}` : '')

  let OneWay = true
  if (InputFunc.StrArriveDateTime && SearchId) {
    OneWay = false
  }
  let data = JSON.stringify({
    OriginInformations: [
      {
        StrDepartDateTime: InputFunc.StrDepartDateTime,
        StrArriveDateTime: InputFunc.StrArriveDateTime || 'NaN-NaN-NaN',
        OriginAirport: InputFunc.OriginAirport,
        DestAirport: InputFunc.DestAirport
      }
    ],
    NoOfAdults: '1',
    NoOfChilds: '0',
    NoOfInfants: '0',
    NearByAirport: false,
    IsInternal: 'true',
    OneWay: OneWay,
    VendorExcludeCodes: [],
    VendorPreferenceCodes: [],
    CabinClassType: '100'
  })

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: searchURL,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  }

  const responseTickets = await axios.request(config).catch((error) => {
    console.error(error.message)
  })

  console.info(`searchURL: ${searchURL}, Total: ${responseTickets.data.Total}`)

  return responseTickets.data
}

export default getTickets
