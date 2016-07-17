import moment from 'moment';

export default function generateDateDuration(search) {
  const date = new Date(search);
  const dateArray = search.split('-');
  let nextDate;
  switch (dateArray.length) {
    case 1:
      nextDate = moment(date).add(1, 'years').toDate();
      break;
    case 2:
      nextDate = moment(date).add(1, 'months').toDate();
      break;
    case 3:
      nextDate = moment(date).add(1, 'days').toDate();
      break;
  }
  return {
    date: date,
    nextDate: nextDate
  }
}
