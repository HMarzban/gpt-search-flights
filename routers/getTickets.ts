import getTickets from '../helpers/getTickets.ts'

export default async (c) => {
  const myinput = {
    OriginAirport: 'Tehran',
    DestAirport: 'Kish island',
    StrDepartDateTime: '2023-06-23',
    StrArriveDateTime: 'NaN-NaN-NaN'
  }
  if (!myinput.StrArriveDateTime) {
    myinput.StrArriveDateTime = 'NaN-NaN-NaN'
  }
  const tickets_round_1 = await getTickets(myinput)
  const tickets_round_2 = await getTickets(myinput, tickets_round_1.SearchId)

  return c.json(tickets_round_2)
}
