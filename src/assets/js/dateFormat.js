import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)

export const formatDate = (date, fmt) => {
    return dayjs(date).format(fmt ? fmt : 'MMM D, YYYY')
}

